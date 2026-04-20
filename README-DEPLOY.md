# Scanmate Deployment — GTEX სერვერზე

ეს სახელმძღვანელო ასახავს cashflow-ის იდენტურ პატერნს: **Docker Compose + Cloudflare Tunnel + GitLab CI/CD**.

---

## არქიტექტურა

```
┌──────────────────── GTEX სერვერი (188.93.90.235) ────────────────────┐
│                                                                        │
│  cashflow-prod/ (port 80)  ◄── cashflow.gtexshop.ge                   │
│  cashflow-dev/  (port 8080) ◄── dev-cashflow.gtexshop.ge              │
│                                                                        │
│  scanmate-prod/ (port 8090) ◄── scanmate.gtexshop.ge         [NEW]    │
│  scanmate-dev/  (port 8091) ◄── dev-scanmate.gtexshop.ge     [NEW]    │
│                                                                        │
│  ყოველ scanmate ფოლდერში:                                             │
│     db (postgres:16-alpine, internal only)                            │
│     backend (FastAPI, internal only)                                  │
│     frontend (nginx + React build, exposed port)                      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                          │
                          │ Cloudflare Tunnel (existing 447e5498-...)
                          ▼
                   Cloudflare edge
                          │
                          ▼
                      მომხმარებელი
```

---

## ფაზა 1 — GitHub → GitLab migration

### 1.1 GitLab-ზე ახალი project

1. შედი `gitlab.com/riberygeorgia`-ში.
2. New Project → Create blank project → Name: `scanmate` (ან `Scanmate`).
3. Visibility: **Private**.
4. **Initialize repository with a README გამორთული** (ცარიელი უნდა იყოს).
5. შექმნის შემდეგ დაიმახსოვრე clone URL, მაგ: `git@gitlab.com:riberygeorgia/scanmate.git`

### 1.2 ლოკალურად GitHub-დან GitLab-ზე გადატანა

ლოკალურ მანქანაზე, სადაც scanmate repo გაქვს:

```bash
cd /path/to/scanmate-admin-panel

# GitLab remote-ის დამატება
git remote add gitlab git@gitlab.com:riberygeorgia/scanmate.git

# ყველა branch და tag GitLab-ზე
git push gitlab --all
git push gitlab --tags
```

თუ `main` არ არის default branch-ად, GitLab-ის ვებზე: Settings → Repository → Default branch → `main`.

ასევე დარწმუნდი რომ `develop` branch არსებობს:
```bash
git checkout -b develop  # თუ ჯერ არ არის
git push gitlab develop
```

---

## ფაზა 2 — Deploy ფაილების დამატება repo-ში

ამ archive-ში შემომავალი ფაილები ჩააგდე scanmate repo-ში შემდეგ სტრუქტურაში:

```
scanmate/
├── backend/
│   └── Dockerfile                  ← NEW
├── frontend/
│   ├── Dockerfile                  ← NEW
│   └── nginx.conf                  ← NEW
├── scripts/
│   └── server-bootstrap.sh         ← NEW
├── docker-compose.yml              ← NEW
├── docker-compose.override.yml     ← NEW (მხოლოდ dev-branch-ში უნდა დარჩეს!)
├── .env.prod.example               ← NEW
├── .env.dev.example                ← NEW
├── .gitlab-ci.yml                  ← NEW
└── .gitignore                      ← ᲡᲐᲜᲐᲛ ᲩᲐᲐᲛᲐᲢᲔᲑ commit-ს, დარწმუნდი რომ .env-ი უგულებელყოფილია
```

**კრიტიკული**: `.env` ფაილი **არასოდეს** უნდა ჩააგდო git-ში. შენს `.gitignore`-ში უნდა იყოს:
```
.env
.env.local
.env.*.local
```

### 2.1 branch strategy

- `main` — production, stable. **არ უნდა** შეიცავდეს `docker-compose.override.yml`-ს (ან რომ არსებულ override-ს არ ჰქონდეს port 8091).
- `develop` — dev, active work. **უნდა** შეიცავდეს `docker-compose.override.yml`-ს (port 8091-ით).

ე.ი. override ფაილი მხოლოდ `develop`-ში უნდა იყოს committed. main-ში არ უნდა იყოს.

**როგორ გავაკეთოთ:**
```bash
# ჯერ main-ში
git checkout main
# ყველა ფაილი გარდა override-ისა
git add backend/Dockerfile frontend/Dockerfile frontend/nginx.conf
git add docker-compose.yml .env.prod.example .env.dev.example
git add .gitlab-ci.yml scripts/ README-DEPLOY.md
git commit -m "Add Docker deployment setup"
git push gitlab main

# შემდეგ develop-ში
git checkout develop
git merge main
# ახლა აქ დაამატე override
git add docker-compose.override.yml
git commit -m "Add dev port override"
git push gitlab develop
```

---

## ფაზა 3 — სერვერის მომზადება

### 3.1 SSH-ით შესვლა

```bash
ssh -p 84 gtex@188.93.90.235
```

### 3.2 SSH key GitLab-ისკენ (server → GitLab)

