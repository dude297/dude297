#!/usr/bin/env python3
"""Small dependency-free link/asset validator for the static GitHub Pages site."""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / "docs"
HTML_FILES = sorted(ROOT.rglob("*.html"))

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.refs: list[str] = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"])
        for key in ("href", "src"):
            if values.get(key):
                self.refs.append(values[key])

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

def resolve_local(source: Path, url: str) -> tuple[Path, str] | None:
    parts = urlsplit(url.strip())
    if parts.scheme or parts.netloc or not url.strip():
        return None
    if parts.path.startswith("/"):
        # The project is hosted under a GitHub Pages subpath; use relative URLs.
        raise ValueError(f"root-absolute path is unsafe for project Pages: {url}")
    target = (source.parent / unquote(parts.path)).resolve() if parts.path else source.resolve()
    if not target.is_relative_to(ROOT.resolve()):
        raise ValueError(f"path leaves website root: {url}")
    if target.is_dir():
        target = target / "index.html"
    return target, unquote(parts.fragment)

def main() -> int:
    if not HTML_FILES or not (ROOT / "index.html").exists():
        print("ERROR: docs/index.html or HTML pages missing", file=sys.stderr)
        return 1
    parsers: dict[Path, PageParser] = {}
    errors: list[str] = []
    checked = 0
    for page in HTML_FILES:
        parser = PageParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()
        parsers[page.resolve()] = parser
        if len(parser.ids) != len(set(parser.ids)):
            errors.append(f"{page.relative_to(ROOT)}: duplicate HTML id")

    for page, parser in parsers.items():
        for ref in parser.refs:
            try:
                resolved = resolve_local(page, ref)
            except ValueError as exc:
                errors.append(f"{page.relative_to(ROOT)}: {exc}")
                continue
            if resolved is None:
                continue
            checked += 1
            target, fragment = resolved
            if not target.is_file():
                errors.append(f"{page.relative_to(ROOT)}: missing {ref}")
            elif fragment and target.suffix.lower() == ".html":
                if target not in parsers or fragment not in parsers[target].ids:
                    errors.append(f"{page.relative_to(ROOT)}: unresolved anchor {ref}")

    for svg in ROOT.rglob("*.svg"):
        try:
            ET.parse(svg)
        except ET.ParseError as exc:
            errors.append(f"{svg.relative_to(ROOT)}: malformed SVG: {exc}")
    for css in ROOT.rglob("*.css"):
        content = css.read_text(encoding="utf-8")
        if content.count("{") != content.count("}"):
            errors.append(f"{css.relative_to(ROOT)}: unbalanced CSS braces")

    for error in errors:
        print("ERROR:", error, file=sys.stderr)
    print(f"Checked {len(HTML_FILES)} HTML pages, {checked} local links/assets, and SVG syntax.")
    if errors:
        return 1
    print("Static site integrity check passed.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
