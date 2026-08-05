#!/usr/bin/env python3
"""
scan_project.py
---------------
Place this file inside your CAN project folder.
Run: python scan_project.py
Output: PROJECT_CONTEXT.md  (ready to paste into any AI chat)
"""

import os
import json
import sys
from datetime import datetime
from pathlib import Path

# CONFIG for scanning and output

OUTPUT_FILE = "PROJECT_CONTEXT.md"

# Folders to completely skip
SKIP_DIRS = {
    "node_modules", ".git", ".next", "dist", "build",
    ".cache", "coverage", "__pycache__", ".venv", "venv",
    ".idea", ".vscode",
}

# Only read content from these extensions
READABLE_EXTENSIONS = {
    ".js", ".jsx", ".ts", ".tsx", ".json", ".env.example",
    ".md", ".html", ".css", ".scss", ".yaml", ".yml",
    ".sh", ".py", ".prisma", ".graphql", ".sql",
}

# Files whose full content is always included (if ≤ size limit)
ALWAYS_INCLUDE = {
    "package.json", "package-lock.json", ".env.example",
    "README.md", "docker-compose.yml", "Dockerfile",
    ".eslintrc.js", ".eslintrc.json", "vite.config.js",
    "vite.config.ts", "next.config.js", "tailwind.config.js",
    "tsconfig.json", "babel.config.js", "jest.config.js",
    "server.js", "index.js", "app.js", "main.jsx", "main.tsx",
    "App.jsx", "App.tsx",
}

# Max characters to read per file (prevents huge files bloating output)
MAX_FILE_CHARS = 500000
# Max chars for non-key files to give a sense of content without overwhelming the AI
SNIPPET_CHARS = 500000

# HELPERS

def should_skip_dir(name: str) -> bool:
    return name in SKIP_DIRS or name.startswith(".")

def is_readable(path: Path) -> bool:
    return path.suffix in READABLE_EXTENSIONS or path.name in ALWAYS_INCLUDE

def read_file(path: Path, limit: int) -> str:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
        if len(text) > limit:
            return text[:limit] + f"\n\n... [TRUNCATED — {len(text)} chars total]"
        return text
    except Exception as e:
        return f"[Could not read file: {e}]"

