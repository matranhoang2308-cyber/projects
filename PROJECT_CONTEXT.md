# Project Context — CRM AKH

## Purpose

This document defines the architecture, philosophy, and working principles of the CRM AKH project.

This is **NOT** a technical documentation.

This is the project constitution that every AI agent (Antigravity, Codex, Claude, GPT...) must understand before generating UI or modifying the codebase.

The objective is to keep the project consistent over time while reducing duplicated UI, inconsistent layouts, and unnecessary refactoring.

---

# Project Philosophy

This project follows three core principles.

## 1. Reuse before Create

Always reuse existing project assets before creating anything new.

Priority:

Existing Component

↓

Existing Layout

↓

Existing Pattern

↓

Appminis Design System

↓

Create New

Never create a new component if an equivalent already exists.

---

## 2. Consistency over Creativity

The objective of this project is not visual creativity.

The objective is consistency.

Every screen should feel like part of the same product.

Avoid introducing new visual styles unless explicitly requested.

---

## 3. Small Changes

Only modify what is required.

Avoid refactoring unrelated areas.

Avoid changing surrounding layouts.

Avoid changing existing interaction patterns.

---

# Project Architecture

The CRM project consists of two layers.

Layer 1

Current CRM Project

Contains:

* Business logic
* Existing components
* Existing pages
* Existing routing

Layer 2

Appminis Design System

Contains:

* Foundation
* Components
* Layouts
* Patterns
* Guidelines

The Design System defines standards.

The CRM project implements business requirements.

---

# Design System Relationship

The Appminis Design System is the only UI reference.

Never use Metronic directly.

Never create visual styles from scratch.

Every UI decision should first be validated against the Design System.

---

# Existing Project Priority

Before creating UI:

Search the project.

Questions to answer:

Does this component already exist?

Does this layout already exist?

Does this table already exist?

Does this chart already exist?

Does this form already exist?

If yes,

reuse it.

Do not recreate it.

---

# Reading Workflow

Before every UI task:

Read:

AGENTS.md

↓

AI_WORKFLOW.md

↓

README

↓

README_LEARNING_PATH

↓

Pattern

↓

Layout

↓

Component

↓

Foundation

↓

Guideline

Only then begin implementation.

---

# Screen Classification

Every task must first identify the screen category.

Possible categories include:

* Dashboard
* Report
* List Page
* Detail Page
* Form
* Table
* Chart
* Modal
* Drawer
* Authentication
* Settings
* Empty State

Never skip this classification step.

---

# UI Decision Flow

Every UI decision must follow:

Understand the task

↓

Identify screen type

↓

Search existing implementation

↓

Read Design System

↓

Reuse

↓

Implement

↓

Self Review

Never implement before searching existing project assets.

---

# Existing Component Rule

If an existing component satisfies the requirement,

reuse it.

Do not duplicate.

Do not rename.

Do not rebuild.

---

# Existing Layout Rule

If an existing layout already follows the Design System,

keep it.

Only modify the required section.

Avoid rebuilding complete pages.

---

# Existing Style Rule

Always preserve:

Typography

Spacing

Radius

Shadow

Elevation

Color

Do not introduce a second visual language.

---

# Refactoring Policy

Refactoring is prohibited unless explicitly requested.

Never:

Rename components.

Move folders.

Split files.

Merge files.

Replace architecture.

Unless the task specifically requires it.

---

# Design System Update Policy

The Design System is maintained independently.

Project tasks must never modify:

appminis-design-system/

unless explicitly instructed.

If improvements are discovered,

document them separately.

Do not modify the repository automatically.

---

# Self Review Checklist

Before finishing any UI task, verify:

✓ Existing components reused

✓ Existing layouts preserved

✓ Design System followed

✓ No duplicated UI

✓ No hardcoded visual style

✓ No unnecessary refactoring

✓ No unrelated file modifications

✓ Scope respected

Only complete the task when every item above is satisfied.

---

# Project Goal

The long-term goal of this project is:

Build every CRM screen using a unified Design System.

Every AI agent should produce predictable, reusable, maintainable, and consistent UI.

The project should evolve without fragmenting its visual language or architecture.

Consistency is always more valuable than creativity.
