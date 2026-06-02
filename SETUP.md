# One Finance Portal — Setup Guide

## 1. Deploy the Cloudflare Worker (Recommended)

The Cloudflare Worker acts as a secure proxy so the GitHub token never touches the browser.

### Steps

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create Application** → **Create Worker**
2. Paste the contents of `cloudflare-worker.js` into the editor
3. Click **Save and Deploy**
4. Go to **Settings** → **Variables** and add the following **Environment Variables** (encrypted):

   | Variable | Value |
   |---|---|
   | `GITHUB_TOKEN` | Your GitHub Personal Access Token (fine-grained, Contents: Read & Write on `OneFinanceBPO/Portal-do-Cliente`) |
   | `APP_SECRET` | A strong random secret password (you'll enter this in the portal) |
   | `ALLOWED_ORIGIN` | `https://onefinancebpo.github.io` (or your custom domain) |

5. Note the Worker URL — it looks like `https://your-worker.your-subdomain.workers.dev`

---

## 2. Configure the Portal

1. Open the portal at `https://onefinancebpo.github.io/Portal-do-Cliente/`
2. Log in as administrator
3. Click the **sync badge** in the top-right header (shows "Token não configurado" or similar)
4. In the **Modo Recomendado (Worker)** section:
   - Enter the **Worker URL** from step 1 (e.g. `https://your-worker.workers.dev`)
   - Enter the **App Secret** you set in the Worker env vars
5. Click **Salvar** — the portal will test the connection and show a success message

From now on, all data writes go through the Worker. The GitHub token stays server-side only.

---

## 3. Legacy Token Mode (Development Only)

If you need to test without a Cloudflare Worker:

1. Click the sync badge → expand **Modo Legado (Token direto)**
2. Enter a GitHub Personal Access Token with **Contents: Read and Write** permission
3. Click **Salvar e Testar**

> **Warning:** This stores the token in `localStorage` in the browser. Use only in development or on a trusted private machine. Never use in production.

---

## Creating a GitHub Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) → **Fine-grained tokens** → **Generate new token**
2. Set **Repository access** to only `OneFinanceBPO/Portal-do-Cliente`
3. Under **Permissions → Repository permissions**, set **Contents** to **Read and Write**
4. Generate and copy the token (starts with `github_pat_`)
