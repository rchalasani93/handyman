# Handy

A responsive, browser-based collection of 28 PDF, image, document, and everyday tools. Built with HTML, CSS, and JavaScript. No application server, file uploads, or account system is needed for the tools.

## Run locally

```powershell
npm ci --ignore-scripts
npm run dev
```

Use Node.js 22 or newer (GitHub Actions uses Node.js 24). Run these commands from the repository root, then open http://127.0.0.1:5327/. The static `dist/` directory contains the application source and bundled browser assets. `npm run vendor` refreshes JavaScript bundles and license notices from the pinned dependencies; it preserves the included Noto Sans font.

## GitHub Actions deployment

The [Pages workflow](.github/workflows/pages.yml) follows the same deployment pattern as EliteReduxSavEditor:

- Pushes to `main` run validation, build `_site/`, and deploy it to GitHub Pages.
- Pull requests, merge queues, and pushes to `develop` run validation without publishing.
- The workflow can also be run manually from the Actions tab; it publishes only when run on `main`.
- Validation checks JavaScript, exercises tool utilities, and serves the built artifact under `/handyman/` to check assets, lazy libraries, the PDF worker, and document fonts.
- Actions are pinned to commit SHAs. Only the deployment job receives Pages and OIDC write permissions. No deployment secrets are needed.

One-time repository setup: in **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. Keep the `github-pages` environment restricted to `main`. Commit and push the application and workflow to `main` to deploy; the workflow reports the actual website URL. The standard project URL is https://rchalasani93.github.io/handyman/.

```powershell
npm run check
npm test
npm run build
npm run test:deploy
```

`npm run build` produces `_site/` using only public assets from `dist/`. Git metadata, test fixtures, Node dependencies, and ChatGPT Site publishing metadata are excluded. The application uses relative asset URLs and hash-based tool links, so it also works at a repository subpath.

The repository root is the source for GitHub deployment. The ignored `sites/handy/` directory, if present locally, is a separate checkout retained for the existing ChatGPT Site publisher; it is not a Git submodule or part of the GitHub Actions build. Publishing through GitHub Actions does not update the separate ChatGPT Site URL.

## Tools

- PDF: merge, split/extract pages, add text annotations, rotate, images to PDF, PDF to PNG/JPG, extract selectable text, and page numbering.
- Images: resize, compress, convert PNG/JPG/WebP, crop with a drag selection or pixel coordinates, adjust photo appearance, and rotate/flip.
- Documents: rich text Word editor with DOCX import/export, Word to text/HTML, and paginated text to PDF.
- Everyday: word count, text case conversion, JSON formatting/validation, QR generation, cryptographic password generation, unit conversion, color picker, Base64, URL encoding, and Unix timestamps.

Search, category navigation, grid/list views, recommended/alphabetical sorting, favorites, recent tools, keyboard search, and mobile navigation work across the library.

## Privacy and limits

File contents stay in browser memory. Only favorite tool IDs and recently used tool IDs are saved in localStorage. Closing a tool discards its workspace. Google Fonts loads the interface fonts; no analytics are included.

The PDF editor overlays new text; it does not replace existing PDF content. Password-protected PDFs must be unlocked first. Scanned PDFs need external OCR for text extraction. Word tools support `.docx` with basic formatting; legacy `.doc`, exact Word layout preservation, and OCR are outside this version. Image tools support common raster formats and export the first frame of animations. Limits are 50 MB per input file, 150 MB total per PDF operation, and 40 million image pixels. PDF text exports embed Noto Sans for Latin, Greek, and Cyrillic text.

## Verification

```powershell
npm run check
npm test
npm run build
npm run test:deploy
```

The checks cover page ranges, invalid selections, unit conversions, password composition/randomness, PDF merge/reopen, Word extraction, and bundled assets. `test-results/` holds disposable generated fixtures and is ignored by Git.

GitHub Pages publishes the static website publicly. The existing ChatGPT Site retains its separate audience settings. Third-party notices are in `dist/vendor/THIRD-PARTY-NOTICES.txt` and `dist/vendor/NotoSans-LICENSE.txt`.
