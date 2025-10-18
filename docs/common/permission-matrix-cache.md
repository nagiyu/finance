# 権限マトリックスのキャッシュ管理

## 概要

権限マトリックスシステムでは、パフォーマンスを向上させるためにキャッシュを使用しています。同時に、権限が更新された際には最新の情報が反映されるよう、適切なキャッシュ無効化を実装しています。

## 問題の背景

以前のバージョンでは、以下の問題がありました：

1. **権限マトリックスを更新しても、再読み込みすると古い状態に戻る**
   - サーバー側でキャッシュがなかったため、毎回DBから取得していた
   - しかし、クライアント側（ブラウザ）でAPIレスポンスがキャッシュされていた
   - 権限を更新しても、ブラウザが古いキャッシュを使用していた

2. **権限を変更しても反映されない**
   - 例: StockChart のゲスト権限を View に変更しても、ゲストでアクセスすると権限エラーになる
   - 原因: 更新後にキャッシュがクリアされていなかった

## 実装されたソリューション

### 1. サーバー側キャッシュ

`PermissionMatrixService` にインメモリキャッシュを実装しました。

**特徴**:
- キャッシュ有効期限: 5分（300秒）
- 権限マトリックス更新時に自動的にクリア
- 削除時にも自動的にクリア

**実装箇所**: `client/finance/services/auth/PermissionMatrixService.ts`

```typescript
export default class PermissionMatrixService {
  private static readonly CACHE_TTL = 300; // 5分
  private static cachedMatrix: PermissionMatrix | null = null;
  private static cacheTimestamp: number | null = null;

  /**
   * 権限マトリックスを取得
   * DBに存在しない場合はデフォルトマトリックスを返す
   * キャッシュを使用してパフォーマンスを向上
   */
  public static async getPermissionMatrix(): Promise<PermissionMatrix> {
    // キャッシュが有効な場合はキャッシュから返す
    if (this.isCacheValid()) {
      return this.cachedMatrix!;
    }

    // DBから取得してキャッシュに保存
    const dataAccessor = new PermissionMatrixDataAccessor();
    const record = await dataAccessor.getById(this.PERMISSION_MATRIX_ID);
    const matrix = record?.Matrix || this.getDefaultMatrix();
    
    this.cachedMatrix = matrix;
    this.cacheTimestamp = Date.now();
    
    return matrix;
  }

  /**
   * 権限マトリックスを更新
   * 注意: 権限チェックは AuthorizationService で行う必要がある
   * 
   * @param matrix 新しい権限マトリックス
   */
  public static async updatePermissionMatrix(matrix: PermissionMatrix): Promise<void> {
    const dataAccessor = new PermissionMatrixDataAccessor();
    
    // DB更新
    await dataAccessor.update(this.PERMISSION_MATRIX_ID, { Matrix: matrix });
    
    // 更新後、キャッシュをクリア
    this.clearCache();
  }

  /**
   * キャッシュをクリア
   */
  public static clearCache(): void {
    this.cachedMatrix = null;
    this.cacheTimestamp = null;
  }
}
```

### 2. クライアント側キャッシュの無効化

#### 2.1 APIレスポンスヘッダー

権限関連のAPIエンドポイントに、ブラウザキャッシュを無効化するヘッダーを追加しました。

**対象API**:
- `/api/permission-matrix` (GET)
- `/api/auth/check-permission` (POST)

**実装**:
```typescript
return new Response(JSON.stringify({ Success: true, Data: response }), {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});
```

#### 2.2 フェッチリクエストの設定

すべてのクライアント側のフェッチリクエストに `cache: 'no-store'` を追加しました。

**対象ファイル**:
- `app/hooks/usePermission.ts`
- `app/components/FeatureGuard.tsx`
- `app/permission-admin/page.tsx`

**実装例**:
```typescript
const response = await fetch('/api/auth/check-permission', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestBody),
  cache: 'no-store', // ブラウザキャッシュを無効化
});
```

#### 2.3 タイムスタンプパラメータ

権限管理画面では、追加のキャッシュバスティング手法としてタイムスタンプパラメータを使用しています。

