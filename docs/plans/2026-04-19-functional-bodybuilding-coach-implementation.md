# Functional Bodybuilding Coach Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile functional bodybuilding coaching app with authentication, multi-step onboarding, personalized daily training, workout logging, adaptive next-day programming, and a polished premium mobile interface.

**Architecture:** The app will use the existing Expo Router mobile scaffold, Manus OAuth for authentication, and local persistence for training state, onboarding data, logs, and adaptation signals. The UI will be organized around a lightweight app state provider plus focused utility modules that generate periodized daily training and update future prescriptions based on adherence, fatigue, soreness, pain, and session quality.

**Tech Stack:** Expo Router, React Native, TypeScript, NativeWind, React Context, AsyncStorage, Manus OAuth, Vitest.

---

### Task 1: Stabilize the scaffold and inspect runtime wiring

**Files:**

- Modify: `/home/ubuntu/functional-bodybuilding-coach/server/_core/storageProxy.ts`
- Modify: `/home/ubuntu/functional-bodybuilding-coach/todo.md`
- Test: `/home/ubuntu/functional-bodybuilding-coach/tests/scaffold.health.test.ts`

**Step 1: Write the failing test**

Create a basic test that verifies the app utility layer can import cleanly and that the current scaffold type issue is exposed during `pnpm check`.

**Step 2: Run test to verify it fails**

Run: `cd /home/ubuntu/functional-bodybuilding-coach && pnpm test tests/scaffold.health.test.ts`

Expected: fail or error for the current scaffold issue.

**Step 3: Write minimal implementation**

Fix the typing issue in `server/_core/storageProxy.ts` without broad refactoring.

**Step 4: Run test to verify it passes**

Run: `cd /home/ubuntu/functional-bodybuilding-coach && pnpm test tests/scaffold.health.test.ts && pnpm check`

Expected: test passes and TypeScript succeeds.

**