cashflow-ისთვის უკვე გაქვს `~/.ssh/gitlab_server` — **იმავე key-ის გამოყენებაც შესაძლებელია**. მაგრამ უკეთესია ცალკე key scanmate-ისთვის (cleaner audit trail):

```bash
# სერვერზე
ssh-keygen -t ed25519 -C "scanmate-server" -f ~/.ssh/scanmate_server -N ""
cat ~/.ssh/scanmate_server.pub
```

Public key დააკოპირე GitLab-ში: scanmate project → Settings → Repository → Deploy Keys → Add key.
Title: `gtex-server` | Grant write access: **არა** (read-only საკმარისია, CI/CD push-ს არ აკეთებს).

SSH config-ში, რომ server იცოდეს რომელი key გამოიყენოს `gitlab.com`-ისთვის scanmate-ის კონტექსტში:

```bash
cat >> ~/.ssh/config <<'EOF'

Host gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/gitlab_server
    IdentitiesOnly yes
EOF
```

(თუ cashflow-ის key-ს ხელახლა იყენებ — ეს უკვე მოწყობილია.)

ტესტი:
```bash
ssh -T git@gitlab.com
# უნდა დააბრუნოს: "Welcome to GitLab, @riberygeorgia!"
```

### 3.3 Bootstrap script გაშვება

```bash
# ჯერ ატვირთე server-bootstrap.sh სერვერზე, ან copy-paste-ით:
cd /tmp
nano server-bootstrap.sh   # ჩააგდე შინაარსი

bash server-bootstrap.sh
```

ეს შექმნის `/home/gtex/scanmate-prod/` და `/home/gtex/scanmate-dev/` ფოლდერებს და გააგენერირებს `.env` ფაილებს ძლიერი secrets-ით.

### 3.4 Repo clone

```bash
cd /home/gtex/scanmate-prod
git clone git@gitlab.com:riberygeorgia/scanmate.git .
git checkout main

cd /home/gtex/scanmate-dev
git clone git@gitlab.com:riberygeorgia/scanmate.git .
git checkout develop
```

`.env` ფაილები რომ bootstrap-მა შექმნა, clone-ის შემდეგ **უცვლელად რჩება** (git-ში არ არის).

### 3.5 პირველი build & up

```bash
# prod
cd /home/gtex/scanmate-prod
docker compose up -d --build
docker compose ps

# dev
cd /home/gtex/scanmate-dev
docker compose up -d --build
docker compose ps
```

შემოწმება:
```bash
curl -I http://localhost:8090     # frontend prod უნდა 200-ს აბრუნებდეს
curl -I http://localhost:8091     # frontend dev
curl http://localhost:8090/api/docs    # backend FastAPI docs
```

---

## ფაზა 4 — Cloudflare Tunnel განახლება

### 4.1 config.yml-ის განახლება

```bash
sudo nano /etc/cloudflared/config.yml
```

დაამატე ორი ახალი ingress rule (იხ. `cloudflared-config.example.yml` ამ archive-ში სრული ნიმუში). მთავარია **fallback rule-ის (`http_status:404`) წინ** ჩაერთოს:

```yaml
ingress:
  # არსებული cashflow routes ხელშეუხებელი
  - hostname: cashflow.gtexshop.ge
    service: http://localhost:80
  - hostname: dev-cashflow.gtexshop.ge
    service: http://localhost:8080

  # NEW scanmate routes
  - hostname: scanmate.gtexshop.ge
    service: http://localhost:8090
  - hostname: dev-scanmate.gtexshop.ge
    service: http://localhost:8091

  - service: http_status:404
```

### 4.2 Cloudflare DNS records

Cloudflare dashboard-ში → gtexshop.ge → DNS:
- `scanmate` → CNAME → `447e5498-a87f-4fd6-b155-a9f093481834.cfargotunnel.com` (Proxied 🟧)
- `dev-scanmate` → CNAME → `447e5498-a87f-4fd6-b155-a9f093481834.cfargotunnel.com` (Proxied 🟧)

ან CLI-ით:
```bash
cloudflared tunnel route dns 447e5498-a87f-4fd6-b155-a9f093481834 scanmate.gtexshop.ge
cloudflared tunnel route dns 447e5498-a87f-4fd6-b155-a9f093481834 dev-scanmate.gtexshop.ge
```

### 4.3 Cloudflared restart

```bash
sudo systemctl restart cloudflared
sudo systemctl status cloudflared
journalctl -u cloudflared -f    # live logs, Ctrl+C გამოსასვლელად
```

### 4.4 საბოლოო ტესტი

ბრაუზერიდან:
- `https://scanmate.gtexshop.ge` → login page უნდა გამოჩნდეს
- `https://dev-scanmate.gtexshop.ge` → იგივე, dev-ზე

SSH-ით მონაცემთა ბაზის შემოწმება:
```bash
docker exec -it scanmate-prod_db psql -U scanmate -d scanmate_db -c "\dt"
# უნდა ნახო ცხრილები: warehouses, website_users, etc.
```

პირველი login: `super@scanmate.ge` / `123456` — **მაშინვე შეცვალე!**

---

