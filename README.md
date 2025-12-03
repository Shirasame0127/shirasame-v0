# shirasame-v0

This folder is a prepared copy of the `shirasameProject` intended for publishing as the `shirasame-v0` repository.

Usage

1. From the original project root (`shirasameProject`) run the helper script to copy files into `shirasame-v0`:

```powershell
# create the shirasame-v0 folder next to the current project and copy files
.\scripts\create_shirasame_v0.ps1 -InitGit
```

2. If you didn't pass `-InitGit`, initialize and push manually:

```powershell
Push-Location "c:\Users\tensho\Documents\shirasameProject\shirasame-v0"
git init
git branch -M main
git remote add origin <YOUR_REMOTE_URL>
git add .
git commit -m "Initial import of shirasameProject"
git push -u origin main
Pop-Location
```

Notes

- The helper script excludes common large or environment-specific folders: `.git`, `node_modules`, `.next`, `dist`, and local env files.
- After pushing to a remote, configure Cloudflare Pages for `public-site` and `v0-samehome`, and set environment variables (R2, Supabase, etc.).
