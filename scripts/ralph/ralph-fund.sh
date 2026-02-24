#!/bin/bash
# Ralph Wiggum - VETTR Fundamentals UI Features
# Usage: ./ralph-fund.sh [--model <model>] [max_iterations]
set -e

MODEL="claude-sonnet-4-5"
MAX_ITERATIONS=18

while [[ $# -gt 0 ]]; do
  case $1 in
    --model) MODEL="$2"; shift 2 ;;
    *) [[ "$1" =~ ^[0-9]+$ ]] && MAX_ITERATIONS="$1"; shift ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/fund-prd.json"
PROGRESS_FILE="$SCRIPT_DIR/fund-progress.txt"

# Initialize progress file if not exists
[ ! -f "$PROGRESS_FILE" ] && {
  echo "# VETTR Web App - Fundamentals Features Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
}

echo ""
echo "======================================================="
echo "  Ralph - VETTR Fundamentals UI Features"
echo "  Model: $MODEL"
echo "  Max Iterations: $MAX_ITERATIONS"
echo "  PRD: fund-prd.json (14 stories)"
echo "======================================================="
echo ""

cd "$PROJECT_DIR"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "======================================================="
  echo "  Ralph FUND Iteration $i of $MAX_ITERATIONS - $(date '+%H:%M:%S')"
  echo "======================================================="

  OUTPUT=$(/opt/homebrew/bin/claude --dangerously-skip-permissions --model "$MODEL" --print "Read the file scripts/ralph/fund-CLAUDE.md and follow the instructions in it. IMPORTANT: Use scripts/ralph/fund-prd.json (NOT prd.json or prd-v2.json or vs2-prd.json) to find the next story with passes=false and implement it. Use scripts/ralph/fund-progress.txt for progress logging." 2>&1 | tee /dev/stderr) || true

  if echo "$OUTPUT" | grep -qF 'ALL_STORIES_DONE'; then
    echo ""
    echo "======================================================="
    echo "  Ralph completed ALL Fundamentals UI tasks!"
    echo "======================================================="
    exit 0
  fi

  echo ""
  echo "Iteration $i complete. Continuing to next story..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check $PROGRESS_FILE for status."
exit 1
