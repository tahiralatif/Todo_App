---
id: 0001
title: Update Constitution to Phase II
stage: constitution
date: 2026-01-07
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: unknown
user: unknown
command: "/sp.constitution"
labels: ["constitution", "phase-2", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

Phase II — API + Frontend Evolution
From CLI System to Full-Stack AI-Native Application
📌 Repository

GitHub Repository:
https://github.com/tahiralatif/Todo-App

This document defines Phase II of the Todo App project.
Phase II builds on the completed Phase I (CLI, in-memory application) and evolves the system into a full-stack application with a dedicated backend and frontend.

🎯 Purpose of Phase II

The goal of Phase II is to evolve the Todo application from a console-based system into a production-style full-stack architecture, demonstrating:

Backend API design using FastAPI

Frontend application consuming APIs

Proper separation of concerns (backend vs frontend)

Spec-driven, AI-assisted development

Incremental system evolution across phases

Phase II focuses on architecture, contracts, and integration, not just features.

🧭 Phase Boundary Clarification (Critical)

Phase I

CLI-based

In-memory data

Console UI

Fully completed and frozen

Phase II

Web-based system

Backend + Frontend separation

API-driven communication

No CLI usage

🚫 Phase I code must not be modified during Phase II.

🧱 Project Structure (Authoritative)

Phase II must strictly follow this structure:

Phase-2/
├── .claude/
├── .specify/
├── backend/
│   ├── src/
│   ├── tests/
│   ├── .gitignore
│   ├── .python-version
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── README.md
│   └── CLAUDE.md
└── frontend/


No additional top-level folders are allowed unless explicitly introduced in later phases.

🚫 Non-Negotiable Rules
1️⃣ Spec-Driven Development (Mandatory)

Every feature must begin with a written Markdown specification

No implementation is allowed without an approved spec

All changes must be driven by spec updates, not ad-hoc coding

2️⃣ AI-Assisted Implementation

Code generation must be performed using AI tooling (Claude Code)

Manual coding should be minimized and limited to orchestration

Corrections must be achieved by refining specifications

3️⃣ Feature Isolation & Version Control

Each feature must be developed in its own Git branch

Every feature must be merged via a Pull Request

No direct commits to main

4️⃣ Phase Isolation

Phase II must not break or alter Phase I

Backend logic in Phase II is a new implementation, not a copy of CLI code

Conceptual reuse is allowed; direct reuse is not

🧠 Architectural Principles
1️⃣ Backend-First API Design

Backend exposes a clean, documented REST API

Frontend consumes backend APIs exclusively

No shared state between frontend and backend

2️⃣ Object-Oriented Backend Architecture

The backend must:

Use Python classes

Encapsulate domain logic

Avoid monolithic or procedural code

Separate routing, services, and models

3️⃣ Modular & Readable Code

Clear folder responsibilities

Predictable naming conventions

Code should be readable without excessive comments

Designed for future extension (Phase III+)

⚙️ Technology Constraints
Backend

Language: Python 3.13+

Framework: FastAPI

Package Manager: uv

Project Initialization:

uv init


Testing: pytest

API Style: REST (JSON)

Frontend

Framework: Next.js (App Router)

Language: TypeScript

Authentication: Better Auth

Communication: HTTP (REST APIs)

State Management: Local + server-driven state

🔐 Authentication (Phase II Scope)

User authentication is introduced in Phase II

Frontend handles authentication via Better Auth

Backend validates authenticated requests

Authentication is required for all Todo-related operations

🧪 Testing Expectations

Backend must include automated tests

Tests must validate:

API endpoints

Authentication boundaries

Core business logic

Tests are part of the definition of “done”

📈 Evolution Strategy

Phase II is not the final system.

It exists to:

Establish a clean API boundary

Prepare for persistence layers in future phases

Enable scaling to databases, roles, and advanced features

Future phases will extend this architecture without breaking it.

✅ Definition of Done (Phase II)

Phase II is considered complete when:

Backend FastAPI application is functional

Frontend successfully consumes backend APIs

Authentication is implemented and enforced

All features are spec-defined

Tests pass

Phase I remains untouched

🧠 Guiding Principle

“Build systems that evolve cleanly — not code that barely works.”

Phase II prioritizes clarity, structure, and correctness over speed.

## Response snapshot

Updated the project constitution to version 0.2.0, transitioning from Phase I (CLI) to Phase II (API + Frontend Full-Stack). Verified that existing templates (spec, plan, tasks) align with the new principles.

## Outcome

- ✅ Impact: Project core principles and architecture redefined for Phase II full-stack evolution.
- 🧪 Tests: none
- 📁 Files: Updated .specify/memory/constitution.md
- 🔁 Next prompts: Use /sp.specify to start defining the first feature of Phase II.
- 🧠 Reflection: Explicit phase boundaries prevent "code bleeding" from the legacy CLI implementation.

## Evaluation notes (flywheel)

- Failure modes observed: Shell check for git status failed because current working directory is not a git repo (expected in some environment setups).
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): none
