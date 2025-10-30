#!/bin/bash

# AWS Batch POC - メインセットアップスクリプト
# このスクリプトは AWS Batch 環境全体をセットアップします

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================================================"
echo "  AWS Batch POC - 完全セットアップスクリプト"
echo "  Finance Notification システム"
echo "================================================================"
echo ""

# カラー出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 前提条件のチェック
echo -e "${BLUE}[前提条件チェック]${NC}"
echo ""

# AWS CLI のチェック
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI がインストールされていません${NC}"
    echo "AWS CLI をインストールしてください: https://aws.amazon.com/cli/"
    exit 1
fi
echo -e "${GREEN}✓${NC} AWS CLI が利用可能です"

# AWS 認証情報のチェック
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS 認証情報が設定されていません${NC}"
    echo "aws configure を実行して認証情報を設定してください"
    exit 1
fi
echo -e "${GREEN}✓${NC} AWS 認証情報が設定されています"

# リージョンのチェック
AWS_REGION="${AWS_REGION:-$(aws configure get region)}"
if [ -z "$AWS_REGION" ]; then
    echo -e "${YELLOW}Warning: AWS_REGION が設定されていません${NC}"
    echo "デフォルトリージョンを使用します: ap-northeast-1"
    export AWS_REGION="ap-northeast-1"
fi
echo -e "${GREEN}✓${NC} リージョン: $AWS_REGION"

# Docker のチェック
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Warning: Docker がインストールされていません${NC}"
    echo "Worker コンテナのビルドには Docker が必要です"
else
    echo -e "${GREEN}✓${NC} Docker が利用可能です"
fi

echo ""
echo "================================================================"
echo ""

# 確認プロンプト
read -p "セットアップを開始しますか？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "セットアップをキャンセルしました"
    exit 0
fi

echo ""

# セットアップの実行
echo -e "${BLUE}=== ステップ 1/3: IAM ロールのセットアップ ===${NC}"
bash "$SCRIPT_DIR/setup-iam-roles.sh"
echo ""

echo -e "${BLUE}=== ステップ 2/3: ECR リポジトリのセットアップ ===${NC}"
bash "$SCRIPT_DIR/setup-ecr.sh"
echo ""

echo -e "${BLUE}=== ステップ 3/3: AWS Batch 環境のセットアップ ===${NC}"
bash "$SCRIPT_DIR/setup-batch.sh"
echo ""

# 完了メッセージ
echo ""
echo "================================================================"
echo -e "${GREEN}  セットアップが完了しました！${NC}"
echo "================================================================"
echo ""
echo "次のステップ:"
echo ""
echo "1. Worker コンテナのビルドとプッシュ:"
echo "   cd ../worker"
echo "   ./build-and-push.sh"
echo ""
echo "2. Orchestrator Lambda のデプロイ:"
echo "   (既存の Lambda デプロイプロセスに従ってください)"
echo ""
echo "3. EventBridge ルールの作成:"
echo "   AWS コンソールまたは AWS CLI で EventBridge ルールを作成し、"
echo "   Orchestrator Lambda を 1 分ごとにトリガーするように設定してください"
echo ""
echo "4. テストジョブの実行:"
echo "   詳細は docs/batch-setup-guide.md を参照してください"
echo ""
echo "================================================================"
