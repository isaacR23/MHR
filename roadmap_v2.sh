#!/usr/bin/env bash
# roadmap_v2.sh — Generate a roadmap using Cursor CLI agent (agent_code.sh).
# Outputs: roadmap.txt (or roadmap (1).txt, …) and roadmap_planning1.txt at workspace root.
# Usage: ./roadmap_v2.sh "Your migration goal here"

set -euo pipefail

CLI_AGENT="${CLI_AGENT:-cursor}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_SCRIPT="$SCRIPT_DIR/cursor_cli/agent_code.sh"

if [[ ! -x "$AGENT_SCRIPT" ]]; then
  echo "Error: agent script not found or not executable: $AGENT_SCRIPT" >&2
  exit 1
fi

# Run from workspace root so the agent has project context and files are created there
WORKSPACE_ROOT="${WORKSPACE_ROOT:-$PWD}"
cd "$WORKSPACE_ROOT"

# Compute output path: roadmap.txt, or roadmap (1).txt, roadmap (2).txt, ...
if [[ -n "${ROADMAP_FILE:-}" ]]; then
  : # User set ROADMAP_FILE; use as-is
else
  ROADMAP_FILE="roadmap.txt"
  n=1
  while [[ -f "$ROADMAP_FILE" ]]; do
    ROADMAP_FILE="roadmap ($n).txt"
    n=$((n + 1))
  done
fi

USER_INPUT="${1:-}"
if [[ -z "$USER_INPUT" ]]; then
  read -rp "Enter your migration goal: " USER_INPUT
fi

PROMPT="${USER_INPUT}

Produce a roadmap only. Structure it with clearly numbered phases (Phase 1, Phase 2, …).
Each phase should have: Goal, Scope, Key Tasks, Success Criteria.
Output the roadmap as plain text (no code blocks).
Write the roadmap to the file: $ROADMAP_FILE"

echo "Running Cursor agent (CLI: $CLI_AGENT)..."
agent_json=$("$AGENT_SCRIPT" "$PROMPT" "$CLI_AGENT" 2>&1 | tee /dev/stderr | tail -n 1)

# Optional: parse and show stats from agent JSON
if echo "$agent_json" | jq -e . >/dev/null 2>&1; then
  tools=$(echo "$agent_json" | jq -r '.tools // 0')
  total_chars=$(echo "$agent_json" | jq -r '.total_chars // 0')
  time_ms=$(echo "$agent_json" | jq -r '.time // "?"')
  echo ""
  echo "Agent finished: $tools tools, ${total_chars} chars, $time_ms"
fi

if [[ -f "$ROADMAP_FILE" ]]; then
  cp "$ROADMAP_FILE" "roadmap_planning1.txt"
  echo "Roadmap saved → $ROADMAP_FILE"
  echo "Planning copy  → roadmap_planning1.txt"
else
  echo "Note: Agent ran but $ROADMAP_FILE was not created (agent may have written elsewhere)." >&2
  exit 1
fi
