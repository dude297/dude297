# Portfolio maintenance

The public portfolio is a buildless GitHub Pages site in `docs/`. The existing `pages.yml` workflow publishes changes to `main`.

## Layout

- `docs/index.html`: four selected projects, a native disclosure containing the complete project index, about, and contact.
- `docs/portfolio.css`: homepage layout and responsive styles.
- `docs/portfolio.js`: optional project search, category filters, and deep-link handling. All project content and links are available without it.
- `docs/projects/`: case studies. Each has a skip link, contents links, and a return to the portfolio.
- `docs/case-workbench.css`: shared case-study reading surface and responsive architecture diagrams, layered over the existing base styles.
- `docs/resume.html`: printable résumé.

There are no autonomous animations or project backend calls on the homepage. Arrow glyphs have been removed from link and button labels. Diagram arrows are SVG paths.

## Project evidence

The SO-DIMM project is presented as the current hardware focus: reader PCB design, SPD decoding, and functional simulation. The board has not been fabricated, and physical FPGA-attached DDR4 remains unvalidated. PCIe and CXL are later directions.

The November 27, 2026 content pass checked the current private SPD-reader status record and the FPGA lab checkpoint. Published summaries distinguish mock/reference-data checks, behavioral simulation, functional LiteDRAM simulation, existing-host SPD reads, and physical hardware validation. No private design files or source were copied into this repository.

Keep test counts attached to their date, scope, and result. A DRC result is a layout-rule check, a mock test is a software check, and a simulation is a modeled result. Update the résumé and project index when a project name or stage changes.

## Design references

Original composition, informed by:

- [Brittany Chiang](https://brittanychiang.com/): direct project access, clear hierarchy, restrained navigation.
- [Ben Eater](https://eater.net/): concrete hardware explanations and useful implementation detail.
- [Josh W. Comeau](https://www.joshwcomeau.com/): readable typography and clear explanatory content.

No assets or implementation code were copied from these sites.

## Validation

Run `python3 scripts/check_site.py`, `node --check docs/portfolio.js`, and `git diff --check`.

Browser QA for this redesign covered desktop, 320/390px phone frames, and 768px tablet frames; diagram stacking; table overflow; archive disclosure; search and category filtering; empty results; and shared project anchors. A temporary local QA page was used and is not part of the published site.
