#!/bin/bash
# ---------- scripts/server-bootstrap.sh ----------
# ერთჯერადი setup script რომელსაც გაუშვებ serverზე SSH-ით
# Usage:  bash server-bootstrap.sh
#
# რას აკეთებს:
#   1. ქმნის /home/gtex/scanmate-prod/ და /home/gtex/scanmate-dev/
#   2. ვალიდაცია რომ Docker-ი უკვე გიდგას
#   3. აგენერირებს .env ფაილებს ძლიერი secrets-ით (PROD და DEV ცალ-ცალკე)
#   4. გვიჩვენებს რა secrets შეიქმნა
#
# ⚠️ git clone მოუწევს ცალკე (GitLab-ზე push-ის შემდეგ)

set -e

GITLAB_REPO_URL="git@gitlab.com:riberygeorgia/scanmate.git"   # შეცვალე შენი GitLab path-ზე
PROD_DIR="/home/gtex/scanmate-prod"
DEV_DIR="/home/gtex/scanmate-dev"

echo "=== Scanmate server bootstrap ==="

# 1. Docker-ის შემოწმება
if ! command -v docker &> /dev/null; then
    echo "❌ Docker არ გიდგას. ჯერ დააყენე!"
    exit 1
fi
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose v2 არ გიდგას."
    exit 1
fi
echo "✅ Docker & Docker Compose v2 აღმოჩენილია"

# 2. ფოლდერების შექმნა
echo ""
echo "--- ფოლდერების შექმნა ---"
mkdir -p "$PROD_DIR"
mkdir -p "$DEV_DIR"
echo "✅ $PROD_DIR"
echo "✅ $DEV_DIR"

# 3. secrets გენერაცია
gen_secret() {
    python3 -c "import secrets; print(secrets.token_urlsafe(48))"
}
gen_password() {
    python3 -c "import secrets, string; print(''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32)))"
}

PROD_SECRET_KEY=$(gen_secret)
PROD_DB_PASSWORD=$(gen_password)
DEV_SECRET_KEY=$(gen_secret)
DEV_DB_PASSWORD=$(gen_password)

# 4. PROD .env
cat > "$PROD_DIR/.env" <<EOF
COMPOSE_PROJECT_NAME=scanmate-prod
HOST_PORT=8090

APP_ENV=production
SECRET_KEY=$PROD_SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES=1440

DB_NAME=scanmate_db
DB_USER=scanmate
DB_PASSWORD=$PROD_DB_PASSWORD

CORS_ORIGINS=https://scanmate.gtexshop.ge

VITE_API_URL=/api
EOF
chmod 600 "$PROD_DIR/.env"

# 5. DEV .env
cat > "$DEV_DIR/.env" <<EOF
COMPOSE_PROJECT_NAME=scanmate-dev
HOST_PORT=8091

APP_ENV=development
SECRET_KEY=$DEV_SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES=1440

DB_NAME=scanmate_db
DB_USER=scanmate
DB_PASSWORD=$DEV_DB_PASSWORD

CORS_ORIGINS=https://dev-scanmate.gtexshop.ge

VITE_API_URL=/api
EOF
chmod 600 "$DEV_DIR/.env"

echo ""
echo "✅ .env ფაილები შეიქმნა და chmod 600 დაუყენდა"
echo ""
echo "--- შემდეგი ნაბიჯები ---"
echo "1. შეიცვალე ფოლდერში და clone გააკეთე:"
echo "   cd $PROD_DIR && git clone $GITLAB_REPO_URL . && git checkout main"
echo "   cd $DEV_DIR && git clone $GITLAB_REPO_URL . && git checkout develop"
echo ""
echo "2. დააკოპირე dev-ში override ფაილი:"
echo "   cp $DEV_DIR/docker-compose.override.yml $DEV_DIR/  # უკვე clone-დან მოვა თუ commit გაქვს"
echo ""
echo "3. ააწყვე და აუშვი:"
echo "   cd $PROD_DIR && docker compose up -d --build"
echo "   cd $DEV_DIR  && docker compose up -d --build"
echo ""
echo "4. Cloudflare Tunnel config განაახლე: sudo nano /etc/cloudflared/config.yml"
echo "   და შემდეგ: sudo systemctl restart cloudflared"
echo ""
echo "=== ყველაფერი მზადაა ==="
