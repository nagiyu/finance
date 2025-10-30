#!/bin/bash

# AWS Batch POC - VPC とネットワークリソースのセットアップスクリプト
# このスクリプトは VPC、サブネット、インターネットゲートウェイ、セキュリティグループを作成します

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="finance-notification-poc"

echo "========================================="
echo "AWS Batch POC - VPC ネットワークセットアップ"
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

# 1. VPC の作成
echo -e "${YELLOW}[1/5] VPC を作成中...${NC}"

VPC_NAME="${PROJECT_NAME}-vpc"
VPC_CIDR="10.0.0.0/16"

# VPC が既に存在するかチェック
EXISTING_VPC=$(aws ec2 describe-vpcs \
    --filters "Name=tag:Name,Values=$VPC_NAME" \
    --query 'Vpcs[0].VpcId' \
    --output text \
    --region "$AWS_REGION" 2>/dev/null || echo "None")

if [ "$EXISTING_VPC" != "None" ] && [ -n "$EXISTING_VPC" ]; then
    echo "  VPC $VPC_NAME は既に存在します"
    VPC_ID="$EXISTING_VPC"
else
    VPC_ID=$(aws ec2 create-vpc \
        --cidr-block "$VPC_CIDR" \
        --region "$AWS_REGION" \
        --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$VPC_NAME},{Key=Project,Value=FinanceNotification}]" \
        --query 'Vpc.VpcId' \
        --output text)
    
    # DNS ホスト名を有効化
    aws ec2 modify-vpc-attribute \
        --vpc-id "$VPC_ID" \
        --enable-dns-hostnames \
        --region "$AWS_REGION"
    
    echo -e "  ${GREEN}✓${NC} VPC 作成完了: $VPC_ID"
fi

echo "  VPC ID: $VPC_ID"
echo ""

# 2. インターネットゲートウェイの作成とアタッチ
echo -e "${YELLOW}[2/5] インターネットゲートウェイを作成中...${NC}"

IGW_NAME="${PROJECT_NAME}-igw"

# IGW が既に存在するかチェック
EXISTING_IGW=$(aws ec2 describe-internet-gateways \
    --filters "Name=tag:Name,Values=$IGW_NAME" \
    --query 'InternetGateways[0].InternetGatewayId' \
    --output text \
    --region "$AWS_REGION" 2>/dev/null || echo "None")

if [ "$EXISTING_IGW" != "None" ] && [ -n "$EXISTING_IGW" ]; then
    echo "  インターネットゲートウェイ $IGW_NAME は既に存在します"
    IGW_ID="$EXISTING_IGW"
else
    IGW_ID=$(aws ec2 create-internet-gateway \
        --region "$AWS_REGION" \
        --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$IGW_NAME},{Key=Project,Value=FinanceNotification}]" \
        --query 'InternetGateway.InternetGatewayId' \
        --output text)
    
    # VPC にアタッチ
    aws ec2 attach-internet-gateway \
        --vpc-id "$VPC_ID" \
        --internet-gateway-id "$IGW_ID" \
        --region "$AWS_REGION" 2>/dev/null || echo "  既にアタッチされています"
    
    echo -e "  ${GREEN}✓${NC} インターネットゲートウェイ作成完了: $IGW_ID"
fi

echo "  IGW ID: $IGW_ID"
echo ""

# 3. パブリックサブネットの作成 (2つのAZ)
echo -e "${YELLOW}[3/5] パブリックサブネットを作成中...${NC}"

# アベイラビリティゾーンの取得
AZS=($(aws ec2 describe-availability-zones \
    --region "$AWS_REGION" \
    --query 'AvailabilityZones[0:2].ZoneName' \
    --output text))

SUBNET_IDS=()
for i in {0..1}; do
    SUBNET_NAME="${PROJECT_NAME}-public-subnet-${i}"
    SUBNET_CIDR="10.0.$((i * 16)).0/20"
    AZ="${AZS[$i]}"
    
    # サブネットが既に存在するかチェック
    EXISTING_SUBNET=$(aws ec2 describe-subnets \
        --filters "Name=tag:Name,Values=$SUBNET_NAME" \
        --query 'Subnets[0].SubnetId' \
        --output text \
        --region "$AWS_REGION" 2>/dev/null || echo "None")
    
    if [ "$EXISTING_SUBNET" != "None" ] && [ -n "$EXISTING_SUBNET" ]; then
        echo "  サブネット $SUBNET_NAME は既に存在します"
        SUBNET_ID="$EXISTING_SUBNET"
    else
        SUBNET_ID=$(aws ec2 create-subnet \
            --vpc-id "$VPC_ID" \
            --cidr-block "$SUBNET_CIDR" \
            --availability-zone "$AZ" \
            --region "$AWS_REGION" \
            --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$SUBNET_NAME},{Key=Project,Value=FinanceNotification},{Key=Type,Value=Public}]" \
            --query 'Subnet.SubnetId' \
            --output text)
        
        # パブリック IP の自動割り当てを有効化
        aws ec2 modify-subnet-attribute \
            --subnet-id "$SUBNET_ID" \
            --map-public-ip-on-launch \
            --region "$AWS_REGION"
        
        echo -e "  ${GREEN}✓${NC} サブネット作成完了: $SUBNET_ID (AZ: $AZ)"
    fi
    
    SUBNET_IDS+=("$SUBNET_ID")
