# Dataset Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the dataset list, creation wizard, and detail page for members 4 and 5.

**Architecture:** Keep the implementation in the existing Vue 3 application and follow the current module layout. Align the dataset API and mock endpoints with the RESTful API document while preserving the existing `/api` request base URL.

**Tech Stack:** Vue 3, TypeScript, Vite, Element Plus, Vue Router, Axios, vite-plugin-mock.

---

## File Structure

- Modify `src/api/dataset.ts` to expose typed RESTful dataset methods.
- Modify `src/mock/index.ts` to provide RESTful dataset mock endpoints.
- Modify `src/router/index.ts` to add the dataset detail route.
- Modify `src/views/Dataset/List.vue` for richer filters, detail navigation, logs, and actions.
- Modify `src/views/Dataset/Create.vue` for a complete three-step creation flow.
- Create `src/views/Dataset/Detail.vue` for member 5 features.

## Tasks

### Task 1: Baseline and API Contract

- [ ] Run `npm install`.
- [ ] Run `npm run build` and record any existing errors.
- [ ] Update `src/api/dataset.ts` with RESTful paths and TypeScript interfaces.
- [ ] Update `src/mock/index.ts` with matching RESTful dataset endpoints.
- [ ] Run `npm run build` again.
- [ ] Commit with `feat: align dataset api mocks`.

### Task 2: Member 4 Dataset List

- [ ] Enhance `src/views/Dataset/List.vue` filters with data source and date range.
- [ ] Add detail navigation and log dialog.
- [ ] Ensure pagination fetches data when page or page size changes.
- [ ] Confirm delete and status actions refresh the list.
- [ ] Run `npm run build`.
- [ ] Commit with `feat: complete dataset list page`.

### Task 3: Member 4 Dataset Creation

- [ ] Load data source options including source type.
- [ ] Add field mapping and filter rule controls.
- [ ] Add schedule controls and source-type-specific options.
- [ ] Validate required fields before moving between wizard steps.
- [ ] Submit data in the documented `collectRules` shape.
- [ ] Run `npm run build`.
- [ ] Commit with `feat: complete dataset create flow`.

### Task 4: Member 5 Dataset Detail

- [ ] Add `/dataset/detail/:id` route.
- [ ] Create `src/views/Dataset/Detail.vue`.
- [ ] Show basic information, fields, samples, versions, and operation controls.
- [ ] Implement compare, rollback, export, label status, and delete interactions using mock APIs.
- [ ] Run `npm run build`.
- [ ] Commit with `feat: add dataset detail page`.

### Task 5: Verification and Local Git Finish

- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start `npm run dev`.
- [ ] Verify dataset list, create wizard, and detail page in the browser.
- [ ] Check `git status --short --branch`.
- [ ] Create a final local commit for any verification fixes.
