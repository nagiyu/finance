#!/usr/bin/env bash
#
# check-quickstart.sh - Validates development environment startup per component
#
# This script runs setup, typecheck, and test for each component to ensure
# the development environment is properly configured.
#
# Usage:
#   ./check-quickstart.sh
#
# Exit codes:
#   0   All checks passed
#   1   One or more checks failed
#

set -o errexit
set -o pipefail
set -o nounset

#######################################
# Configuration
#######################################
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Components to validate (relative to repo root)
readonly COMPONENTS=(
    "finance"
    "client/finance"
    "server/finance"
)

#######################################
# Logging functions
#######################################
readonly LOG_PREFIX="[check-quickstart]"

log_info() {
    echo "${LOG_PREFIX} [INFO] $(date '+%Y-%m-%d %H:%M:%S') $*"
}

log_error() {
    echo "${LOG_PREFIX} [ERROR] $(date '+%Y-%m-%d %H:%M:%S') $*" >&2
}

log_success() {
    echo "${LOG_PREFIX} [SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') $*"
}

log_section() {
    echo ""
    echo "=========================================="
    echo "$*"
    echo "=========================================="
}

#######################################
# Run a command and track its result
# Arguments:
#   $1 - Component name
#   $2 - Command description
#   $3... - Command to run
# Returns:
#   0 if command succeeded, 1 if failed
#######################################
run_check() {
    local component="$1"
    local description="$2"
    shift 2

    log_info "[${component}] Running: ${description}"

    if "$@"; then
        log_success "[${component}] ${description} passed"
        return 0
    else
        log_error "[${component}] ${description} failed"
        return 1
    fi
}

#######################################
# Validate a single component
# Arguments:
#   $1 - Component path (relative to repo root)
# Returns:
#   0 if all checks passed, 1 if any failed
#######################################
validate_component() {
    local component="$1"
    local component_path="${REPO_ROOT}/${component}"
    local failed=0

    log_section "Validating component: ${component}"

    # Check if component directory exists
    if [[ ! -d "${component_path}" ]]; then
        log_error "Component directory not found: ${component_path}"
        return 1
    fi

    # Check if package.json exists
    if [[ ! -f "${component_path}/package.json" ]]; then
        log_error "package.json not found in: ${component_path}"
        return 1
    fi

    # Change to component directory
    cd "${component_path}"

    # Run setup (npm install)
    if ! run_check "${component}" "npm run setup" npm run setup; then
        failed=1
    fi

    # Run typecheck
    if ! run_check "${component}" "npm run typecheck" npm run typecheck; then
        failed=1
    fi

    # Run tests
    if ! run_check "${component}" "npm test" npm test; then
        failed=1
    fi

    # Return to repo root
    cd "${REPO_ROOT}"

    return ${failed}
}

#######################################
# Main script logic
#######################################
main() {
    local total_failed=0

    log_section "Development Environment Validation"
    log_info "Repository root: ${REPO_ROOT}"
    log_info "Components to validate: ${COMPONENTS[*]}"

    # Validate each component
    for component in "${COMPONENTS[@]}"; do
        if ! validate_component "${component}"; then
            total_failed=$((total_failed + 1))
        fi
    done

    # Summary
    log_section "Validation Summary"

    if [[ ${total_failed} -eq 0 ]]; then
        log_success "All components validated successfully!"
        exit 0
    else
        log_error "${total_failed} component(s) failed validation"
        exit 1
    fi
}

# Run main function
main "$@"
