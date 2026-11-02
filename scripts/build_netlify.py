from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    for name in ("index.html", "app.js", "tracks.js", "styles.css"):
        shutil.copy2(ROOT / name, DIST / name)
    shutil.copytree(ROOT / "content", DIST / "content", ignore=shutil.ignore_patterns("*.py", "*.mjs", "__pycache__"))
    shutil.copytree(ROOT / "vendor", DIST / "vendor")

    api_base = os.getenv("PREPWISE_API_BASE", "").strip().rstrip("/")
    (DIST / "api-config.js").write_text(
        f"window.PREPWISE_API_BASE = {json.dumps(api_base)};\n",
        encoding="utf-8",
    )
    print(f"Built Netlify site at {DIST} (API base: {'configured' if api_base else 'not set'})")


if __name__ == "__main__":
    main()