```typescript
const timestamp = new Date().getTime();
const response = await fetch(`/api/permission-matrix?t=${timestamp}`, {
  cache: 'no-store',
});
```

### 3. 権限管理画面での自動更新

権限マトリックスを保存した後、自動的に最新のデータを再取得するようにしました。

**実装箇所**: `app/permission-admin/page.tsx`

```typescript
const handleSave = async (updatedMatrix: PermissionMatrix) => {
  // 権限マトリックスを保存
  await fetch('/api/permission-matrix', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matrix: updatedMatrix }),
  });

  // 保存成功後、最新のデータを再取得
  await fetchMatrix();
  alert('権限マトリックスを保存しました。変更が反映されました。');
};
```

## キャッシュフロー

### 権限マトリックス取得時

```
クライアント → API → PermissionMatrixService
                          ↓
                   キャッシュチェック
                          ↓
                    有効? → Yes → キャッシュから返す
                     ↓ No
                     ↓
                  DB取得 → キャッシュに保存 → 返却
```

### 権限マトリックス更新時

```
クライアント → API → PermissionMatrixService
                          ↓
                      DB更新
                          ↓
                  キャッシュクリア
                          ↓
                  成功レスポンス
                          ↓
              クライアントで再取得
                          ↓
                  最新データ表示
```

## パフォーマンスへの影響

### メリット

1. **DB アクセスの削減**
   - キャッシュ導入前: 権限チェックのたびにDB アクセス
   - キャッシュ導入後: 5分間はキャッシュから取得（DB アクセスなし）

2. **レスポンス時間の短縮**
   - DB アクセス: 数十～数百ミリ秒
   - キャッシュアクセス: 1ミリ秒未満

3. **スケーラビリティの向上**
   - 同時アクセスが多い場合でもDB負荷が低い

### デメリットと対策

1. **更新の遅延**
   - 問題: キャッシュ有効期限内は古いデータが使用される可能性
   - 対策: 更新時に即座にキャッシュをクリア

2. **メモリ使用量**
   - 問題: 権限マトリックスをメモリに保持
   - 影響: 権限マトリックスのサイズは小さい（数KB程度）ため、影響は軽微

## トラブルシューティング

### 権限が反映されない場合

1. **サーバー側のキャッシュをクリア**
   ```typescript
   PermissionMatrixService.clearCache();
   ```

2. **ブラウザのキャッシュをクリア**
   - ハードリロード: Ctrl+Shift+R (Windows/Linux) または Cmd+Shift+R (Mac)
   - ブラウザの開発者ツールで「Disable cache」を有効化

3. **APIレスポンスを確認**
   - ブラウザの開発者ツール → Network タブ
   - `/api/permission-matrix` と `/api/auth/check-permission` のレスポンスヘッダーを確認
   - `Cache-Control: no-store` が設定されているか確認

### デバッグ方法

1. **サーバー側ログ**
   ```typescript
   console.log('Cache valid:', this.isCacheValid());
   console.log('Cached matrix:', this.cachedMatrix);
   console.log('Cache timestamp:', this.cacheTimestamp);
   ```

2. **クライアント側ログ**
   ```typescript
   console.log('Fetching permission matrix...');
   console.log('Response:', await response.json());
   ```

## ベストプラクティス

1. **権限マトリックスの更新**
   - 必ず権限管理画面から更新する
   - 更新後、変更が反映されたことを確認する

2. **開発時**
   - ブラウザの開発者ツールで「Disable cache」を有効化
   - キャッシュの影響を最小限にする

3. **本番環境**
   - キャッシュは自動的に管理される
   - 特別な操作は不要

## まとめ

権限マトリックスシステムでは、パフォーマンスと整合性のバランスを取るために、適切なキャッシュ戦略を実装しています：

- **サーバー側**: 5分間のインメモリキャッシュでパフォーマンス向上
- **更新時**: 即座にキャッシュをクリアして整合性を保証
- **クライアント側**: ブラウザキャッシュを無効化して常に最新データを取得

これにより、「権限マトリックスを更新しても反映されない」という問題が解決され、システム全体で権限が正しく機能するようになりました。
