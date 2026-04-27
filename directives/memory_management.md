# Memory Management Directive

This directive defines how the agent (Antigravity) manages long-term memory using the Mempalace MCP server.

## Goal
Ensure all important technical decisions, database changes, and resolved bugs are persisted for future sessions without explicit user intervention.

## Instructions
1. **Post-Task Summarization**: After completing a significant task or resolving a bug, the agent must automatically summarize the key findings.
2. **Recording to Mempalace**:
    - Use `mcp_mempalace_mempalace_kg_add` for structured facts (e.g., "Project X uses Supabase").
    - Use `mcp_mempalace_mempalace_diary_write` for chronological logs of work and learnings.
    - Use `mcp_mempalace_mempalace_add_drawer` for verbatim code snippets or long context that might be needed later.
3. **AAAK Format**: When writing to the diary, use the AAAK compressed format as specified in the Mempalace toolset.

## Edge Cases
- If the task was trivial (e.g., fix a typo), skip recording to avoid clutter.
- If unsure if a piece of information is "important," ask the user.
