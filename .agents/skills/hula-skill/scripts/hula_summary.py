#!/usr/bin/env python3
"""Summarize Matrix Customer Service frontend layout and architectural boundaries."""

import argparse
import sys
from pathlib import Path


def find_repo_root(start: Path) -> Path | None:
    for path in [start] + list(start.parents):
        if (path / "package.json").exists() and (path / "src").exists():
            return path
    return None


def list_files(directory: Path, pattern: str = "*.*") -> list[Path]:
    if not directory.exists():
        return []
    return sorted(directory.rglob(pattern), key=lambda p: str(p))


def print_section(title: str, files: list[Path], root: Path) -> None:
    print(f"\n📂 {title} ({len(files)} files):")
    for f in files:
        print(f"  - {f.relative_to(root)}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Summarize Customer Service Matrix project layout.")
    parser.add_argument("--root", help="Project root (defaults to auto-detect).")
    parser.add_argument("--summary", action="store_true", help="Print count summary.")
    args = parser.parse_args()

    root = Path(args.root).resolve() if args.root else find_repo_root(Path(__file__).resolve())
    if not root:
        print("ERROR: Could not locate repo root (missing package.json).", file=sys.stderr)
        return 1

    src = root / "src"
    pages = list_files(src / "pages", "*.vue")
    composables = list_files(src / "common" / "composables", "*.ts")
    services = list_files(src / "services", "*.ts")
    ui_components = list_files(src / "components" / "ui", "*.*")
    common_components = list_files(src / "components" / "common", "*.vue")
    matrix_libs = list_files(src / "common" / "libs" / "matrix", "*.ts")

    if args.summary or len(sys.argv) == 1:
        print("=== Matrix Customer Service Frontend Architecture ===")
        print(f"Project Root: {root}")
        print(f"Pages (Views):            {len(pages)}")
        print(f"Composables (Hooks):       {len(composables)}")
        print(f"Services (API Layer):      {len(services)}")
        print(f"UI Primitives (Shadcn):    {len(ui_components)}")
        print(f"Common Components:         {len(common_components)}")
        print(f"Matrix Libs:               {len(matrix_libs)}")

    if not args.summary and len(sys.argv) > 1:
        print_section("Pages", pages, root)
        print_section("Composables", composables, root)
        print_section("Services", services, root)
        print_section("Common Components", common_components, root)

    return 0


if __name__ == "__main__":
    sys.exit(main())
