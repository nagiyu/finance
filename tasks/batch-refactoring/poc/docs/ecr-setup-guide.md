# ECR セットアップガイド (GUI)

このドキュメントは、AWS マネジメントコンソールを使用して ECR リポジトリを作成する手順を説明します。

---

## 概要

Amazon ECR (Elastic Container Registry) は、Docker コンテナイメージを保存するためのフルマネージド型のコンテナレジストリです。このガイドでは、Worker コンテナイメージ用のリポジトリを作成します。

---

## ECR リポジトリの作成

### 手順

1. **ECR コンソールを開く**
   - AWS マネジメントコンソールにログイン
   - サービスから「Elastic Container Registry」を選択
   - リージョンが正しいことを確認（例: ap-northeast-1）

2. **リポジトリの作成を開始**
   - 「リポジトリを作成」ボタンをクリック

3. **一般設定**
   - 可視性設定: **プライベート**
   - リポジトリ名: `finance-notification-poc-worker`
   - タグのイミュータビリティ: **無効** (開発中は変更可能にする)

4. **イメージスキャン設定**
   - スキャン設定: **プッシュ時にスキャン**
   - スキャンタイプ: **ベーシックスキャン**

5. **暗号化設定**
   - 暗号化設定: **AES-256** (デフォルト)

6. **リポジトリの作成**
   - 「リポジトリを作成」ボタンをクリック

---

## ライフサイクルポリシーの設定

古いイメージを自動的に削除するためのライフサイクルポリシーを設定します。

### 手順

1. **作成したリポジトリを選択**
   - ECR コンソールのリポジトリ一覧から `finance-notification-poc-worker` をクリック

2. **ライフサイクルポリシーの編集**
   - 左メニューから「ライフサイクルポリシー」を選択
   - 「編集」ボタンをクリック

3. **ルールの追加**
   - 「ルールを追加」ボタンをクリック
   - 以下の設定を入力:

   **ルール 1: 最新10個のイメージを保持**
   - ルールの優先度: `1`
   - ルールの説明: `Keep only the last 10 images`
   - イメージのステータス: **任意**
   - 一致基準:
     - タイプ: **イメージ数がこれより多い**
     - 値: `10`
   - アクション: **削除**

4. **ポリシーの保存**
   - 「変更を保存」をクリック

---

## リポジトリ情報の確認

作成したリポジトリの情報を確認し、後の手順で使用します。

### 確認項目

1. **リポジトリ URI**
   - ECR コンソールのリポジトリ詳細ページで URI を確認
   - 形式: `<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/finance-notification-poc-worker`
   - 例: `123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/finance-notification-poc-worker`

2. **リポジトリ ARN**
   - リポジトリの ARN もメモしておきます
   - 形式: `arn:aws:ecr:<REGION>:<ACCOUNT_ID>:repository/finance-notification-poc-worker`

---

## Docker イメージのプッシュ手順

作成したリポジトリに Docker イメージをプッシュする手順です。

### 1. ECR にログイン

```bash
# リージョンとアカウント ID を設定
AWS_REGION=ap-northeast-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# ECR にログイン
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

成功すると `Login Succeeded` と表示されます。

### 2. Docker イメージのビルド

```bash
# Worker ディレクトリに移動
cd ../worker

# イメージをビルド
docker build -t finance-notification-poc-worker:latest .
```

### 3. イメージにタグ付け

```bash
# リポジトリ URI を使用してタグ付け
docker tag finance-notification-poc-worker:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/finance-notification-poc-worker:latest
```

### 4. イメージをプッシュ

```bash
# ECR にプッシュ
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/finance-notification-poc-worker:latest
```

### 5. プッシュの確認

ECR コンソールでイメージがプッシュされたことを確認:

1. ECR コンソールを開く
2. リポジトリ `finance-notification-poc-worker` を選択
3. 「イメージ」タブで、`latest` タグのイメージが表示されることを確認
4. イメージサイズとプッシュ日時を確認

---

## GUI でのプッシュコマンド確認

ECR コンソールから直接プッシュコマンドを確認することもできます:

1. ECR コンソールでリポジトリを選択
2. 「プッシュコマンドを表示」ボタンをクリック
3. 表示されたコマンドをコピーして実行

---

## トラブルシューティング

### ログインエラー

**エラーメッセージ**: `Error: Cannot perform an interactive login from a non TTY device`

**対処法**:
```bash
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

### プッシュエラー

**エラーメッセージ**: `denied: Your authorization token has expired`

**対処法**: ECR に再ログインしてください。

### リージョンエラー

**エラーメッセージ**: `RepositoryNotFoundException`

**対処法**: リージョンが正しいか確認してください。

---

## 次のステップ

ECR リポジトリの作成が完了したら、次は AWS Batch リソースを作成します。

→ [AWS Batch セットアップガイド](./batch-setup-guide.md)

---

**作成日**: 2025年10月30日  
**バージョン**: 1.0
