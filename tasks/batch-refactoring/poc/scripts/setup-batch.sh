#!/bin/bash

# AWS Batch POC - AWS Batch 環境のセットアップスクリプト
# このスクリプトは Compute Environment, Job Queue, Job Definition を作成します

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="finance-notification-poc"

echo "========================================="
echo "AWS Batch POC - AWS Batch 環境セットアップ"
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
    echo "export AWS_REGION=ap-northeast-1 などで設定してください"
    exit 1
fi

echo "使用するリージョン: $AWS_REGION"

# AWS アカウント ID の取得
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS アカウント ID: $AWS_ACCOUNT_ID"
echo ""

# VPC とサブネットの確認
echo -e "${YELLOW}VPC とサブネットの設定を確認中...${NC}"
echo "注意: Fargate を使用するため、パブリックまたはプライベートサブネット (NAT Gateway 経由) が必要です"
echo ""

# デフォルト VPC を取得
DEFAULT_VPC=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query 'Vpcs[0].VpcId' --output text --region "$AWS_REGION")

if [ "$DEFAULT_VPC" = "None" ] || [ -z "$DEFAULT_VPC" ]; then
    echo -e "${RED}Error: デフォルト VPC が見つかりません${NC}"
    echo "VPC ID を手動で指定してください: export VPC_ID=vpc-xxxxxxxx"
    exit 1
fi

VPC_ID="${VPC_ID:-$DEFAULT_VPC}"
echo "使用する VPC: $VPC_ID"

# サブネットを取得 (デフォルト VPC のパブリックサブネット)
SUBNETS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'Subnets[*].SubnetId' \
    --output text \
    --region "$AWS_REGION" | tr '\t' ',')

if [ -z "$SUBNETS" ]; then
    echo -e "${RED}Error: サブネットが見つかりません${NC}"
    exit 1
fi

echo "使用するサブネット: $SUBNETS"

