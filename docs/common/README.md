# Common Module

アプリケーション全体で共有される基盤機能とユーティリティを提供するモジュールです。

## 概要

Common モジュールは以下の主要機能を提供します：

- **AWS サービス統合**: DynamoDB、Secrets Manager との連携
- **認証システム**: ユーザー認証と権限管理
- **データアクセス基盤**: CRUD操作の統一インターフェース
- **ユーティリティ関数**: 日付、時間、通貨、通知などの汎用機能
- **エラーハンドリング**: 統一されたエラー処理システム

## 主要コンポーネント

### AWS Integration

#### DynamoDBUtil
DynamoDB の操作を統一化するユーティリティクラスです。

**主要メソッド:**
- `getAllByDataType<T>(tableName, dataType)`: データタイプ別の全件取得
- `create<T>(tableName, record)`: レコード作成
- `update<T>(tableName, id, dataType, record)`: レコード更新  
- `delete(tableName, id, dataType)`: レコード削除

#### SecretsManagerUtil
AWS Secrets Manager からのシークレット取得を行います。

```typescript
const secretValue = await SecretsManagerUtil.getSecretValue(secretName, key);
```

### Data Access Foundation

#### DataAccessorBase
すべてのデータアクセスクラスの基底クラスです。

**機能:**
- DynamoDB テーブルとの統一的なインターフェース
- CRUD操作の基本実装
- データタイプ管理

#### CRUDServiceBase
ビジネスロジックレイヤーの基底クラスです。

**機能:**
- データ変換（Data ↔ Record）
- CRUD操作のサービスレイヤー実装
- エラーハンドリング

### Utilities

#### EnvironmentalUtil
実行環境の管理を行います。

```typescript
const env = EnvironmentalUtil.GetProcessEnv(); // 'local' | 'development' | 'production'
```

#### DateUtil & TimeUtil
日付・時間操作のユーティリティです。

**機能:**
- 日付フォーマット
- タイムゾーン処理
- 日付計算
- 時間間隔の計算

#### CurrencyUtil
通貨関連の操作を提供します。

**機能:**
- 通貨フォーマット
- 為替レート計算
- 通貨コード管理

#### NotificationUtil
通知機能の統一インターフェースです。

**機能:**
- プッシュ通知
- メール通知
- アプリ内通知

#### AuthorizeUtil
認証・認可の処理を行います。

**機能:**
- ユーザー権限チェック
- ロールベースアクセス制御
- セッション管理

#### CacheUtil
キャッシュ機能を提供します。

**機能:**
- メモリキャッシュ
- 期限付きキャッシュ
- キャッシュ無効化

#### ErrorUtil
エラーハンドリングの統一化を行います。

```typescript
ErrorUtil.throwError('Error message'); // 統一されたエラー送出
```

#### CommonUtil
その他の汎用ユーティリティ機能です。

## Authentication System

### Auth Services
認証サービスの基盤実装を提供します。

**コンポーネント:**
- ユーザー認証
- セッション管理
- 権限管理
- パスワード処理

### Interface Types

#### AuthDataType
認証データの基本インターフェースです。

```typescript
interface AuthDataType {
  id: string;
  username: string;
  roles: string[];
  // ... 他の認証関連フィールド
}
```

## 型システム

### Interface Definitions

#### SubscriptionType
購読・通知タイプの定義です。

#### TimeType
時間関連の型定義です。

### Constants

#### EnvironmentalConst
環境定数の管理です。

```typescript
type ProcessEnvType = 'local' | 'development' | 'production';
```

## 依存関係

### External Dependencies

**AWS SDK:**
- `@aws-sdk/client-dynamodb`: DynamoDB クライアント
- `@aws-sdk/client-secrets-manager`: Secrets Manager クライアント
- `@aws-sdk/util-dynamodb`: DynamoDB ユーティリティ

**Utility Libraries:**
- `dayjs`: 日付・時間操作
- `node-fetch`: HTTP リクエスト

### Development Dependencies
- `@types/node`: Node.js 型定義
- `@types/node-fetch`: node-fetch 型定義

## 設定とカスタマイズ

### Environment Variables

| Variable | Description | Values |
|----------|-------------|--------|
| `PROCESS_ENV` | 実行環境 | `local`, `development`, `production` |
| `AWS_REGION` | AWS リージョン | `ap-northeast-1` など |

### AWS Configuration

**DynamoDB:**
- 適切な IAM ロールと権限
- テーブル設計に応じたインデックス設定

**Secrets Manager:**
- シークレットの階層的な管理
- 環境別のシークレット分離

## アーキテクチャパターン

### データアクセスパターン

```
Application Layer
    ↓
Service Layer (CRUDServiceBase)
    ↓  
Data Access Layer (DataAccessorBase)
    ↓
AWS DynamoDB
```

### 認証・認可パターン

```
Client Request
    ↓
AuthorizeUtil (権限チェック)
    ↓
Business Logic
    ↓
Data Access
```

### エラーハンドリングパターン

```
Error Occurrence
    ↓
ErrorUtil (統一エラー処理)
    ↓
Logging & Notification
    ↓
Client Response
```

## 使用例

### データアクセス

```typescript
import DataAccessorBase from '@common/services/DataAccessorBase';

class MyDataAccessor extends DataAccessorBase<MyRecordType> {
  constructor() {
    super('MyTable', 'MyDataType');
  }
}

const accessor = new MyDataAccessor();
const records = await accessor.get();
```

### 環境別設定

```typescript
import EnvironmentalUtil from '@common/utils/EnvironmentalUtil';

const getTableName = () => {
  const env = EnvironmentalUtil.GetProcessEnv();
  switch (env) {
    case 'production':
      return 'ProdTable';
    case 'development':
      return 'DevTable';
    default:
      return 'LocalTable';
  }
};
```

### 日付処理

```typescript
import DateUtil from '@common/utils/DateUtil';
import TimeUtil from '@common/utils/TimeUtil';

const formattedDate = DateUtil.format(new Date(), 'YYYY-MM-DD');
const timeString = TimeUtil.getCurrentTimeString();
```

## テスト戦略

### Unit Testing
- 各ユーティリティクラスの単体テスト
- モックを使用したAWS サービステスト
- 型安全性のテスト

### Integration Testing  
- DynamoDB との統合テスト
- Secrets Manager との統合テスト
- 認証フローのテスト

## パフォーマンス考慮事項

### キャッシュ戦略
- CacheUtil による効率的なキャッシュ
- AWS サービス呼び出しの最小化
- メモリ効率的なデータ構造

### AWS 最適化
- DynamoDB の読み取り・書き込みキャパシティの調整
- バッチ操作の活用
- IAM ロールの最小権限

## セキュリティ

### 認証・認可
- 多層防御による権限管理
- セッション管理の安全性
- 入力値検証

### AWS セキュリティ
- IAM ロールベースアクセス制御
- Secrets Manager による機密情報管理
- VPC エンドポイントの活用（必要に応じて）

## 関連ドキュメント

- [Server Documentation](./server/README.md) - サーバーサイド実装
- [Client Documentation](./client/README.md) - クライアントサイド実装
- [Finance Module](../finance/README.md) - Finance モジュール連携