## ფაზა 5 — GitLab CI/CD-ის კონფიგურაცია

### 5.1 SSH key CI-სთვის (CI → server)

cashflow-ისთვის უკვე გაქვს `~/.ssh/gitlab_deploy`. შეგიძლია იგივე გამოიყენო, ან ცალკე გენერირდეს:

**ლოკალურ მანქანაზე:**
```bash
ssh-keygen -t ed25519 -C "scanmate-ci" -f ./scanmate_ci -N ""
```

`scanmate_ci.pub` (public key)-ს დაამატე serverზე:
```bash
ssh -p 84 gtex@188.93.90.235 "cat >> ~/.ssh/authorized_keys" < ./scanmate_ci.pub
```

`scanmate_ci` (private key) → GitLab CI variable:

**GitLab → scanmate project → Settings → CI/CD → Variables → Add variable:**
- Key: `SSH_PRIVATE_KEY`
- Value: (scanmate_ci ფაილის სრული შინაარსი, `-----BEGIN OPENSSH PRIVATE KEY-----` ჩათვლით)
- Type: **File**... ოჰ, **Variable**
- Flags: ✅ Protected (მხოლოდ protected branches-ზე), ✅ Masked

### 5.2 Protected branches

GitLab → Settings → Repository → Protected Branches:
- `main` — push: Maintainers, merge: Maintainers
- `develop` — push: Developers+Maintainers, merge: Developers+Maintainers

ეს უზრუნველყოფს რომ `SSH_PRIVATE_KEY` ამ branches-ზე იქნება მხოლოდ ხელმისაწვდომი.

### 5.3 Pipeline-ის ტესტი

```bash
# ლოკალურად რამე დააფიქსე develop-ში
git checkout develop
echo "# test" >> README.md
git commit -am "CI test"
git push gitlab develop
```

GitLab UI → Pipelines → უნდა ნახო `build:frontend`, `build:backend`, `deploy:dev` jobs. dev automatic-ად deploy-ავს. Prod — manual button.

### 5.4 Manual prod deploy

`main`-ზე merge-ის შემდეგ GitLab UI → Pipelines → იპოვე ახალი pipeline → `deploy:prod` job-ზე ▶ play button.

---

## ფაზა 6 — ოპერაციული რუტინა

### ლოგების ნახვა

```bash
cd /home/gtex/scanmate-prod
docker compose logs -f                  # ყველა service
docker compose logs -f backend          # მხოლოდ backend
docker compose logs --tail=100 frontend # ბოლო 100 ხაზი
```

### Restart / update

```bash
cd /home/gtex/scanmate-prod
git pull
docker compose up -d --build            # re-build და restart
```

ან უბრალოდ restart git-ის გარეშე:
```bash
docker compose restart backend
```

### DB backup

cashflow-ის backup რუტინის გვერდით:
```bash
# backup
docker exec scanmate-prod_db pg_dump -U scanmate scanmate_db > scanmate-prod-$(date +%F).sql

# restore
cat backup.sql | docker exec -i scanmate-prod_db psql -U scanmate scanmate_db
```

### DB რეპლიცა dev-ში prod-იდან (სატესტოდ)

```bash
docker exec scanmate-prod_db pg_dump -U scanmate scanmate_db > /tmp/dump.sql
docker exec -i scanmate-dev_db psql -U scanmate scanmate_db < /tmp/dump.sql
```

---

## რისკების შეჯამება

| რისკი | შემცირება |
|-------|-----------|
| Port კონფლიქტი cashflow-თან | scanmate იყენებს 8090/8091, cashflow 80/8080. კონფლიქტი არ არის. |
| Default login credentials | პირველივე ლოგინის შემდეგ `super@scanmate.ge`-ს პაროლი უნდა შეიცვალოს. |
| `.env` commit git-ში | `.gitignore`-ში `.env` **აუცილებლად** უნდა იყოს. გადაამოწმე ფაილის push-ამდე. |
| Cloudflare Tunnel restart-ის შეფერხება | cashflow-ის ტრაფიკი დროებით წყდება restart-ის დროს (~2 წამი). არა-პიკ საათებში გააკეთე. |
| Docker disk-ს ავსება | პერიოდულად: `docker system prune -f` (მხოლოდ unused images/containers). |
| Backend secret leak (CI log) | `.gitlab-ci.yml`-ში ვერცერთი secret echo-თი არ იბეჭდება. GitLab variables Masked უნდა იყოს. |
| dev DB prod-ის მონაცემებს გადაფარავს | dev-ს საკუთარი volume (`scanmate-dev_db_data`) აქვს. გადაფარვა არ მოხდება. |

---

## სასარგებლო ბრძანებები

```bash
# ყველა container serverზე
docker ps

# scanmate stacks
docker compose -f /home/gtex/scanmate-prod/docker-compose.yml ps
docker compose -f /home/gtex/scanmate-dev/docker-compose.yml ps

# disk usage by Docker
docker system df

# unused რესურსების წაშლა (უსაფრთხო)
docker system prune -f

# unused volumes (⚠️ ყურადღებით!)
docker volume ls
```
