#!/bin/bash

# AWS Batch POC - ECR リポジトリのセットアップスクリプト
# このスクリプトは Worker コンテナ用の ECR リポジトリを作成します

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="finance-notification-poc"
REPOSITORY_NAME="${PROJECT_NAME}-worker"

echo "========================================="
echo "AWS Batch POC - ECR リポジトリセットアップ"
echo "========================================="
echo ""

# カラー出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# AWS リージョンの取得
AWS_REGION="${AWS_REGION:-$(aws configure get region)}"
if [ -z "$AWS_REGION" ]; then
    echo "Error: AWS_REGION が設定されていません"
    echo "export AWS_REGION=ap-northeast-1 などで設定してください"
    exit 1
fi

echo "使用するリージョン: $AWS_REGION"
echo ""

# AWS アカウント ID の取得
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS アカウント ID: $AWS_ACCOUNT_ID"
echo ""

# ECR リポジトリの作成
echo -e "${YELLOW}[1/2] ECR リポジトリを作成中...${NC}"

if aws ecr describe-repositories --repository-names "$REPOSITORY_NAME" --region "$AWS_REGION" 2>/dev/null; then
    echo "  リポジトリ $REPOSITORY_NAME は既に存在します"
    REPOSITORY_URI=$(aws ecr describe-repositories --repository-names "$REPOSITORY_NAME" --region "$AWS_REGION" --query 'repositories[0].repositoryUri' --output text)
else
    REPOSITORY_URI=$(aws ecr create-repository \
        --repository-name "$REPOSITORY_NAME" \
        --region "$AWS_REGION" \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256 \
        --query 'repository.repositoryUri' \
        --output text)
    echo -e "  ${GREEN}✓${NC} リポジトリ作成完了: $REPOSITORY_NAME"
fi

echo "  リポジトリ URI: $REPOSITORY_URI"

# ライフサイクルポリシーの設定（古いイメージの自動削除）
echo -e "${YELLOW}[2/2] ライフサイクルポリシーを設定中...${NC}"

cat > /tmp/ecr-lifecycle-policy.json <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep only the last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF

aws ecr put-lifecycle-policy \
    --repository-name "$REPOSITORY_NAME" \
    --region "$AWS_REGION" \
    --lifecycle-policy-text file:///tmp/ecr-lifecycle-policy.json \
    > /dev/null

echo -e "  ${GREEN}✓${NC} ライフサイクルポリシー設定完了"

# クリーンアップ
rm -f /tmp/ecr-lifecycle-policy.json

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}ECR リポジトリのセットアップが完了しました${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "リポジトリ情報:"
echo "  名前: $REPOSITORY_NAME"
echo "  URI: $REPOSITORY_URI"
echo "  リージョン: $AWS_REGION"
echo ""
echo "Docker イメージのプッシュ方法:"
echo "  1. ECR にログイン:"
echo "     aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
echo ""
echo "  2. イメージをビルド:"
echo "     docker build -t $REPOSITORY_NAME:latest ./worker"
echo ""
echo "  3. イメージにタグ付け:"
echo "     docker tag $REPOSITORY_NAME:latest $REPOSITORY_URI:latest"
echo ""
echo "  4. イメージをプッシュ:"
echo "     docker push $REPOSITORY_URI:latest"
echo ""
echo "次のステップ: ./setup-batch.sh を実行してください"
