#!/bin/bash

# AWS Batch POC - IAM ロールとポリシーのセットアップスクリプト
# このスクリプトは AWS Batch 環境に必要な IAM ロールとポリシーを作成します

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="finance-notification-poc"

echo "========================================="
echo "AWS Batch POC - IAM ロールセットアップ"
echo "========================================="
echo ""

# カラー出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Orchestrator Lambda 実行ロール
echo -e "${YELLOW}[1/3] Orchestrator Lambda 実行ロールを作成中...${NC}"

ORCHESTRATOR_ROLE_NAME="${PROJECT_NAME}-orchestrator-role"

# Trust Policy for Lambda
cat > /tmp/lambda-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# ロールが既に存在するかチェック
if aws iam get-role --role-name "$ORCHESTRATOR_ROLE_NAME" 2>/dev/null; then
    echo "  ロール $ORCHESTRATOR_ROLE_NAME は既に存在します"
else
    aws iam create-role \
        --role-name "$ORCHESTRATOR_ROLE_NAME" \
        --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
        --description "Orchestrator Lambda role for Finance Notification POC"
    echo -e "  ${GREEN}✓${NC} ロール作成完了: $ORCHESTRATOR_ROLE_NAME"
fi

# Orchestrator ポリシーの作成
cat > /tmp/orchestrator-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/Finance",
        "arn:aws:dynamodb:*:*:table/DevFinance"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "batch:SubmitJob",
        "batch:DescribeJobs"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
EOF

ORCHESTRATOR_POLICY_NAME="${PROJECT_NAME}-orchestrator-policy"

# ポリシーをアタッチ
if aws iam get-role-policy --role-name "$ORCHESTRATOR_ROLE_NAME" --policy-name "$ORCHESTRATOR_POLICY_NAME" 2>/dev/null; then
    aws iam put-role-policy \
        --role-name "$ORCHESTRATOR_ROLE_NAME" \
        --policy-name "$ORCHESTRATOR_POLICY_NAME" \
        --policy-document file:///tmp/orchestrator-policy.json
    echo "  ポリシーを更新しました: $ORCHESTRATOR_POLICY_NAME"
else
    aws iam put-role-policy \
        --role-name "$ORCHESTRATOR_ROLE_NAME" \
        --policy-name "$ORCHESTRATOR_POLICY_NAME" \
        --policy-document file:///tmp/orchestrator-policy.json
    echo -e "  ${GREEN}✓${NC} ポリシー作成完了: $ORCHESTRATOR_POLICY_NAME"
fi

# 2. Batch Job 実行ロール
echo -e "${YELLOW}[2/3] Batch Job 実行ロールを作成中...${NC}"

BATCH_JOB_ROLE_NAME="${PROJECT_NAME}-batch-job-role"

# Trust Policy for ECS Tasks
cat > /tmp/ecs-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# ロールが既に存在するかチェック
if aws iam get-role --role-name "$BATCH_JOB_ROLE_NAME" 2>/dev/null; then
    echo "  ロール $BATCH_JOB_ROLE_NAME は既に存在します"
else
    aws iam create-role \
        --role-name "$BATCH_JOB_ROLE_NAME" \
        --assume-role-policy-document file:///tmp/ecs-trust-policy.json \
        --description "Batch Job role for Finance Notification POC"
    echo -e "  ${GREEN}✓${NC} ロール作成完了: $BATCH_JOB_ROLE_NAME"
fi

# Batch Job ポリシーの作成
cat > /tmp/batch-job-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/Finance",
        "arn:aws:dynamodb:*:*:table/DevFinance"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
EOF

BATCH_JOB_POLICY_NAME="${PROJECT_NAME}-batch-job-policy"

# ポリシーをアタッチ
if aws iam get-role-policy --role-name "$BATCH_JOB_ROLE_NAME" --policy-name "$BATCH_JOB_POLICY_NAME" 2>/dev/null; then
    aws iam put-role-policy \
        --role-name "$BATCH_JOB_ROLE_NAME" \
        --policy-name "$BATCH_JOB_POLICY_NAME" \
        --policy-document file:///tmp/batch-job-policy.json
    echo "  ポリシーを更新しました: $BATCH_JOB_POLICY_NAME"
else
    aws iam put-role-policy \
        --role-name "$BATCH_JOB_ROLE_NAME" \
        --policy-name "$BATCH_JOB_POLICY_NAME" \
        --policy-document file:///tmp/batch-job-policy.json
    echo -e "  ${GREEN}✓${NC} ポリシー作成完了: $BATCH_JOB_POLICY_NAME"
fi

# 3. Batch Task 実行ロール (ECR と CloudWatch Logs アクセス用)
echo -e "${YELLOW}[3/3] Batch Task 実行ロールを作成中...${NC}"

BATCH_EXECUTION_ROLE_NAME="${PROJECT_NAME}-batch-execution-role"

# ロールが既に存在するかチェック
if aws iam get-role --role-name "$BATCH_EXECUTION_ROLE_NAME" 2>/dev/null; then
    echo "  ロール $BATCH_EXECUTION_ROLE_NAME は既に存在します"
else
    aws iam create-role \
        --role-name "$BATCH_EXECUTION_ROLE_NAME" \
        --assume-role-policy-document file:///tmp/ecs-trust-policy.json \
        --description "Batch Task Execution role for Finance Notification POC"
    echo -e "  ${GREEN}✓${NC} ロール作成完了: $BATCH_EXECUTION_ROLE_NAME"
fi

# AWS マネージドポリシーをアタッチ (ECR と CloudWatch Logs アクセス)
aws iam attach-role-policy \
    --role-name "$BATCH_EXECUTION_ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy" \
    2>/dev/null || echo "  ポリシーは既にアタッチされています"

echo -e "  ${GREEN}✓${NC} AWS マネージドポリシーをアタッチ完了"

# クリーンアップ
rm -f /tmp/lambda-trust-policy.json /tmp/ecs-trust-policy.json \
      /tmp/orchestrator-policy.json /tmp/batch-job-policy.json

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}IAM ロールのセットアップが完了しました${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "作成されたロール:"
echo "  1. $ORCHESTRATOR_ROLE_NAME"
echo "  2. $BATCH_JOB_ROLE_NAME"
echo "  3. $BATCH_EXECUTION_ROLE_NAME"
echo ""
echo "次のステップ: ./setup-ecr.sh を実行してください"