done

SUBNETS=$(IFS=,; echo "${SUBNET_IDS[*]}")
echo "  サブネット: $SUBNETS"
echo ""

# 4. ルートテーブルの作成と設定
echo -e "${YELLOW}[4/5] ルートテーブルを設定中...${NC}"

RT_NAME="${PROJECT_NAME}-public-rt"

# ルートテーブルが既に存在するかチェック
EXISTING_RT=$(aws ec2 describe-route-tables \
    --filters "Name=tag:Name,Values=$RT_NAME" \
    --query 'RouteTables[0].RouteTableId' \
    --output text \
    --region "$AWS_REGION" 2>/dev/null || echo "None")

if [ "$EXISTING_RT" != "None" ] && [ -n "$EXISTING_RT" ]; then
    echo "  ルートテーブル $RT_NAME は既に存在します"
    RT_ID="$EXISTING_RT"
else
    RT_ID=$(aws ec2 create-route-table \
        --vpc-id "$VPC_ID" \
        --region "$AWS_REGION" \
        --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$RT_NAME},{Key=Project,Value=FinanceNotification}]" \
        --query 'RouteTable.RouteTableId' \
        --output text)
    
    # インターネットゲートウェイへのルートを追加
    aws ec2 create-route \
        --route-table-id "$RT_ID" \
        --destination-cidr-block "0.0.0.0/0" \
        --gateway-id "$IGW_ID" \
        --region "$AWS_REGION" 2>/dev/null || echo "  ルートは既に存在します"
    
    echo -e "  ${GREEN}✓${NC} ルートテーブル作成完了: $RT_ID"
fi

# サブネットとルートテーブルを関連付け
for SUBNET_ID in "${SUBNET_IDS[@]}"; do
    aws ec2 associate-route-table \
        --route-table-id "$RT_ID" \
        --subnet-id "$SUBNET_ID" \
        --region "$AWS_REGION" 2>/dev/null || echo "  サブネット $SUBNET_ID は既に関連付けられています"
done

echo "  ルートテーブル ID: $RT_ID"
echo ""

# 5. セキュリティグループの作成
echo -e "${YELLOW}[5/5] セキュリティグループを作成中...${NC}"

SG_NAME="${PROJECT_NAME}-sg"
SG_DESCRIPTION="Security group for Finance Notification POC"

# セキュリティグループが既に存在するかチェック
EXISTING_SG=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=$SG_NAME" "Name=vpc-id,Values=$VPC_ID" \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region "$AWS_REGION" 2>/dev/null || echo "None")

if [ "$EXISTING_SG" != "None" ] && [ -n "$EXISTING_SG" ]; then
    echo "  セキュリティグループ $SG_NAME は既に存在します"
    SG_ID="$EXISTING_SG"
else
    SG_ID=$(aws ec2 create-security-group \
        --group-name "$SG_NAME" \
        --description "$SG_DESCRIPTION" \
        --vpc-id "$VPC_ID" \
        --region "$AWS_REGION" \
        --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$SG_NAME},{Key=Project,Value=FinanceNotification}]" \
        --query 'GroupId' \
        --output text)
    
    # アウトバウンドルールはデフォルトで全て許可されている
    # 必要に応じてインバウンドルールを追加（POC では不要）
    
    echo -e "  ${GREEN}✓${NC} セキュリティグループ作成完了: $SG_ID"
fi

echo "  セキュリティグループ ID: $SG_ID"
echo ""

# 設定ファイルの出力
CONFIG_FILE="/tmp/${PROJECT_NAME}-vpc-config.env"
cat > "$CONFIG_FILE" <<EOF
# AWS Batch POC VPC Configuration
# このファイルは setup-batch.sh で自動的に読み込まれます

export VPC_ID="$VPC_ID"
export SUBNETS="$SUBNETS"
export SECURITY_GROUP="$SG_ID"
EOF

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}VPC ネットワークのセットアップが完了しました${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "作成されたリソース:"
echo "  VPC: $VPC_ID ($VPC_CIDR)"
echo "  インターネットゲートウェイ: $IGW_ID"
echo "  サブネット: $SUBNETS"
echo "  ルートテーブル: $RT_ID"
echo "  セキュリティグループ: $SG_ID"
echo ""
echo "設定ファイル: $CONFIG_FILE"
echo ""
echo "次のステップ: ./setup-batch.sh を実行してください"