def get_tree(root: Path, prefix: str = "", max_depth: int = 6, depth: int = 0) -> list[str]:
    if depth > max_depth:
        return []
    lines = []
    try:
        entries = sorted(root.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
    except PermissionError:
        return []
    entries = [e for e in entries if not (e.is_dir() and should_skip_dir(e.name))]
    for i, entry in enumerate(entries):
        connector = "└── " if i == len(entries) - 1 else "├── "
        lines.append(prefix + connector + entry.name)
        if entry.is_dir():
            extension = "    " if i == len(entries) - 1 else "│   "
            lines.extend(get_tree(entry, prefix + extension, max_depth, depth + 1))
    return lines

def parse_package_json(root: Path) -> dict:
    info = {}
    for pkg_path in [root / "package.json", root / "client" / "package.json",
                     root / "frontend" / "package.json", root / "server" / "package.json",
                     root / "backend" / "package.json"]:
        if pkg_path.exists():
            try:
                data = json.loads(pkg_path.read_text(encoding="utf-8"))
                label = str(pkg_path.relative_to(root))
                info[label] = {
                    "name": data.get("name", "—"),
                    "version": data.get("version", "—"),
                    "scripts": data.get("scripts", {}),
                    "dependencies": list(data.get("dependencies", {}).keys()),
                    "devDependencies": list(data.get("devDependencies", {}).keys()),
                }
            except Exception:
                pass
    return info

def detect_stack(root: Path) -> list[str]:
    clues = []
    all_files = " ".join(str(p) for p in root.rglob("*.json") if "node_modules" not in str(p))
    checks = {
        "React": ["react", "jsx", "tsx"],
        "Next.js": ["next.config", "next/"],
        "Express": ["express"],
        "MongoDB / Mongoose": ["mongoose", "mongodb"],
        "Prisma": ["prisma"],
        "Redux": ["redux", "@reduxjs"],
        "React Query / TanStack": ["@tanstack", "react-query"],
        "Socket.io": ["socket.io"],
        "JWT Auth": ["jsonwebtoken", "jwt"],
        "Tailwind CSS": ["tailwindcss", "tailwind"],
        "TypeScript": ["typescript", ".tsx", ".ts"],
        "Docker": ["Dockerfile", "docker-compose"],
        "Vite": ["vite"],
        "GraphQL": ["graphql", "apollo"],
        "Zod / Yup Validation": ["zod", "yup"],
    }
    for tech, keywords in checks.items():
        if any(k.lower() in all_files.lower() for k in keywords):
            clues.append(tech)
    return clues

def collect_source_files(root: Path) -> list[Path]:
    files = []
    for path in sorted(root.rglob("*")):
        if path.is_file() and is_readable(path):
            parts = path.parts
            if any(should_skip_dir(p) for p in parts):
                continue
            files.append(path)
    return files

def categorize(path: Path, root: Path) -> str:
    rel = str(path.relative_to(root)).replace("\\", "/")
    if any(x in rel for x in ["routes/", "route.", "router."]):
        return "Routes"
    if any(x in rel for x in ["model", "schema", "entity"]):
        return "Models / Schemas"
    if any(x in rel for x in ["controller", "handler", "service"]):
        return "Controllers / Services"
    if any(x in rel for x in ["middleware", "auth", "guard"]):
        return "Middleware / Auth"
    if any(x in rel for x in ["component", "pages/", "views/", "screen"]):
        return "Frontend Components / Pages"
    if any(x in rel for x in ["hook", "context", "store", "redux", "slice"]):
        return "State / Hooks / Context"
    if any(x in rel for x in ["util", "helper", "lib/", "common"]):
        return "Utilities / Helpers"
    if any(x in rel for x in ["config", ".env", "constant"]):
        return "Config / Env"
    if path.suffix in {".css", ".scss"}:
        return "Styles"
    if path.suffix in {".test.js", ".spec.js", ".test.ts", ".spec.ts"}:
        return "Tests"
    return "Other"

# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    root = Path(__file__).parent.resolve()
    print(f"🔍 Scanning: {root}")

    lines = []
    w = lines.append

    w("# 📦 PROJECT CONTEXT — AI-Ready Summary")
    w(f"> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    w(f"> Root: `{root}`")
    w("")

    # ── 1. DETECTED STACK ──
    w("---")
    w("## 🧠 Detected Tech Stack")
    stack = detect_stack(root)
    for tech in stack:
        w(f"- {tech}")
    if not stack:
        w("- Could not auto-detect (check package.json manually)")
    w("")

    # ── 2. PACKAGE.JSON SUMMARIES ──
    w("---")
    w("## 📋 Package.json Overview")
    pkg_info = parse_package_json(root)
    if pkg_info:
        for label, info in pkg_info.items():
            w(f"### `{label}`")
            w(f"- **Name:** {info['name']}  |  **Version:** {info['version']}")
            if info["scripts"]:
                w(f"- **Scripts:** {', '.join(f'`{k}`' for k in info['scripts'])}")
            if info["dependencies"]:
                w(f"- **Dependencies ({len(info['dependencies'])}):** {', '.join(info['dependencies'])}")
            if info["devDependencies"]:
                w(f"- **DevDeps ({len(info['devDependencies'])}):** {', '.join(info['devDependencies'])}")
            w("")
    else:
        w("No package.json found.\n")

    # ── 3. FOLDER TREE ──
    w("---")
    w("## 🗂️ Project Folder Tree")
    w("```")
    w(str(root.name) + "/")
    tree_lines = get_tree(root)
    # Cap tree at 300 lines to avoid bloat
    if len(tree_lines) > 300:
        tree_lines = tree_lines[:300] + ["... [tree truncated]"]
    for tl in tree_lines:
        w(tl)
    w("```")
    w("")

    # ── 4. SOURCE FILE CONTENTS ──
    w("---")
    w("## 📄 Source Files")
    w("")

    source_files = collect_source_files(root)
    # Remove output file itself from scan
    source_files = [f for f in source_files if f.name != OUTPUT_FILE and f.name != "scan_project.py"]

    categories: dict[str, list[Path]] = {}
    for f in source_files:
        cat = categorize(f, root)
        categories.setdefault(cat, []).append(f)

    total_files = 0
    for cat in ["Routes", "Models / Schemas", "Controllers / Services",
                "Middleware / Auth", "Frontend Components / Pages",
                "State / Hooks / Context", "Utilities / Helpers",
                "Config / Env", "Styles", "Tests", "Other"]:
        files_in_cat = categories.get(cat, [])
        if not files_in_cat:
            continue
        w(f"### 🔹 {cat}")
        for fpath in files_in_cat:
            rel = str(fpath.relative_to(root)).replace("\\", "/")
            limit = MAX_FILE_CHARS if fpath.name in ALWAYS_INCLUDE else SNIPPET_CHARS
            content = read_file(fpath, limit)
            ext = fpath.suffix.lstrip(".") or "txt"
            w(f"#### `{rel}`")
            w(f"```{ext}")
            w(content)
            w("```")
            w("")
            total_files += 1

    # ── 5. ENV VARIABLES (keys only, no values) ──
    env_file = root / ".env"
    if env_file.exists():
        w("---")
        w("## 🔐 Environment Variables (keys only — values hidden)")
        w("```")
        try:
            for line in env_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#"):
                    key = line.split("=")[0]
                    w(f"{key}=***")
                elif line.startswith("#"):
                    w(line)
        except Exception:
            w("[Could not read .env]")
        w("```")
        w("")

    # ── 6. SUMMARY STATS ──
    w("---")
    w("## 📊 Stats")
    w(f"- Total source files scanned: **{total_files}**")
    w(f"- Detected technologies: **{len(stack)}**")
    w(f"- package.json files found: **{len(pkg_info)}**")
    w("")
    w("---")
    w("## 💬 How to Use This File with an AI")
    w("""
Paste the entire contents of this file into any AI chat (ChatGPT, Claude, Gemini, etc.)
and start with a message like:

> "Here is my full MERN project context. I need help with [your question]."

The AI will have full visibility into your stack, file structure, routes, models,
components, configs, and scripts — and can help you debug, extend, or refactor anything.
""")

    # ── WRITE OUTPUT ──
    output_path = root / OUTPUT_FILE
    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n✅ Done! Output written to: {output_path}")
    print(f"   Files scanned : {total_files}")
    print(f"   Tech detected : {', '.join(stack) or 'none'}")
    print(f"\n📋 Open PROJECT_CONTEXT.md and paste it into any AI chat!")

if __name__ == "__main__":
    main()
