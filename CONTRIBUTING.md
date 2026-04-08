# GitHub Contribution Guide
> For the Algorithm Complexity Analyzer project team

---

## Step 1 — Create a GitHub account

Go to **github.com** and sign up with your email. Each team member needs their own account.

---

## Step 2 — Install Git on your computer

Download from **git-scm.com** and install. After installing, open a terminal or command prompt and configure your name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@email.com"
```

---

## Step 3 — Get added to the repository

The team leader will send a contributor invite to the team - accept it.

---

## Step 4 — Clone the repository

Download the project to your computer. Run this once in a folder where you want to store the project:

```bash
git clone https://github.com/FrinceNacion/algorithm-complexity-analyzer.git
cd <repo-name>
```

---

## Step 5 — Create your own branch before working

Never edit the main branch directly. Create a branch named after your role or task:

```bash
git checkout -b your-branch-name

# Examples:
git checkout -b feature/graph-visualization
git checkout -b fix/save-php-sql-injection
```

---

## Step 6 — Save and upload your changes

After editing your files, run these commands to save and push your work:

```bash
git add .
git commit -m "Brief description of what you changed"
git push origin your-branch-name
```

---

## Step 7 — Open a Pull Request (PR)

Go to the repo on github.com. You'll see a button **"Compare & pull request"** — click it, write a short description of your changes, then click **"Create pull request"**. The Project Manager reviews and merges it.

---

## Step 8 — Keep your local copy updated

Before starting new work each session, sync with the latest changes from your teammates:

```bash
git checkout main
git pull origin main
```

---

> **Tip:** If you're unsure of something, ask your Project Manager before pushing to main. It's always safer to branch and make a pull request.
