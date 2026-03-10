---
name: organize_files
description: Instructions and best practices for organizing codebase files and folders so that AI assistants can easily understand and navigate them.
---

# Organize Files for AI

This skill provides guidelines and actionable steps to structure a project's files and directories to maximize AI code assistants' comprehension and effectiveness.

## Core Principles

1. **Descriptive Naming Conventions**
   - **Files & Folders**: Use clear, unabbreviated names (e.g., `payment_processor.ts` instead of `pay_proc.ts`).
   - **Variables & Functions**: Choose semantic names that describe the exact behavior or data being held.
   - **Markdown (.md) Files**: Must include a number sequence and a timestamp in the file name (e.g., `01_20260307145532_setup_guide.md` or `01-2026-03-07-145532-setup-guide.md`) to maintain chronological order and uniqueness.

2. **Feature-Based Architecture (Colocation)**
   - Group files by feature rather than by file type.
   - _Good_: `/src/features/authentication/` (contains components, hooks, api calls, and types for auth).
   - _Less Good for AI_: `/src/components/`, `/src/hooks/`, `/src/api/` (requires the AI to jump around multiple directories to understand one feature).

3. **Single Responsibility Principle for Files**
   - Keep files focused on a single component, class, or logical unit.
   - If a file exceeds 300-400 lines, consider breaking it down. AI has context windows, and smaller, focused files are easier to ingest and reason about completely.

4. **Strategic Documentation**
   - **Root `README.md`**: Must explain what the project does, the tech stack, and how to start the app.
   - **Folder-level `README.md`**: Inside complex directories, add a small README explaining the folder's purpose and contents.
   - **Docstrings/Comments**: Document the "why" in comments. The AI can read the code to know "what" it does, but relies on comments to understand business logic or strange edge cases.

5. **Type Definitions & Interfaces**
   - Centralize shared types or models in clearly identified files (e.g., `types.ts`, `models.py`).
   - Explicitly type your inputs and outputs. Strong typing heavily improves an AI's ability to reason about data structures.

6. **Shallow Directory Trees**
   - Avoid creating excessively deep folder structures `(e.g., /src/app/modules/core/utils/helpers/formatters/)`. Keep it nested 2-3 levels deep at most.

## Execution Steps for the AI

When tasked with organizing a codebase, follow these steps:

1. **Analyze Current Structure**: Map out the existing directory tree using `list_dir` or similar tree exploration tools.
2. **Identify Clusters**: Find files that are related to the same business feature but are physically separated.
3. **Propose Restructuring**: Create a migration plan (using the `implementation_plan` artifact) detailing which files will move where.
4. **Move Files safely**: Use `run_command` to execute `mv` operations carefully.
5. **Update Imports**: After moving files, utilize `grep_search` to find broken imports and fix them across the codebase using `replace_file_content`.
6. **Add Contextual Docs**: Create folder-level `README.md` files for the newly organized feature modules.

## Enforcing Good Structure in AI Tools

To ensure your favored AI coding assistants consistently follow these architectural guidelines, you must use their specific configuration files or custom instructions. Since AIs default to standard (often "vibe coder") patterns based on their training data, explicit rules override their assumptions.

### 1. Cursor

- **How it works:** Cursor reads a `.cursorrules` file at the root of your project to set global context and constraints for its agents (Composer, Chat, Inline Edits).
- **Implementation:** Create a `.cursorrules` file in your project root and paste the core principles from this skill directly into it.
- **Example Rule:**
  ```markdown
  # Rules

  - Group files by feature (e.g., `/features/auth/`), NEVER by type (`/components/`, `/hooks/`).
  - Strict naming: Do not abbreviate variable or file names.
  - Markdown files must use the format `NN_YYYYMMDDHHMMSS_filename.md`.
  ```

### 2. Claude Code

- **How it works:** Claude Code reads global and project-specific configuration files. You can configure project-specific instructions using the `claude.json` file.
- **Implementation:** Create a `claude.json` (or add to your existing one) in the root directory. Add a custom system prompt or task instructions that enforce feature-bound architecture.
- **Example Rule:**
  ```json
  {
    "customInstructions": "Organize all code by feature domains. Do not create global /components or /hooks folders. Prefix new Markdown files with a sequence number and timestamp."
  }
  ```

### 3. Google Antigravity

- **How it works:** Antigravity relies heavily on specialized `SKILL.md` files located in specific workflow or skill directories (like `docs/skills/`), as well as any custom instructions provided in the system prompt or workspace context.
- **Implementation:** Create a `.antigravity/rules.md` or rely on explicitly calling this very skill (`organize_files`) in your prompts. You can also define custom `<user_rules>` in its configuration.
- **Example Usage:** When prompting Antigravity to create a new module, always prefix with: _"Using the `organize_files` skill, please implement the new feature..."_ This guarantees the agent will fetch and apply these exact instructions before writing code.
