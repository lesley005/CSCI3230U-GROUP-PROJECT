# AI-USAGE.md

This file logs every time an AI tool contributed to submitted code in this project.
Add an entry before you commit the AI-assisted code. (Using AI only to learn -
explanations, error messages, design talk - does not need an entry.) See the course AI
policy. Reminder: **milestones 1-2 (weeks 3, 6) must be AI-free** - this file should
be empty until the third milestone.

Also drop a marker where the code lives: `// AI-assisted - see AI-USAGE.md #<n>`.

---

## Entry template (copy for each use)

### #N - <short title>
- **Date:** YYYY-MM-DD
- **Member:** <your name>
- **Tool / model:** <e.g. free-tier assistant> (free models only)
- **Files:** `src/...`, `src/...`
- **Prompt (verbatim):**

  ```
  <paste the exact prompt you gave the AI>
  ```

- **What it produced & what I changed:** <1–3 sentences: did you keep it as-is, edit it,
  rewrite parts? why is it correct?>

---

## Log

<!-- Entries go below, newest last. Example: -->

### #1 - Generate a price-formatting helper
- **Date:** 2026-03-30
- **Member:** Jane Doe
- **Tool / model:** free-tier assistant
- **Files:** `src/utils/format.js`
- **Prompt (verbatim):**

  ```
  Write a JavaScript function formatPrice(cents) that returns a CAD string like "$12.50".
  ```

- **What it produced & what I changed:** Kept the logic; renamed the parameter to match
  our code and added a test. Verified the rounding on a few values.
