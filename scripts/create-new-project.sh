#!/bin/bash
# create-new-project.sh - Erstellt ein neues MOJO-Projekt mit Standard-Struktur
#
# Konform mit:
# - /root/projects/platform.mojo/docs/CODING_STANDARDS.md
# - /root/projects/platform.mojo/docs/MOJO_ECOSYSTEM.md
# - /root/projects/platform.mojo/docs/STAGING_SERVER_CONVENTION.md
# - /root/projects/platform.mojo/docs/LOCAL_DEVELOPMENT.md

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

echo ""
echo "📋 Kopiere Dateien..."
echo ""

# CI/CD Pipelines
copy_and_replace "$TEMPLATE_DIR/.github/workflows/ci-staging.yml" "$PROJECT_DIR/.github/workflows/ci-staging.yml"
copy_and_replace "$TEMPLATE_DIR/.github/workflows/ci-release.yml" "$PROJECT_DIR/.github/workflows/ci-release.yml"
copy_and_replace "$TEMPLATE_DIR/.github/workflows/ci-pr.yml" "$PROJECT_DIR/.github/workflows/ci-pr.yml"

# Docker Compose
copy_and_replace "$TEMPLATE_DIR/docker-compose.staging.yml" "$PROJECT_DIR/docker-compose.staging.yml"
copy_and_replace "$TEMPLATE_DIR/docker-compose.production.yml" "$PROJECT_DIR/docker-compose.production.yml"

# Dockerfile
copy_and_replace "$TEMPLATE_DIR/Dockerfile" "$PROJECT_DIR/Dockerfile"

# Cursor Rules
copy_and_replace "$TEMPLATE_DIR/.cursorrules" "$PROJECT_DIR/.cursorrules"

# Package.json
copy_and_replace "$TEMPLATE_DIR/package.json" "$PROJECT_DIR/package.json"

# TypeScript Config
copy_and_replace "$TEMPLATE_DIR/tsconfig.json" "$PROJECT_DIR/tsconfig.json"

# ESLint Config
copy_and_replace "$TEMPLATE_DIR/.eslintrc.cjs" "$PROJECT_DIR/.eslintrc.cjs"

# README
copy_and_replace "$TEMPLATE_DIR/README.md" "$PROJECT_DIR/README.md"

# Environment Example
copy_and_replace "$TEMPLATE_DIR/env.development.example" "$PROJECT_DIR/.env.development.example"

# Source Code (TypeScript)
if [ ! -f "$PROJECT_DIR/src/index.ts" ]; then
    copy_and_replace "$TEMPLATE_DIR/src/index.ts" "$PROJECT_DIR/src/index.ts"
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
.env.development
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

# Test coverage
coverage/
EOF
    echo "✅ .gitignore"
fi

# ============================================
# Docker Network erstellen (falls nicht existiert)
# ============================================
if command -v docker &> /dev/null; then
    if ! docker network ls | grep -q "mojo-network"; then
        docker network create mojo-network 2>/dev/null || true
        echo "✅ Docker-Netzwerk 'mojo-network' erstellt"
    fi
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
echo "   2. Environment einrichten:"
echo "      cp .env.development.example .env.development"
echo "      # Werte ausfüllen (Clerk Keys, etc.)"
echo ""
echo "   3. Lokal entwickeln (mit Hot Reload):"
echo "      npm run dev"
echo "      curl http://localhost:3000/health"
echo ""
echo "   4. GitHub Repository erstellen und pushen:"
echo "      git init"
echo "      git add ."
echo "      git commit -m 'Initial commit'"
echo "      git remote add origin https://github.com/gkeferstein/$APP_NAME.git"
echo "      git push -u origin main"
echo ""
echo "   5. GitHub Secrets setzen (PFLICHT!):"
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
echo "📚 Dokumentation:"
echo "   Lokale Entwicklung: $PLATFORM_DIR/docs/LOCAL_DEVELOPMENT.md"
echo "   Coding Standards:   $PLATFORM_DIR/docs/CODING_STANDARDS.md"
echo "   MOJO Ökosystem:     $PLATFORM_DIR/docs/MOJO_ECOSYSTEM.md"
echo ""
echo "💡 Feature Branch Workflow:"
echo "   git checkout -b feature/mein-feature"
echo "   # ... entwickeln ..."
echo "   git push -u origin feature/mein-feature"
echo "   # → CI läuft automatisch (Lint, Test, Build)"
echo "   # → Pull Request erstellen"
echo "   # → Nach Merge zu main: Automatisches Staging Deployment"
echo ""
