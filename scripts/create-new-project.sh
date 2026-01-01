#!/bin/bash
# create-new-project.sh - Erstellt ein neues MOJO-Projekt mit Standard-Struktur
#
# Konform mit:
# - /root/projects/platform.mojo/docs/CODING_STANDARDS.md
# - /root/projects/platform.mojo/docs/MOJO_ECOSYSTEM.md
# - /root/projects/platform.mojo/docs/STAGING_SERVER_CONVENTION.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$PLATFORM_DIR/templates/.project-template"

if [ -z "$1" ]; then
    echo "❌ Fehler: Projektname nicht angegeben"
    echo ""
    echo "Verwendung: $0 <projektname>"
    echo ""
    echo "Beispiele:"
    echo "  $0 billing.mojo"
    echo "  $0 analytics.mojo"
    echo ""
    echo "Der Service-Name wird automatisch abgeleitet:"
    echo "  billing.mojo → billing.staging.mojo-institut.de (Staging)"
    echo "  billing.mojo → billing.mojo-institut.de (Production)"
    exit 1
fi

APP_NAME=$1
PROJECT_DIR="/root/projects/$APP_NAME"

# Service-Name ableiten (entferne .mojo suffix)
SERVICE_NAME=$(echo "$APP_NAME" | sed 's/\.mojo$//' | sed 's/-mojo$//')

echo "🚀 Erstelle neues MOJO-Projekt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Projekt:     $APP_NAME"
echo "🌐 Staging:     https://${SERVICE_NAME}.staging.mojo-institut.de"
echo "🌐 Production:  https://${SERVICE_NAME}.mojo-institut.de"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Prüfe ob Projekt bereits existiert
if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  Verzeichnis existiert bereits: $PROJECT_DIR"
    read -p "Fortfahren und fehlende Dateien ergänzen? (j/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        echo "Abgebrochen."
        exit 1
    fi
fi

# Erstelle Verzeichnisstruktur
mkdir -p "$PROJECT_DIR"
mkdir -p "$PROJECT_DIR/.github/workflows"
mkdir -p "$PROJECT_DIR/src"

# Prüfe ob Template-Verzeichnis existiert
if [ ! -d "$TEMPLATE_DIR" ]; then
    echo "❌ Fehler: Template-Verzeichnis nicht gefunden: $TEMPLATE_DIR"
    exit 1
fi

# ============================================
# Kopiere und ersetze Platzhalter
# ============================================

copy_and_replace() {
    local src="$1"
    local dest="$2"
    
    if [ -f "$src" ]; then
        cp "$src" "$dest"
        # Ersetze Platzhalter
        sed -i "s/{APP_NAME}/$APP_NAME/g" "$dest"
        sed -i "s/{SERVICE_NAME}/$SERVICE_NAME/g" "$dest"
        echo "✅ $(basename "$dest")"
    fi
}

# CI/CD Pipelines
copy_and_replace "$TEMPLATE_DIR/.github/workflows/ci-staging.yml" "$PROJECT_DIR/.github/workflows/ci-staging.yml"
copy_and_replace "$TEMPLATE_DIR/.github/workflows/ci-release.yml" "$PROJECT_DIR/.github/workflows/ci-release.yml"

# Docker Compose
copy_and_replace "$TEMPLATE_DIR/docker-compose.staging.yml" "$PROJECT_DIR/docker-compose.staging.yml"
copy_and_replace "$TEMPLATE_DIR/docker-compose.production.yml" "$PROJECT_DIR/docker-compose.production.yml"

# Dockerfile
copy_and_replace "$TEMPLATE_DIR/Dockerfile" "$PROJECT_DIR/Dockerfile"

# Cursor Rules
copy_and_replace "$TEMPLATE_DIR/.cursorrules" "$PROJECT_DIR/.cursorrules"

# Package.json
copy_and_replace "$TEMPLATE_DIR/package.json" "$PROJECT_DIR/package.json"

# README
copy_and_replace "$TEMPLATE_DIR/README.md" "$PROJECT_DIR/README.md"

# Source Code
if [ ! -f "$PROJECT_DIR/src/index.js" ]; then
    copy_and_replace "$TEMPLATE_DIR/src/index.js" "$PROJECT_DIR/src/index.js"
fi

# ============================================
# Erstelle .gitignore
# ============================================
if [ ! -f "$PROJECT_DIR/.gitignore" ]; then
    cat > "$PROJECT_DIR/.gitignore" << 'EOF'
# Dependencies
node_modules/

# Build
dist/
build/
.next/

# Logs
logs/
*.log
npm-debug.log*

# Environment
.env
.env.local
.env.*.local
.env.staging
.env.production

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.docker/
EOF
    echo "✅ .gitignore"
fi

# ============================================
# Erstelle .env.staging Template
# ============================================
if [ ! -f "$PROJECT_DIR/.env.staging.example" ]; then
    cat > "$PROJECT_DIR/.env.staging.example" << EOF
# Staging Environment Variables
# Kopiere zu .env.staging und fülle aus

VERSION=main-latest
NODE_ENV=staging

# Database (falls benötigt)
# DATABASE_URL=postgresql://user:pass@db:5432/dbname

# Clerk (falls benötigt)
# CLERK_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EOF
    echo "✅ .env.staging.example"
fi

# ============================================
# Docker Network erstellen
# ============================================
if ! docker network ls | grep -q "mojo-network"; then
    docker network create mojo-network 2>/dev/null || true
    echo "✅ Docker-Netzwerk 'mojo-network' erstellt"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Projekt '$APP_NAME' erfolgreich erstellt!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Verzeichnis: $PROJECT_DIR"
echo ""
echo "🚀 Nächste Schritte:"
echo ""
echo "   1. Dependencies installieren:"
echo "      cd $PROJECT_DIR"
echo "      npm install"
echo ""
echo "   2. Lokal testen:"
echo "      npm run dev"
echo "      curl http://localhost:3000/health"
echo ""
echo "   3. GitHub Repository erstellen und pushen:"
echo "      git init"
echo "      git add ."
echo "      git commit -m 'Initial commit'"
echo "      git remote add origin https://github.com/gkeferstein/$APP_NAME.git"
echo "      git push -u origin main"
echo ""
echo "   4. GitHub Secrets setzen (PFLICHT!):"
echo "      - STAGING_SERVER"
echo "      - STAGING_SSH_KEY"
echo "      - PRODUCTION_SERVER"
echo "      - PRODUCTION_SSH_KEY"
echo "      - GHCR_TOKEN"
echo ""
echo "🌐 Nach erstem Push erreichbar unter:"
echo "   Staging:    https://${SERVICE_NAME}.staging.mojo-institut.de"
echo "   Production: https://${SERVICE_NAME}.mojo-institut.de (nach Release Tag)"
echo ""
echo "📚 Standards beachten:"
echo "   $PLATFORM_DIR/docs/CODING_STANDARDS.md"
echo "   $PLATFORM_DIR/docs/MOJO_ECOSYSTEM.md"
echo ""

