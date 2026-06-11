# Blank GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a visually blank web page from `E:\FEATHER` to a new GitHub repository and return the public GitHub Pages URL.

**Architecture:** The site is a static single-file page served by GitHub Pages from the repository root on the `main` branch. The local repository will push to a new GitHub remote, then Pages will publish the root `index.html`.

**Tech Stack:** Git, GitHub web UI, GitHub Pages, HTML.

---

### Task 1: Local Blank Page

**Files:**
- Create: `E:\FEATHER\index.html`
- Modify: local Git branch name

- [ ] **Step 1: Rename the branch to `main`**

Run:

```powershell
git branch -M main
```

Expected: command exits successfully and `git branch --show-current` prints `main`.

- [ ] **Step 2: Create the blank page**

Create `E:\FEATHER\index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title></title>
  </head>
  <body></body>
</html>
```

- [ ] **Step 3: Verify the file content**

Run:

```powershell
Get-Content -Path .\index.html
```

Expected: the file contains the exact HTML from Step 2 and no visible body content.

- [ ] **Step 4: Commit the blank page and plan**

Run:

```powershell
git add index.html docs/superpowers/plans/2026-06-11-blank-github-pages.md
git commit -m "Add blank GitHub Pages site"
```

Expected: Git creates a commit containing `index.html` and this plan.

### Task 2: GitHub Repository

**Files:**
- Modify: GitHub repository settings through browser
- Modify: local Git remote configuration

- [ ] **Step 1: Create a new GitHub repository**

The user creates a public repository named `FEATHER` in the GitHub web UI. Do not initialize it with a README, license, or `.gitignore`, because the local repository already has commits.

Expected: GitHub shows an empty repository page with push instructions.

- [ ] **Step 2: Add the remote**

After the user provides the exact HTTPS repository URL, add it as `origin`. The command must use the complete URL copied from GitHub, such as `https://github.com/account-name/FEATHER.git`.

```powershell
git remote add origin https://github.com/account-name/FEATHER.git
```

Expected: `git remote -v` shows `origin` pointing at the new GitHub repository.

- [ ] **Step 3: Push the local branch**

Run:

```powershell
git push -u origin main
```

Expected: Git pushes `main` and sets upstream tracking. If Git Credential Manager prompts for authentication, complete the GitHub sign-in flow.

### Task 3: GitHub Pages Publication

**Files:**
- Modify: GitHub Pages repository settings through browser

- [ ] **Step 1: Enable GitHub Pages**

Open the repository settings in GitHub, go to Pages, and configure Pages to deploy from branch `main` and folder `/root`.

Expected: GitHub shows a Pages site URL for the repository.

- [ ] **Step 2: Verify the published page**

Open the GitHub Pages URL.

Expected: the page loads successfully and is visually blank.

- [ ] **Step 3: Report the URL**

Return the public URL in the final response.
