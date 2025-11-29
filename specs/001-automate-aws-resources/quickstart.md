# Quickstart（日本語）

## 前提
- AWS アカウントと適切な権限（CloudFormation スタック作成、ECR、Lambda、CloudFront、IAM）があること
- `aws` CLI、`docker` がローカルにインストールされていること
- リポジトリの命名規約に従う（ECR 名、Lambda 名など）

## CI 経由での一括プロビジョニング（推奨）
1. ブランチを作成してプッシュする（例）:

```bash
git checkout -b 001-automate-aws-resources
git push origin 001-automate-aws-resources
```

2. GitHub Actions がトリガーされ、CloudFormation スタック作成→ECR作成→イメージビルド→ECRへpush→Lambda更新→CloudFront配備 が実行されます。

3. CI のログと CloudFormation 出力を確認してください。ヘルスチェック例:

```bash
# 例: CloudFront 経由のエンドポイントに GET を投げて 200 を確認
curl -I https://your-cloudfront-domain.example.com/health
```

## ローカルから手動で試す手順
1. ローカルで ECR にログイン（aws-cli v2）:

```bash
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.ap-northeast-1.amazonaws.com
```

2. イメージをビルドしタグ付けして push:

```bash
docker build -t finance-client:latest ./client
docker tag finance-client:latest <ACCOUNT>.dkr.ecr.ap-northeast-1.amazonaws.com/finance-client:latest
docker push <ACCOUNT>.dkr.ecr.ap-northeast-1.amazonaws.com/finance-client:latest
```

3. CloudFormation テンプレートを使ってデプロイ（ローカル検証用）:

```bash
aws cloudformation deploy \
  --stack-name finance-stacks-001 \
  --template-file deploy/cloudformation/main.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Env=dev
```

4. デプロイ後の検証:
- CloudFormation の出力に ECR リポジトリ名、Lambda 名、CloudFront ドメインが含まれることを確認
- `curl` で client のヘルスチェック（CloudFront または Function URL）を実行して 200 を受け取る

## クリーンアップ
- スタックを削除するには:

```bash
aws cloudformation delete-stack --stack-name finance-stacks-001
```

注意: CloudFront の削除は時間がかかる場合があります。
