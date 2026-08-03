# Contributing to VitaMend

Thank you for your interest in contributing to **VitaMend**! Every contribution—whether it's fixing a typo, improving documentation, reporting a bug, or building a new feature—helps reduce medical waste and expand healthcare access.

> **Note:** VitaMend was originally developed during a hackathon and is now actively maintained as an open-source community project.

---

# Table of Contents

* [Ways to Contribute](#ways-to-contribute)
* [Development Environment](#development-environment)
* [Quick Start](#quick-start)
* [Project Structure](#project-structure)
* [Development Workflow](#development-workflow)
* [Branch Naming Conventions](#branch-naming-conventions)
* [Commit Message Guidelines](#commit-message-guidelines)
* [Code Standards](#code-standards)
* [AI-Assisted Contributions](#ai-assisted-contributions)
* [Testing Expectations](#testing-expectations)
* [Documentation Standards](#documentation-standards)
* [Pull Request Process](#pull-request-process)
* [Reporting Bugs](#reporting-bugs)
* [Feature Suggestions](#feature-suggestions)
* [Security Issues](#security-issues)
* [Looking for Your First Contribution?](#looking-for-your-first-contribution)
* [Community Guidelines](#community-guidelines)
* [Contributor License](#contributor-license)
* [Need Help?](#need-help)

---

# Ways to Contribute

There are many ways to help improve VitaMend.

* 🐛 Report bugs
* ✨ Build new features
* 📝 Improve documentation
* 🎨 Suggest UI/UX improvements
* ♿ Improve accessibility
* 🧪 Add or improve tests
* 🔍 Review Pull Requests
* 🌍 Share the project with developers, NGOs, and healthcare communities

Every contribution—big or small—is appreciated.

---

# Development Environment

The project is tested against the following environment:

| Tool    | Version       |
| ------- | ------------- |
| Node.js | >=18.x        |
| npm     | >=9.x         |
| MongoDB | >=7.x         |
| Git     | Latest Stable |

We recommend using the latest Node.js LTS release.

---

# Quick Start

## 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/vitamend-org.git

cd vitamend-org
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and provide the required values.

Example:

```env
MONGODB_URI=
AUTH_SECRET=
AUTH_URL=
GOOGLE_API_KEY=
OPENAI_API_KEY=
```

## 4. Start Development

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

# Project Structure

```
app/                 # Next.js App Router
components/          # Shared UI components
hooks/               # React hooks
lib/                 # Utilities & helpers
models/              # Database models
services/            # Business logic
types/               # TypeScript definitions
public/              # Static assets
scripts/             # Utility scripts
```

Please follow the existing folder structure whenever possible instead of introducing new top-level directories.

---

# Development Workflow

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Run quality checks before committing:

```bash
npm run type-check

npm run lint

npm run build

npm run test

npm run test:e2e
```

If all checks pass, commit your changes and open a Pull Request.

---

# Branch Naming Conventions

| Prefix    | Purpose           | Example                   |
| --------- | ----------------- | ------------------------- |
| feature/  | New feature       | feature/medicine-search   |
| fix/      | Bug fix           | fix/login-session         |
| docs/     | Documentation     | docs/update-readme        |
| refactor/ | Code improvements | refactor/auth-service     |
| test/     | Testing           | test/dashboard            |
| chore/    | Maintenance       | chore/update-dependencies |

---

# Commit Message Guidelines

We follow **Conventional Commits**.

Format:

```text
type(scope): short description
```

Examples:

```text
feat(ocr): add blurry image detection

fix(auth): resolve session refresh issue

docs(readme): improve installation guide

refactor(api): simplify donation service

test(ocr): increase coverage
```

Commit Types:

* feat
* fix
* docs
* style
* refactor
* test
* chore

---

# Code Standards

## TypeScript

* Use TypeScript for all new code.
* Avoid `any`.
* Prefer explicit interfaces and types.
* Keep functions small and reusable.

## React

* Prefer Server Components when appropriate.
* Keep components modular.
* Avoid duplicated logic.

## Styling

* Use Tailwind CSS.
* Follow the existing design system.
* Ensure responsive layouts.
* Maintain accessibility.

## Security

Never commit:

* `.env`
* API keys
* Secrets
* Tokens
* Database credentials

Always validate API input using Zod or equivalent schema validation.

---

# AI-Assisted Contributions

AI coding assistants such as ChatGPT, GitHub Copilot, Claude, and Gemini are welcome during development.

However, contributors remain fully responsible for:

* correctness
* security
* licensing
* testing
* maintainability

All AI-generated code should be reviewed before submission.

---

# Testing Expectations

New features should include appropriate testing.

Whenever applicable:

* Unit Tests
* Integration Tests
* End-to-End Tests

UI changes should also be manually verified across desktop and mobile devices.

---

# Documentation Standards

When introducing new functionality, please update documentation where applicable.

This may include:

* README
* API documentation
* Environment variables
* Screenshots
* Deployment guides

Keeping documentation current is considered part of the contribution.

---

# Pull Request Process

Before opening a Pull Request:

## Sync your branch

```bash
git fetch upstream

git rebase upstream/main
```

## Run the full validation suite

```bash
npm run type-check

npm run lint

npm run build

npm run test
```

## Pull Request Checklist

Please ensure:

* [ ] Code builds successfully
* [ ] Linting passes
* [ ] Tests pass
* [ ] Documentation updated (if needed)
* [ ] Screenshots included for UI changes
* [ ] No secrets committed
* [ ] PR focuses on a single concern

Your Pull Request should include:

* A clear title
* A concise description
* Testing instructions
* Screenshots for UI changes
* Linked issue (if applicable)

Example:

```
Closes #42
```

---

# Reporting Bugs

Please include the following information.

| Field       | Description               |
| ----------- | ------------------------- |
| Summary     | Short description         |
| Steps       | Steps to reproduce        |
| Expected    | Expected behavior         |
| Actual      | Actual behavior           |
| Environment | OS, Browser, Node version |
| Screenshots | Images or logs            |

Well-written bug reports help us resolve issues faster.

---

# Feature Suggestions

We especially welcome ideas related to:

* AI Verification
* OCR Improvements
* Accessibility
* Performance Optimization
* Security
* Localization
* Inventory Management
* NGO Integration
* Healthcare Analytics

For large features, please open a Feature Request before beginning implementation.

---

# Security Issues

**Please do not disclose security vulnerabilities publicly.**

Instead, create a **private GitHub Security Advisory** or contact the maintainers privately.

Examples include:

* Authentication bypass
* API vulnerabilities
* Data exposure
* Privilege escalation
* Sensitive information leaks

Responsible disclosure helps protect users while allowing vulnerabilities to be resolved safely.

---

# Looking for Your First Contribution?

New contributors are always welcome.

Look for issues labeled:

* `good first issue`
* `help wanted`
* `documentation`

These are specifically selected to help new contributors become familiar with the project.

---

# Community Guidelines

Please be:

* Respectful
* Inclusive
* Helpful
* Patient
* Constructive

Harassment, discrimination, personal attacks, or toxic behavior will not be tolerated.

Let's build a welcoming community together.

---

# Contributor License

By submitting a contribution, you agree that your work will be licensed under the project's **MIT License**.

---

# Need Help?

Resources:

* 📖 README.md
* 🚀 DEPLOYMENT.md
* 💬 GitHub Discussions
* 🐞 GitHub Issues

If you're unsure about anything, feel free to start a discussion before opening a Pull Request.

---

# Together, We Can Reduce Medicine Waste

Every bug fixed, every feature added, every line of documentation, and every contribution helps create a safer, more accessible healthcare ecosystem.

Thank you for helping build VitaMend.

**❤️ Building technology that saves medicines—and lives.**
