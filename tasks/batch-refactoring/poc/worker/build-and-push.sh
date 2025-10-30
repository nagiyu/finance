#!/bin/bash

# Worker コンテナのビルドとプッシュスクリプト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="finance-notification-poc"
REPOSITORY_NAME="${PROJECT_NAME}-worker"

echo "========================================="
echo "Worker コンテナのビルドとプッシュ"
echo "========================================="
echo ""

# カラー出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# AWS リージョンの取得
AWS_REGION="${AWS_REGION:-$(aws configure get region)}"
if [ -z "$AWS_REGION" ]; then
    echo -e "${RED}Error: AWS_REGION が設定されていません${NC}"
    exit 1
fi

# AWS アカウント ID の取得
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "AWS アカウント ID: $AWS_ACCOUNT_ID"
echo "リージョン: $AWS_REGION"
echo ""

# ECR リポジトリ URI
REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPOSITORY_NAME}"

echo "リポジトリ URI: $REPOSITORY_URI"
echo ""

# 1. ECR にログイン
echo -e "${YELLOW}[1/3] ECR にログイン中...${NC}"
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo -e "${GREEN}✓${NC} ログイン成功"
echo ""

# 2. Docker イメージのビルド
echo -e "${YELLOW}[2/3] Docker イメージをビルド中...${NC}"
docker build -t $REPOSITORY_NAME:latest .

echo -e "${GREEN}✓${NC} ビルド完了"
echo ""

# 3. イメージにタグ付けとプッシュ
echo -e "${YELLOW}[3/3] イメージをプッシュ中...${NC}"

# latest タグ
docker tag $REPOSITORY_NAME:latest $REPOSITORY_URI:latest
docker push $REPOSITORY_URI:latest

# タイムスタンプタグ（オプション）
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker tag $REPOSITORY_NAME:latest $REPOSITORY_URI:$TIMESTAMP
docker push $REPOSITORY_URI:$TIMESTAMP

echo -e "${GREEN}✓${NC} プッシュ完了"
echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Worker コンテナの準備が完了しました${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "プッシュされたイメージ:"
echo "  $REPOSITORY_URI:latest"
echo "  $REPOSITORY_URI:$TIMESTAMP"
echo ""
echo "次のステップ:"
echo "  1. AWS Batch でテストジョブを実行してください"
echo "  2. CloudWatch Logs でログを確認してください"
