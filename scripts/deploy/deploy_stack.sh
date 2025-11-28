#!/usr/bin/env bash
#
# deploy_stack.sh - AWS CloudFormation stack deployment wrapper
#
# Usage:
#   ./deploy_stack.sh --stack-name <name> --region <region> --template-file <path> [options]
#
# Required parameters:
#   --stack-name <name>       Name of the CloudFormation stack
#   --region <region>         AWS region to deploy to
#   --template-file <path>    Path to the CloudFormation template file
#
# Optional parameters:
#   --parameter-overrides     CloudFormation parameter overrides (Key=Value format)
#   --capabilities            Required capabilities (e.g., CAPABILITY_IAM)
#   --tags                    Tags to apply to the stack (Key=Value format)
#   --no-fail-on-empty        Do not fail on empty changeset
#   --dry-run                 Validate template only, do not deploy
#   -h, --help                Show this help message
#

set -o errexit
set -o pipefail
set -o nounset

#######################################
# Logging functions
#######################################

readonly LOG_PREFIX="[deploy_stack]"

log_info() {
    echo "${LOG_PREFIX} [INFO] $(date '+%Y-%m-%d %H:%M:%S') $*"
}

log_error() {
    echo "${LOG_PREFIX} [ERROR] $(date '+%Y-%m-%d %H:%M:%S') $*" >&2
}

log_warn() {
    echo "${LOG_PREFIX} [WARN] $(date '+%Y-%m-%d %H:%M:%S') $*" >&2
}

log_debug() {
    if [[ "${DEBUG:-}" == "true" ]]; then
        echo "${LOG_PREFIX} [DEBUG] $(date '+%Y-%m-%d %H:%M:%S') $*"
    fi
}

#######################################
# Display usage information
#######################################
usage() {
    cat << EOF
Usage: $(basename "$0") --stack-name <name> --region <region> --template-file <path> [options]

Deploy or update an AWS CloudFormation stack.

Required parameters:
  --stack-name <name>       Name of the CloudFormation stack
  --region <region>         AWS region to deploy to (e.g., us-east-1, ap-northeast-1)
  --template-file <path>    Path to the CloudFormation template file (YAML or JSON)

Optional parameters:
  --parameter-overrides     CloudFormation parameter overrides in Key=Value format
                            Multiple values can be specified (space-separated)
  --capabilities            Required IAM capabilities (space-separated)
                            Valid values: CAPABILITY_IAM, CAPABILITY_NAMED_IAM, CAPABILITY_AUTO_EXPAND
  --tags                    Tags to apply to the stack in Key=Value format
                            Multiple values can be specified (space-separated)
  --no-fail-on-empty        Do not fail if changeset is empty (no changes)
  --dry-run                 Validate the template only without deploying
  -h, --help                Show this help message and exit

Environment variables:
  AWS_ACCESS_KEY_ID         AWS access key ID (optional if using IAM roles)
  AWS_SECRET_ACCESS_KEY     AWS secret access key (optional if using IAM roles)
  AWS_PROFILE               AWS CLI profile to use (optional)
  DEBUG                     Set to 'true' for verbose output

Examples:
  # Deploy a basic stack
  $(basename "$0") --stack-name my-stack --region us-east-1 --template-file infra/cloudformation/base-stack.yml

  # Deploy with parameters and capabilities
  $(basename "$0") --stack-name my-stack --region us-east-1 --template-file base-stack.yml \\
    --parameter-overrides Environment=production \\
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM

  # Dry run to validate template
  $(basename "$0") --stack-name my-stack --region us-east-1 --template-file base-stack.yml --dry-run

Exit codes:
  0   Success
  1   General error or validation failure
  2   Missing required parameters
  3   Template file not found
  4   AWS CLI not found or not configured
  5   Template validation failed
  6   Deployment failed
EOF
}

#######################################
# Validate prerequisites
#######################################
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if aws CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed or not in PATH"
        log_error "Please install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 4
    fi

    # Check AWS CLI version
    local aws_version
    aws_version=$(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)
    log_info "AWS CLI version: ${aws_version}"

    # Check AWS credentials (basic check)
    if ! aws sts get-caller-identity --region "${REGION}" &> /dev/null; then
        log_error "AWS credentials are not configured or are invalid"
        log_error "Please configure credentials using: aws configure"
        log_error "Or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables"
        exit 4
    fi

    log_info "Prerequisites check passed"
}

#######################################
# Validate template file
#######################################
validate_template() {
    local template_file="$1"

    log_info "Validating CloudFormation template: ${template_file}"

    if ! aws cloudformation validate-template \
        --template-body "file://${template_file}" \
        --region "${REGION}" > /dev/null 2>&1; then

        log_error "Template validation failed"
        # Run again to show the actual error
        aws cloudformation validate-template \
            --template-body "file://${template_file}" \
            --region "${REGION}" 2>&1 || true
        exit 5
    fi

    log_info "Template validation passed"
}

