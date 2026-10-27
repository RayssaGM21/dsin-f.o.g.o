"""Create the source submission without caches, secrets, or bundled runtimes."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


root = Path(__file__).resolve().parent
output = root / "fogo-challenge.zip"
excluded_parts = {".git", ".github", ".tools", "vendor", "node_modules"}
excluded_names = {".env", "database.sqlite", "DSIN Coder Challenge.mhtml", output.name}

with ZipFile(output, "w", ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(root.rglob("*")):
        if not path.is_file() or excluded_parts.intersection(path.relative_to(root).parts):
            continue
        if path.name in excluded_names or path.suffix in {".log", ".cache", ".sqlite", ".sqlite3", ".db"}:
            continue
        if path.name.endswith((".sqlite-wal", ".sqlite-shm")) or (path.name.startswith(".env") and path.name != ".env.example"):
            continue
        if "storage" in path.parts and path.name != ".gitignore":
            continue
        archive.write(path, path.relative_to(root).as_posix())

print(f"{output} ({output.stat().st_size / 1024 / 1024:.2f} MB)")
