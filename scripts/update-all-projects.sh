#!/bin/bash
# update-all-projects.sh - Aktualisiert alle MOJO-Projekte mit platform.mojo Standards
#
# Fügt hinzu:
# - .cursorrules mit Referenz zu platform.mojo (PFLICHT)
# - ci-pr.yml für Feature Branch CI
# - Aktualisierte ci-staging.yml und ci-release.yml (optional)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$PLATFORM_DIR/templates/.project-template"
PROJECTS_DIR="/root/projects"

# Liste der Projekte (ohne platform.mojo und shared.mojo)
PROJECTS=(
    "account.mojo"
    "accounts.mojo"
    "admin.mojo"
    "campus.mojo"
    "checkin.mojo"
    "connect.mojo"
    "design.mojo"
    "frontend.mojo"
    "kontakte.mojo"
    "mailer.mojo"
    "manage.mojo"
    "messaging.mojo"
    "payments.mojo"
    "pipeline.mojo"
    "pos.mojo"
    "schnelltest.mojo"
)

echo "🔄 Aktualisiere alle MOJO-Projekte mit platform.mojo Standards"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for PROJECT in "${PROJECTS[@]}"; do
    PROJECT_DIR="$PROJECTS_DIR/$PROJECT"
    
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "⚠️  $PROJECT: Verzeichnis nicht gefunden, überspringe..."
        continue
    fi
    
    echo "📁 $PROJECT"
    
    # Service-Name ableiten
    SERVICE_NAME=$(echo "$PROJECT" | sed 's/\.mojo$//' | sed 's/-mojo$//')
    
    # ============================================
    # 1. .cursorrules erstellen/aktualisieren
    # ============================================
    CURSORRULES="$PROJECT_DIR/.cursorrules"
    
    cat > "$CURSORRULES" << EOF
# $PROJECT - Cursor Rules

## ⚠️ PFLICHT: Platform Standards

Dieses Projekt MUSS sich an die Standards in \`platform.mojo\` halten:

- **Ökosystem:** /root/projects/platform.mojo/docs/MOJO_ECOSYSTEM.md
- **Coding Standards:** /root/projects/platform.mojo/docs/CODING_STANDARDS.md
- **Staging Konvention:** /root/projects/platform.mojo/docs/STAGING_SERVER_CONVENTION.md
- **Lokale Entwicklung:** /root/projects/platform.mojo/docs/LOCAL_DEVELOPMENT.md
- **Brand Guidelines:** /root/projects/platform.mojo/docs/brand/

## URLs

- **Staging:** https://${SERVICE_NAME}.staging.mojo-institut.de
- **Production:** https://${SERVICE_NAME}.mojo-institut.de

## Code-Prinzipien

- TypeScript ES6+ mit striktem Typing
- DRY - Keine Code-Duplikation
- Einfachheit vor Komplexität
- Health Check Endpoint ist PFLICHT (\`/health\`)

## Design System

- \`@gkeferstein/design\` Package verwenden
- MOJO-Terminologie beachten (siehe MOJO_GLOSSARY.md)
- Voice & Tone Guidelines befolgen

## CI/CD

- Push zu \`main\` → Staging Deployment
- Release Tag \`v*.*.*\` → Production Deployment
- Feature Branches → CI ohne Deployment (ci-pr.yml)

## GitHub Secrets (PFLICHT!)

- \`STAGING_SERVER\` - Staging Server
- \`STAGING_SSH_KEY\` - SSH Key für Staging
- \`PRODUCTION_SERVER\` - Production Server
- \`PRODUCTION_SSH_KEY\` - SSH Key für Production
- \`GHCR_TOKEN\` - GitHub Container Registry

## Referenzen

Repository: https://github.com/gkeferstein/platform.mojo
EOF
    echo "   ✅ .cursorrules"
    
    # ============================================
    # 2. ci-pr.yml hinzufügen (falls .github/workflows existiert)
    # ============================================
    WORKFLOWS_DIR="$PROJECT_DIR/.github/workflows"
    
    if [ -d "$WORKFLOWS_DIR" ]; then
        CI_PR="$WORKFLOWS_DIR/ci-pr.yml"
        
        if [ ! -f "$CI_PR" ]; then
            cp "$TEMPLATE_DIR/.github/workflows/ci-pr.yml" "$CI_PR"
            echo "   ✅ ci-pr.yml hinzugefügt"
        else
            echo "   ℹ️  ci-pr.yml existiert bereits"
        fi
    else
        echo "   ⚠️  Keine .github/workflows Struktur"
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Alle Projekte aktualisiert!"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Änderungen in jedem Projekt committen und pushen"
echo "   2. GitHub Secrets prüfen (falls noch nicht gesetzt)"
echo ""

