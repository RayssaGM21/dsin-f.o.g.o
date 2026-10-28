"""Create the source submission without caches, secrets, or bundled runtimes."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


root = Path(__file__).resolve().parent
output = root / "fogo-challenge.zip"
excluded_parts = {".git", ".github", ".tools", "vendor", "node_modules"}
excluded_names = {".env", "database.sqlite", "DSIN Coder Challenge.mhtml", output.name}
manifest = root / "backend/public/build/manifest.json"
if not manifest.is_file():
    raise SystemExit("Build ausente. Execute 'npm run build' em backend antes de gerar o ZIP.")

with ZipFile(output, "w", ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(root.rglob("*")):
        if not path.is_file() or excluded_parts.intersection(path.relative_to(root).parts):
            continue
        if path.name in excluded_names or path.suffix in {".log", ".cache", ".sqlite", ".sqlite3", ".db"}:
            continue
        if path.name.endswith((".sqlite-wal", ".sqlite-shm")) or (path.name.startswith(".env") and path.name != ".env.example"):
            continue
        relative_parts = path.relative_to(root).parts
        if "storage" in relative_parts and path.name != ".gitignore":
            continue
        if relative_parts[:3] == ("backend", "bootstrap", "cache") and path.name != ".gitignore":
            continue
        archive.write(path, path.relative_to(root).as_posix())

with ZipFile(output) as archive:
    if archive.testzip() is not None:
        raise SystemExit("Falha na verificação de integridade do ZIP.")

print(f"{output} ({output.stat().st_size / 1024 / 1024:.2f} MB)")
