# AI Usage Disclosure — Community Events Board

---

## Policy

This project was developed with AI-assisted tooling. The following policy governs how AI tools may be used and how that usage must be disclosed.

### Permitted Uses

- **Planning**: Using AI to help outline architecture, schema decisions, and development phases.
- **Code generation**: Using AI to generate boilerplate, suggest implementations, or write first drafts of functions and components.
- **Debugging**: Using AI to help identify the cause of errors or unexpected behaviour.
- **Documentation**: Using AI to help draft or improve technical documentation.
- **Code review**: Using AI to review code for potential bugs, security issues, or style problems.

### Required Developer Responsibilities

1. **Read and understand all generated code** before committing it. Do not commit code you cannot explain.
2. **Test all generated code** manually and, where applicable, with automated tests. Do not claim a feature works if you have not verified it yourself.
3. **Correct AI errors**. AI tools make mistakes — in logic, in security assumptions, and in understanding your specific requirements. You are responsible for the final output.
4. **Do not fabricate testing results**. If a feature has not been tested, mark it as untested.
5. **Disclose AI usage honestly** in this file at the time of submission.

---

## Actual AI Assistance Log

| Date | Tool | Task | Notes |
|---|---|---|---|
| 2026-10-12 | Kiro (Claude) | Generated initial documentation set (`ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `DESIGN-SYSTEM.md`, `DEVELOPMENT-PLAN.md`, `README.md`) | All content reviewed and adjusted to match actual project state |
| 2026-10-12 | Kiro (Claude) | Implemented Phase 3 authentication: `src/lib/auth.ts`, `src/lib/csrf.ts`, `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/admin/me`, `scripts/seed-admin.ts` | Fixed Zod v4 incompatibility (`required_error` → `.min(1)`); all routes type-checked, linted, built, and live-tested against MongoDB Atlas |

### Example entry format (delete this before submission)

| Date | Tool | Task | Notes |
|---|---|---|---|
| 2026-10-12 | Kiro (Claude) | Generated initial documentation set (`ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `DESIGN-SYSTEM.md`, `DEVELOPMENT-PLAN.md`, `README.md`) | All content reviewed and adjusted to match actual project state |
| 2026-10-14 | Kiro (Claude) | Suggested Mongoose schema for Event model | Reviewed schema, added missing `trim` options, confirmed index design |
| 2026-10-16 | GitHub Copilot | Autocomplete for JWT verify helper | Verified token payload shape, added expiry error handling |

---

## Summary for Submission

> Fill in this section at the end of the project.

- **AI tools used**: *(list tools)*
- **Proportion of code that originated from AI suggestions**: *(rough estimate, e.g. "approximately 30% of boilerplate and utility functions")*
- **Areas where AI was most helpful**: *(e.g. schema design, documentation)*
- **Areas where AI suggestions were incorrect or required significant revision**: *(be honest)*
- **All code committed has been reviewed and understood by**: *(your name)*

---

## Notes on This Document

This document was created at the start of the project to establish expectations. It is intentionally left without fabricated history. The actual usage log must be filled in honestly during development.
