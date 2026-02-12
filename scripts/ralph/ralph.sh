#!/bin/bash
# Ralph Wiggum - Long-running AI agent loop for VETTR Web App
# Usage: ./ralph.sh [--model <model>] [max_iterations]
set -e

MODEL="claude-sonnet-4-5"
MAX_ITERATIONS=70

while [[ $# -gt 0 ]]; do
  case $1 in
    --model) MODEL="$2"; shift 2 ;;
    *) [[ "$1" =~ ^[0-9]+$ ]] && MAX_ITERATIONS="$1"; shift ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"

# Initialize progress file if not exists
[ ! -f "$PROGRESS_FILE" ] && {
  echo "# VETTR Web App - Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
}

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Ralph Wiggum - VETTR Web App Builder            ║"
echo "║  Model: $MODEL"
echo "║  Max Iterations: $MAX_ITERATIONS"
echo "║  Project: $PROJECT_DIR"
echo "╚══════════════════════════════════════════════════╝"
echo ""

cd "$PROJECT_DIR"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "======================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS - $(date '+%H:%M:%S')"
  echo "======================================================="

  OUTPUT=$(claude --dangerously-skip-permissions --model "$MODEL" --print < "$SCRIPT_DIR/CLAUDE.md" 2>&1 | tee /dev/stderr) || true

  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║  🎉 Ralph completed ALL tasks!                   ║"
    echo "╚══════════════════════════════════════════════════╝"
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
