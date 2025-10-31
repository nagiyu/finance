# VPC ネットワークセットアップガイド (GUI)

このドキュメントは、AWS マネジメントコンソールを使用して VPC とネットワークリソースを作成する手順を説明します。

---

## 概要

AWS Batch POC 環境では、専用の VPC とネットワークリソースを新規作成します。デフォルトの VPC は使用しません。

作成するリソース:
- VPC (10.0.0.0/16)
- インターネットゲートウェイ
- パブリックサブネット × 2 (異なるアベイラビリティゾーン)
- ルートテーブル
- セキュリティグループ

---

## 1. VPC の作成

### 手順

1. **VPC コンソールを開く**
   - AWS マネジメントコンソールにログイン
   - サービスから「VPC」を選択
   - リージョンが正しいことを確認（例: ap-northeast-1）

2. **VPC の作成を開始**
   - 左メニューから「VPC」を選択
   - 「VPC を作成」ボタンをクリック

3. **VPC 設定**
   - 名前タグ: `finance-notification-poc-vpc`
   - IPv4 CIDR ブロック: `10.0.0.0/16`
   - IPv6 CIDR ブロック: IPv6 CIDR ブロックなし
   - テナンシー: デフォルト

4. **タグ（オプション）**
   - キー: `Project`, 値: `FinanceNotification`

5. **VPC の作成**
   - 「VPC を作成」ボタンをクリック
   - VPC ID をメモしておく（例: vpc-0123456789abcdef0）

6. **DNS ホスト名の有効化**
   - 作成した VPC を選択
   - 「アクション」→「DNS ホスト名を編集」
   - 「DNS ホスト名を有効化」にチェック
   - 「変更を保存」をクリック

---

## 2. インターネットゲートウェイの作成

### 手順

1. **インターネットゲートウェイの作成**
   - 左メニューから「インターネットゲートウェイ」を選択
   - 「インターネットゲートウェイの作成」ボタンをクリック

2. **設定**
   - 名前タグ: `finance-notification-poc-igw`
   - タグ: `Project` = `FinanceNotification`

3. **作成とアタッチ**
   - 「インターネットゲートウェイの作成」をクリック
   - 作成後、「アクション」→「VPC にアタッチ」を選択
   - 先ほど作成した VPC (`finance-notification-poc-vpc`) を選択
   - 「インターネットゲートウェイのアタッチ」をクリック

---

## 3. サブネットの作成

2つのアベイラビリティゾーンにパブリックサブネットを作成します。

### サブネット 1

1. **サブネットの作成**
   - 左メニューから「サブネット」を選択
   - 「サブネットを作成」ボタンをクリック

2. **VPC の選択**
   - VPC: `finance-notification-poc-vpc` を選択

3. **サブネット設定**
   - サブネット名: `finance-notification-poc-public-subnet-0`
   - アベイラビリティゾーン: 最初の AZ を選択（例: ap-northeast-1a）
   - IPv4 CIDR ブロック: `10.0.0.0/20`

4. **タグ**
   - `Project` = `FinanceNotification`
   - `Type` = `Public`

5. **サブネットを作成**

6. **パブリック IP の自動割り当て**
   - 作成したサブネットを選択
   - 「アクション」→「サブネット設定を変更」
   - 「パブリック IPv4 アドレスの自動割り当てを有効化」にチェック
   - 「保存」をクリック

### サブネット 2

同様の手順で 2 つ目のサブネットを作成:
- サブネット名: `finance-notification-poc-public-subnet-1`
- アベイラビリティゾーン: 2番目の AZ を選択（例: ap-northeast-1c）
- IPv4 CIDR ブロック: `10.0.16.0/20`
- パブリック IP の自動割り当てを有効化

---

## 4. ルートテーブルの作成と設定

### 手順

1. **ルートテーブルの作成**
   - 左メニューから「ルートテーブル」を選択
   - 「ルートテーブルを作成」ボタンをクリック

2. **設定**
   - 名前: `finance-notification-poc-public-rt`
   - VPC: `finance-notification-poc-vpc` を選択
   - タグ: `Project` = `FinanceNotification`

3. **ルートテーブルを作成**

4. **インターネットゲートウェイへのルート追加**
   - 作成したルートテーブルを選択
   - 「ルート」タブを選択
   - 「ルートを編集」ボタンをクリック
   - 「ルートを追加」をクリック
   - 送信先: `0.0.0.0/0`
   - ターゲット: インターネットゲートウェイ (`finance-notification-poc-igw`) を選択
   - 「変更を保存」をクリック

5. **サブネットとの関連付け**
   - 「サブネットの関連付け」タブを選択
   - 「サブネットの関連付けを編集」ボタンをクリック
   - 作成した 2 つのサブネットを選択:
     - `finance-notification-poc-public-subnet-0`
     - `finance-notification-poc-public-subnet-1`
   - 「関連付けを保存」をクリック

---

## 5. セキュリティグループの作成

### 手順

1. **セキュリティグループの作成**
   - 左メニューから「セキュリティグループ」を選択
   - 「セキュリティグループを作成」ボタンをクリック

2. **基本的な詳細**
   - セキュリティグループ名: `finance-notification-poc-sg`
   - 説明: `Security group for Finance Notification POC`
   - VPC: `finance-notification-poc-vpc` を選択

3. **インバウンドルール**
   - POC では特別なインバウンドルールは不要（デフォルトで何も許可しない）

4. **アウトバウンドルール**
   - デフォルトで全てのトラフィックが許可されています（変更不要）

5. **タグ**
   - `Project` = `FinanceNotification`

6. **セキュリティグループを作成**
   - 「セキュリティグループを作成」ボタンをクリック

---

## 作成したリソースの確認

すべてのリソースが正しく作成されたことを確認します:

### 確認項目

1. **VPC**
   - VPC ID: vpc-xxxxxxxxx
   - CIDR: 10.0.0.0/16
   - DNS ホスト名: 有効

2. **インターネットゲートウェイ**
   - IGW ID: igw-xxxxxxxxx
   - 状態: アタッチ済み
   - VPC: finance-notification-poc-vpc

3. **サブネット**
   - サブネット 1: subnet-xxxxxxxxx (10.0.0.0/20, AZ-1a)
   - サブネット 2: subnet-yyyyyyyyy (10.0.16.0/20, AZ-1c)
   - パブリック IP 自動割り当て: 有効

4. **ルートテーブル**
   - RT ID: rtb-xxxxxxxxx
   - ルート: 0.0.0.0/0 → igw-xxxxxxxxx
   - 関連付けられたサブネット: 2 つ

5. **セキュリティグループ**
   - SG ID: sg-xxxxxxxxx
   - VPC: finance-notification-poc-vpc

### リソース ID のメモ

後の手順で使用するため、以下の情報をメモしておきます:

```
VPC_ID=vpc-xxxxxxxxx
SUBNET_1=subnet-xxxxxxxxx
SUBNET_2=subnet-yyyyyyyyy
SECURITY_GROUP=sg-xxxxxxxxx
```

---

## 次のステップ

VPC ネットワークの作成が完了したら、次は IAM ロールを作成します。

→ [IAM セットアップガイド](./iam-setup-guide.md)

AWS Batch のセットアップ時に、作成した VPC、サブネット、セキュリティグループを指定します。

---

**作成日**: 2025年10月30日  
**バージョン**: 1.0
