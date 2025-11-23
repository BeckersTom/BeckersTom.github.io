# Development notes — continue on another computer

This repository can be continued on another computer. Follow these steps to get the code and reproduce the local environment, generate icons, and continue development.

## 1) Push your current work (on this machine)

If you haven't already pushed your local changes, run these commands from the repository root on your current machine:

```powershell
cd C:\GitHub\BeckersTom.github.io
git status
git add .
git commit -m "MessApp: update icons and use relative paths for PWA"
git fetch origin
git pull --rebase
git push
```

Notes:
- If you use SSH authentication: make sure your SSH key is added to the other computer or to your GitHub account.
- If you use HTTPS authentication: set up a Personal Access Token (PAT) on the other computer or be ready to enter your credentials.

## 2) Clone the repository on the other computer

On the other computer, install Git and run:

```powershell
# choose a folder to clone into
cd C:\some\workspace
git clone https://github.com/BeckersTom/BeckersTom.github.io.git
cd BeckersTom.github.io
# or if you prefer SSH
# git clone git@github.com:BeckersTom/BeckersTom.github.io.git
```

## 3) Install recommended tools

Install required tools on the new machine (Windows instructions):

- Git: https://git-scm.com/downloads
- Node.js (optional, if you add Node tooling) — https://nodejs.org/
- Python 3 (for quick static server tests): https://www.python.org/downloads/
- ImageMagick or Inkscape (only if you need to generate PNGs from SVGs or vectorize images):
  - ImageMagick: https://imagemagick.org
  - Inkscape: https://inkscape.org

Add the tools to `PATH` so `magick` or `inkscape` commands are available from PowerShell.

## 4) Reproduce the app environment and generate icon PNGs

The repo contains `MessApp/generate-icons.ps1` (PowerShell). If you need PNG icons and they are not present, from the `MessApp` folder run:

```powershell
cd C:\path\to\BeckersTom.github.io\MessApp
.\generate-icons.ps1
```

The script will use `magick` (ImageMagick) or `inkscape` to produce `icon-192.png` and `icon-512.png` from the SVGs.

If you already replaced the PNGs (as on the original machine), you **do not** need to run the script.

## 5) Open the project in VS Code

Install Visual Studio Code and open the folder:

```powershell
code C:\path\to\BeckersTom.github.io
```

Recommended extensions:
- Git (built-in in VS Code)
- Live Server (optional) or use Python's simple server for quick checks

## 6) Local testing (serve the site)

You can serve the repo root and then open `MessApp/index.html` from your Android device (or from the same machine):

```powershell
# from repo root
python -m http.server 8000
# open http://localhost:8000/MessApp/index.html in a browser
```

To test on an Android device on the same network:
- find the PC IP: `ipconfig` and use `http://<PC_IP>:8000/MessApp/index.html`
- Chrome will show installability prompts only for HTTPS or `localhost`; use GitHub Pages or a tunnel (ngrok) for HTTPS testing.

## 7) Service worker and manifest notes

- `MessApp/manifest.json` uses relative paths and sets `scope` to `./` so the PWA is scoped to `MessApp/`.
- `MessApp/service-worker.js` caches relative URLs. When testing make sure the service worker is registered from `MessApp/index.html` (it registers `./service-worker.js`).

## 8) Continue development and commit/push

After making changes on the other machine:

```powershell
git status
git add <files>
git commit -m "Short: explain change"
git fetch origin
git pull --rebase
# fix conflicts if needed
git push
```

## 9) Continuing this chat / assistant context

This chat session is bound to this environment and cannot be transferred automatically to the other machine. To continue the discussion on the other computer you can:

- Open the repository in the browser (GitHub) and create an Issue describing where you left off and link to files. Paste relevant parts of this conversation into the issue if you want the history stored in the repo.
- Save this repository file `DEVELOPMENT.md` and refer to it on the other machine.
- If you want me to continue working from the other machine, either:
  - Run the same assistant from that machine (open a new session) and paste the important conversation parts, or
  - Create a GitHub issue or PR that documents the current state and link to it when you open a new chat session.

## 10) Quick checklist for switching computers

- [ ] Push all local changes (commit + push)
- [ ] Clone repo on other machine
- [ ] Install Git + tools (ImageMagick/Inkscape/Python as needed)
- [ ] Generate icons if required (`generate-icons.ps1`) or verify PNGs are present
- [ ] Open in VS Code and continue

---

If you want, I can also commit this `DEVELOPMENT.md` to the repo and then run the `git add`/`commit`/`push` commands for you. Do you want me to commit and push this file now? If yes, confirm the commit message to use.