# セキュリティグループの確認 (デフォルト VPC のデフォルトセキュリティグループ)
SECURITY_GROUP=$(aws ec2 describe-security-groups \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=default" \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region "$AWS_REGION")

if [ "$SECURITY_GROUP" = "None" ] || [ -z "$SECURITY_GROUP" ]; then
    echo -e "${RED}Error: セキュリティグループが見つかりません${NC}"
    exit 1
fi

echo "使用するセキュリティグループ: $SECURITY_GROUP"
echo ""

# IAM ロールの ARN を取得
BATCH_EXECUTION_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${PROJECT_NAME}-batch-execution-role"
BATCH_JOB_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${PROJECT_NAME}-batch-job-role"

echo "使用する IAM ロール:"
echo "  Execution Role: $BATCH_EXECUTION_ROLE_ARN"
echo "  Job Role: $BATCH_JOB_ROLE_ARN"
echo ""

# ECR リポジトリ URI を取得
REPOSITORY_NAME="${PROJECT_NAME}-worker"
REPOSITORY_URI=$(aws ecr describe-repositories \
    --repository-names "$REPOSITORY_NAME" \
    --region "$AWS_REGION" \
    --query 'repositories[0].repositoryUri' \
    --output text 2>/dev/null || echo "")

if [ -z "$REPOSITORY_URI" ]; then
    echo -e "${YELLOW}Warning: ECR リポジトリが見つかりません。先に ./setup-ecr.sh を実行してください${NC}"
    REPOSITORY_URI="<ECR_REPOSITORY_URI>"
else
    echo "ECR リポジトリ URI: $REPOSITORY_URI"
fi
echo ""

# 1. Compute Environment の作成
echo -e "${YELLOW}[1/3] Compute Environment を作成中...${NC}"

COMPUTE_ENV_NAME="${PROJECT_NAME}-compute-env"

cat > /tmp/compute-env.json <<EOF
{
  "computeEnvironmentName": "$COMPUTE_ENV_NAME",
  "type": "MANAGED",
  "state": "ENABLED",
  "computeResources": {
    "type": "FARGATE_SPOT",
    "maxvCpus": 4,
    "subnets": [$(echo $SUBNETS | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/')],
    "securityGroupIds": ["$SECURITY_GROUP"]
  }
}
EOF

if aws batch describe-compute-environments \
    --compute-environments "$COMPUTE_ENV_NAME" \
    --region "$AWS_REGION" 2>/dev/null | grep -q "$COMPUTE_ENV_NAME"; then
    echo "  Compute Environment $COMPUTE_ENV_NAME は既に存在します"
else
    aws batch create-compute-environment \
        --cli-input-json file:///tmp/compute-env.json \
        --region "$AWS_REGION" > /dev/null
    echo -e "  ${GREEN}✓${NC} Compute Environment 作成完了: $COMPUTE_ENV_NAME"
    
    # Compute Environment が VALID 状態になるまで待機
    echo "  Compute Environment が有効になるまで待機中..."
    aws batch wait compute-environment-ready \
        --compute-environments "$COMPUTE_ENV_NAME" \
        --region "$AWS_REGION" 2>/dev/null || sleep 10
fi

COMPUTE_ENV_ARN=$(aws batch describe-compute-environments \
    --compute-environments "$COMPUTE_ENV_NAME" \
    --region "$AWS_REGION" \
    --query 'computeEnvironments[0].computeEnvironmentArn' \
    --output text)

echo "  Compute Environment ARN: $COMPUTE_ENV_ARN"
echo ""

# 2. Job Queue の作成
echo -e "${YELLOW}[2/3] Job Queue を作成中...${NC}"

JOB_QUEUE_NAME="${PROJECT_NAME}-job-queue"

cat > /tmp/job-queue.json <<EOF
{
  "jobQueueName": "$JOB_QUEUE_NAME",
  "state": "ENABLED",
  "priority": 1,
  "computeEnvironmentOrder": [
    {
      "order": 1,
      "computeEnvironment": "$COMPUTE_ENV_ARN"
    }
  ]
}
EOF

if aws batch describe-job-queues \
    --job-queues "$JOB_QUEUE_NAME" \
    --region "$AWS_REGION" 2>/dev/null | grep -q "$JOB_QUEUE_NAME"; then
    echo "  Job Queue $JOB_QUEUE_NAME は既に存在します"
else
    aws batch create-job-queue \
        --cli-input-json file:///tmp/job-queue.json \
        --region "$AWS_REGION" > /dev/null
    echo -e "  ${GREEN}✓${NC} Job Queue 作成完了: $JOB_QUEUE_NAME"
fi

JOB_QUEUE_ARN=$(aws batch describe-job-queues \
    --job-queues "$JOB_QUEUE_NAME" \
    --region "$AWS_REGION" \
    --query 'jobQueues[0].jobQueueArn' \
    --output text)

echo "  Job Queue ARN: $JOB_QUEUE_ARN"
echo ""

# 3. Job Definition の作成
echo -e "${YELLOW}[3/3] Job Definition を作成中...${NC}"

JOB_DEFINITION_NAME="${PROJECT_NAME}-worker"

cat > /tmp/job-definition.json <<EOF
{
  "jobDefinitionName": "$JOB_DEFINITION_NAME",
  "type": "container",
  "platformCapabilities": ["FARGATE"],
  "containerProperties": {
    "image": "$REPOSITORY_URI:latest",
    "fargatePlatformConfiguration": {
      "platformVersion": "LATEST"
    },
    "resourceRequirements": [
      {
        "type": "VCPU",
        "value": "0.25"
      },
      {
        "type": "MEMORY",
        "value": "512"
      }
    ],
    "executionRoleArn": "$BATCH_EXECUTION_ROLE_ARN",
    "jobRoleArn": "$BATCH_JOB_ROLE_ARN",
    "environment": [
      {
        "name": "PROCESS_ENV",
        "value": "development"
      },
      {
        "name": "AWS_REGION",
        "value": "$AWS_REGION"
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/aws/batch/$PROJECT_NAME",
        "awslogs-region": "$AWS_REGION",
        "awslogs-stream-prefix": "worker"
      }
    }
  },
  "retryStrategy": {
    "attempts": 3,
    "evaluateOnExit": [
      {
        "action": "RETRY",
        "onStatusReason": "Task failed to start"
      },
      {
        "action": "EXIT",
        "onReason": "*"
      }
    ]
  }
}
EOF

# CloudWatch Logs グループの作成
aws logs create-log-group \
    --log-group-name "/aws/batch/$PROJECT_NAME" \
    --region "$AWS_REGION" 2>/dev/null || echo "  CloudWatch Logs グループは既に存在します"

# Job Definition を登録
JOB_DEFINITION_ARN=$(aws batch register-job-definition \
    --cli-input-json file:///tmp/job-definition.json \
    --region "$AWS_REGION" \
    --query 'jobDefinitionArn' \
    --output text)

echo -e "  ${GREEN}✓${NC} Job Definition 登録完了: $JOB_DEFINITION_NAME"
echo "  Job Definition ARN: $JOB_DEFINITION_ARN"

# クリーンアップ
rm -f /tmp/compute-env.json /tmp/job-queue.json /tmp/job-definition.json

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}AWS Batch 環境のセットアップが完了しました${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "作成されたリソース:"
echo "  1. Compute Environment: $COMPUTE_ENV_NAME"
echo "  2. Job Queue: $JOB_QUEUE_NAME"
echo "  3. Job Definition: $JOB_DEFINITION_NAME (Revision: 1)"
echo ""
echo "テストジョブの投入方法:"
echo "  aws batch submit-job \\"
echo "    --job-name test-job-\$(date +%s) \\"
echo "    --job-queue $JOB_QUEUE_NAME \\"
echo "    --job-definition $JOB_DEFINITION_NAME \\"
echo "    --container-overrides '{\"environment\":[{\"name\":\"NOTIFICATION_ID\",\"value\":\"test-123\"}]}' \\"
echo "    --region $AWS_REGION"
echo ""
echo "次のステップ: Worker コンテナをビルドして ECR にプッシュしてください"