#######################################
# Deploy CloudFormation stack
#######################################
deploy_stack() {
    log_info "Starting deployment of stack: ${STACK_NAME}"
    log_info "Region: ${REGION}"
    log_info "Template: ${TEMPLATE_FILE}"

    # Build the deploy command
    local cmd=(
        aws cloudformation deploy
        --stack-name "${STACK_NAME}"
        --template-file "${TEMPLATE_FILE}"
        --region "${REGION}"
    )

    # Add parameter overrides if specified
    if [[ ${#PARAMETER_OVERRIDES[@]} -gt 0 ]]; then
        cmd+=(--parameter-overrides "${PARAMETER_OVERRIDES[@]}")
        log_info "Parameter overrides: ${PARAMETER_OVERRIDES[*]}"
    fi

    # Add capabilities if specified
    if [[ ${#CAPABILITIES[@]} -gt 0 ]]; then
        cmd+=(--capabilities "${CAPABILITIES[@]}")
        log_info "Capabilities: ${CAPABILITIES[*]}"
    fi

    # Add tags if specified
    if [[ ${#TAGS[@]} -gt 0 ]]; then
        cmd+=(--tags "${TAGS[@]}")
        log_info "Tags: ${TAGS[*]}"
    fi

    # Add no-fail-on-empty-changeset if specified
    if [[ "${NO_FAIL_ON_EMPTY}" == "true" ]]; then
        cmd+=(--no-fail-on-empty-changeset)
        log_info "No fail on empty changeset: enabled"
    fi

    log_debug "Command: ${cmd[*]}"

    # Execute the deployment
    log_info "Executing CloudFormation deploy..."
    if "${cmd[@]}"; then
        log_info "Stack deployment completed successfully: ${STACK_NAME}"
    else
        local exit_code=$?
        log_error "Stack deployment failed with exit code: ${exit_code}"
        exit 6
    fi

    # Show stack outputs
    log_info "Fetching stack outputs..."
    aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${REGION}" \
        --query 'Stacks[0].Outputs' \
        --output table 2>/dev/null || log_warn "No outputs found for stack"
}

#######################################
# Main script logic
#######################################
main() {
    # Default values
    STACK_NAME=""
    REGION=""
    TEMPLATE_FILE=""
    PARAMETER_OVERRIDES=()
    CAPABILITIES=()
    TAGS=()
    NO_FAIL_ON_EMPTY="false"
    DRY_RUN="false"

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --stack-name)
                STACK_NAME="$2"
                shift 2
                ;;
            --region)
                REGION="$2"
                shift 2
                ;;
            --template-file)
                TEMPLATE_FILE="$2"
                shift 2
                ;;
            --parameter-overrides)
                shift
                while [[ $# -gt 0 && ! "$1" =~ ^-- ]]; do
                    PARAMETER_OVERRIDES+=("$1")
                    shift
                done
                ;;
            --capabilities)
                shift
                while [[ $# -gt 0 && ! "$1" =~ ^-- ]]; do
                    CAPABILITIES+=("$1")
                    shift
                done
                ;;
            --tags)
                shift
                while [[ $# -gt 0 && ! "$1" =~ ^-- ]]; do
                    TAGS+=("$1")
                    shift
                done
                ;;
            --no-fail-on-empty)
                NO_FAIL_ON_EMPTY="true"
                shift
                ;;
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done

    # Validate required parameters
    local missing_params=()
    
    if [[ -z "${STACK_NAME}" ]]; then
        missing_params+=("--stack-name")
    fi
    
    if [[ -z "${REGION}" ]]; then
        missing_params+=("--region")
    fi
    
    if [[ -z "${TEMPLATE_FILE}" ]]; then
        missing_params+=("--template-file")
    fi

    if [[ ${#missing_params[@]} -gt 0 ]]; then
        log_error "Missing required parameters: ${missing_params[*]}"
        echo ""
        usage
        exit 2
    fi

    # Validate template file exists
    if [[ ! -f "${TEMPLATE_FILE}" ]]; then
        log_error "Template file not found: ${TEMPLATE_FILE}"
        exit 3
    fi

    log_info "=========================================="
    log_info "CloudFormation Stack Deployment"
    log_info "=========================================="

    # Check prerequisites
    check_prerequisites

    # Validate template
    validate_template "${TEMPLATE_FILE}"

    # If dry-run, exit after validation
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "Dry run completed. Template is valid."
        exit 0
    fi

    # Deploy the stack
    deploy_stack

    log_info "=========================================="
    log_info "Deployment completed successfully"
    log_info "=========================================="
}

# Run main function
main "$@"
