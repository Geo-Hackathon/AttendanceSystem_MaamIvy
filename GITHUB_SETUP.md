# GitHub Authentication Setup

## Create Personal Access Token (PAT)

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Profile Picture → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token" → "Generate new token (classic)"
   - Note: `Faculty Attendance System Deployment`
   - Expiration: `90 days` (or longer)
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)

3. **Generate and Copy Token**
   - Click "Generate token"
   - **COPY THE TOKEN NOW** (you won't see it again!)
   - Save it somewhere safe

4. **Use Token Instead of Password**
   ```bash
   git push -u origin main
   ```
   - Username: `your-github-username`
   - Password: `paste-your-token-here` (not your GitHub password!)

---

## Alternative: Use SSH (More Secure)

1. **Generate SSH Key**
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```
   - Press Enter for default location
   - Press Enter for no passphrase (or set one)

2. **Copy SSH Public Key**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   - Copy the entire output

3. **Add to GitHub**
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Title: `My Computer`
   - Paste the key
   - Click "Add SSH key"

4. **Change Remote URL**
   ```bash
   git remote remove origin
   git remote add origin git@github.com:Geo-Hackathon/faculty-attendance.git
   git push -u origin main
   ```

---

## Quick Fix (Use Token Now)

```bash
# When you run this command:
git push -u origin main

# You'll be prompted:
Username: your-github-username
Password: [paste your Personal Access Token here]
```

**Get your token:** https://github.com/settings/tokens/new
