# MOJO Staging Server Konvention

> **Einheitliche Staging-Server-Konvention für alle MOJO Apps** – Build once, deploy many

**Version:** 1.4.0  
**Letzte Aktualisierung:** 01. Januar 2026

---

## Inhaltsverzeichnis

1. [Übersicht](#1-übersicht)
2. [Architektur-Entscheidungen](#2-architektur-entscheidungen)
3. [Domain-Konvention](#3-domain-konvention)
4. [Deployment-Strategie](#4-deployment-strategie)
5. [GitHub Secrets Konvention](#5-github-secrets-konvention)
6. [Server-Struktur](#6-server-struktur)
7. [Docker Compose Templates](#7-docker-compose-templates)
8. [Traefik Konfiguration](#8-traefik-konfiguration)
9. [Blue/Green Deployment](#9-bluegreen-deployment)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Security Policy](#11-security-policy)
12. [Health Check Standard](#12-health-check-standard)
13. [Onboarding-Checkliste](#13-onboarding-checkliste)
14. [Migrationsplan](#14-migrationsplan)
15. [Troubleshooting](#15-troubleshooting)
16. [Referenzen](#16-referenzen)
17. [Learnings & Best Practices](#17-learnings--best-practices)

---

## 1. Übersicht

### Ziel

Transformation des Dev-Servers zu einem dedizierten **Staging-Server** mit einheitlichen Konventionen für alle MOJO Apps. Der Staging-Server dient als:

- **Release-Candidate-Umgebung:** Stabile, prod-like Umgebung für finales Testing
- **Pre-Production:** Letzte Validierung vor Production Deployment
- **Zero-Touch Onboarding:** Neue Apps können ohne manuelle Konfiguration deployed werden

### Kernprinzip: Build Once, Deploy Many

**Wichtig:** Images werden **einmal** gebaut (in Staging), getestet, und dann mit **exakt gleichen Tags** auf Production deployed. Production führt **keine neuen Builds** durch.

```
Development → Staging (Build + Test) → Production (gleiche Images)
```

---

## 2. Architektur-Entscheidungen

### Umgebungen

| Umgebung | Domain Pattern | Zweck | Basic Auth |
|----------|---------------|-------|------------|
| **Staging** | `{app}.staging.mojo-institut.de` | Release-Candidate Testing | ✅ Ja |
| **Production** | `{app}.mojo-institut.de` | Live-Betrieb | ❌ Nein (nur Clerk) |

### Deployment-Trigger

| Umgebung | Trigger | Strategy |
|----------|---------|----------|
| **Staging** | Merge in `main` Branch | Blue/Green |
| **Production** | Release Tag `v*.*.*` | Blue/Green |

### Image-Strategie

- **Staging:** Build Images mit Tags: `sha-{commit}`, `main-latest`, `v{version}`
- **Production:** Pull **exakt gleiche Images** wie in Staging (gleiche Tags)
- **Keine Production-Builds:** Production verwendet nur bereits getestete Images

---

## 3. Domain-Konvention

### Staging Domain

```
{app}.staging.mojo-institut.de
```

**Beispiele:**
- `payments.staging.mojo-institut.de`
- `kontakte.staging.mojo-institut.de`
- `campus.staging.mojo-institut.de`

### Production Domain

```
{app}.mojo-institut.de
```

**Beispiele:**
- `payments.mojo-institut.de`
- `kontakte.mojo-institut.de`
- `campus.mojo-institut.de`

### Wildcard DNS

Für **zero-touch onboarding** sollte ein Wildcard DNS Eintrag konfiguriert werden:

```
*.staging.mojo-institut.de → Staging Server IP
```

Dies ermöglicht automatisches Routing ohne manuelle DNS-Konfiguration pro App.

### Migration von `dev.*`

**Alte Konvention:** `dev.{app}.mojo-institut.de`  
**Neue Konvention:** `{app}.staging.mojo-institut.de`

**Grund:** Wildcard DNS `*.staging.mojo-institut.de` funktioniert nur mit Subdomain-Struktur.

---

## 4. Deployment-Strategie

### Staging Deployment

**Trigger:** Automatisch bei Merge in `main` Branch

**Prozess:**
1. Tests ausführen
2. Docker Images bauen und taggen:
   - `sha-{commit-sha}`
   - `main-latest`
   - `v{version}` (falls Version vorhanden)
3. Images zu GHCR pushen
4. Blue/Green Deployment auf Staging
5. Health Check Validation
6. Smoke Tests

**Strategy:** Blue/Green Deployment (siehe [Blue/Green Deployment](#9-bluegreen-deployment))

### Production Deployment

**Trigger:** Release Tag (z.B. `v1.2.3`)

**Prozess:**
1. Release Tag erkennen
2. **Images aus Staging pullen** (gleiche Tags wie in Staging)
3. Blue/Green Deployment auf Production
4. Health Check Validation
5. Smoke Tests
6. Rollback bei Fehler

**Wichtig:** Production führt **keine neuen Builds** durch. Es werden exakt die gleichen Images verwendet, die bereits in Staging getestet wurden.

### Release-Prozess (Vollständig)

```
1. Development: Feature Branch → PR → Merge to main
2. Staging: Automatisches Deployment + Testing
3. Validation: Tests auf Staging durchführen
4. Release: Git Tag erstellen (z.B. v1.2.3)
5. Production: Release Pipeline deployed gleiche Images
6. Validation: Health Checks + Smoke Tests
```

---

## 5. GitHub Secrets Konvention

### Erforderliche Secrets

Für jedes Repository müssen folgende Secrets gesetzt sein:

#### Staging Secrets

| Secret | Beschreibung | Beispiel |
|--------|-------------|----------|
| `STAGING_SERVER` | Hostname/IP des Staging Servers | `staging.mojo-institut.de` oder IP |
| `STAGING_SSH_KEY` | SSH Private Key für Staging Server | Private Key (ohne Passphrase) |

#### Production Secrets

| Secret | Beschreibung | Beispiel |
|--------|-------------|----------|
| `PRODUCTION_SERVER` | Hostname/IP des Production Servers | `prod.mojo-institut.de` oder IP |
| `PRODUCTION_SSH_KEY` | SSH Private Key für Production Server | Private Key (ohne Passphrase) |

#### Shared Secrets

| Secret | Beschreibung | Beispiel |
|--------|-------------|----------|
| `GHCR_TOKEN` | GitHub Container Registry Token | Personal Access Token mit `read:packages` und `write:packages` |

### Migration von alten Secrets

**Alte Secrets (werden migriert):**
- `DEPLOY_SERVER` → `STAGING_SERVER`
- `SSH_PRIVATE_KEY` → `STAGING_SSH_KEY` (für Staging) + `PRODUCTION_SSH_KEY` (neu)

**Setup in GitHub:**
1. Repository → Settings → Secrets and variables → Actions
2. "New repository secret" für jeden Secret
3. Secrets hinzufügen gemäß obiger Tabelle

### SSH Key Setup

**Empfohlene Konvention:**
- Separate SSH Keys für Staging und Production
- Keys ohne Passphrase (für CI/CD)
- Keys mit eingeschränkten Berechtigungen

**Erstellung:**
```bash
# Staging Key
ssh-keygen -t ed25519 -C "github-actions-staging" -f ~/.ssh/staging_deploy_key
# Public Key auf Staging Server in ~/.ssh/authorized_keys

# Production Key
ssh-keygen -t ed25519 -C "github-actions-production" -f ~/.ssh/production_deploy_key
# Public Key auf Production Server in ~/.ssh/authorized_keys
```

---

## 6. Server-Struktur

### Verzeichnisstruktur

**Beibehalten:** `/root/projects/{app}/` (bereits vorhanden)

```
/root/projects/
├── {app}/
│   ├── docker-compose.yml          # Staging (oder docker-compose.staging.yml)
│   ├── docker-compose.production.yml  # Production
│   ├── docker-compose.blue.yml     # Blue Environment (optional)
│   ├── docker-compose.green.yml    # Green Environment (optional)
│   ├── .env                        # Staging Environment Variables
│   ├── .env.production             # Production Environment Variables (optional)
│   └── ...                         # App-spezifische Dateien
```

### Environment Variables

**Staging:** `.env` Datei im Projekt-Verzeichnis  
**Production:** `.env.production` oder separate Datei

**Beispiel `.env`:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@db:5432/dbname

# Clerk
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# App-spezifisch
APP_PORT=3000
LOG_LEVEL=info
```

---

## 7. Docker Compose Templates

### Staging Template

**Datei:** `/root/projects/.project-template/docker-compose.staging.yml`

**Kernmerkmale:**
- Traefik Labels für `{app}.staging.mojo-institut.de`
- Basic Auth Middleware (`staging-basicauth`)
- Health Check Endpoints
- `mojo-network` Integration
- Blue/Green Support

**Beispiel:**
```yaml
services:
  app:
    image: ghcr.io/gkeferstein/{app}:${VERSION:-latest}
    container_name: {app}-staging
    environment:
      - NODE_ENV=staging
      - PORT=3000
    expose:
      - "3000"
    networks:
      - mojo-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=mojo-network"
      - "traefik.http.routers.{app}-staging.rule=Host(`{app}.staging.mojo-institut.de`)"
      - "traefik.http.routers.{app}-staging.entrypoints=websecure"
      - "traefik.http.routers.{app}-staging.tls.certresolver=letsencrypt"
      - "traefik.http.routers.{app}-staging.middlewares=staging-basicauth@file,staging-headers@file"
      - "traefik.http.routers.{app}-staging.service={app}-staging"
      - "traefik.http.services.{app}-staging.loadbalancer.server.port=3000"

networks:
  mojo-network:
    external: true
```

### Production Template

**Datei:** `/root/projects/.project-template/docker-compose.production.yml`

**Kernmerkmale:**
- Traefik Labels für `{app}.mojo-institut.de`
- **Kein Basic Auth** (nur Clerk)
- Health Check Endpoints
- `mojo-network` Integration
- Blue/Green Support

**Beispiel:**
```yaml
services:
  app:
    image: ghcr.io/gkeferstein/{app}:${VERSION:-latest}
    container_name: {app}-production
    environment:
      - NODE_ENV=production
      - PORT=3000
    expose:
      - "3000"
    networks:
      - mojo-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=mojo-network"
      - "traefik.http.routers.{app}-prod.rule=Host(`{app}.mojo-institut.de`)"
      - "traefik.http.routers.{app}-prod.entrypoints=websecure"
      - "traefik.http.routers.{app}-prod.tls.certresolver=letsencrypt"
      - "traefik.http.routers.{app}-prod.service={app}-prod"
      - "traefik.http.services.{app}-prod.loadbalancer.server.port=3000"

networks:
  mojo-network:
    external: true
```

---

## 8. Traefik Konfiguration

### SSL/TLS Pflicht

**WICHTIG:** SSL/TLS ist **Pflicht** für alle Staging- und Production-Apps.

**Anforderungen:**
- ✅ Alle Routen müssen `entrypoints=websecure` verwenden (Port 443)
- ✅ Alle Routen müssen `tls.certresolver=letsencrypt` haben
- ✅ HTTP (Port 80) wird automatisch zu HTTPS umgeleitet
- ✅ Let's Encrypt Zertifikate werden automatisch ausgestellt und erneuert

**Traefik Konfiguration:**
- Entrypoint `web` (Port 80): Automatische Redirect zu `websecure`
- Entrypoint `websecure` (Port 443): TLS mit Let's Encrypt
- Certificate Resolver: `letsencrypt` (automatische Zertifikatsausstellung)

**Fehlerbehebung:**
- Wenn SSL nicht funktioniert: Prüfe DNS-Einträge (Domain muss auf Server zeigen)
- Zertifikat-Ausstellung kann 1-2 Minuten dauern beim ersten Mal
- Prüfe Traefik Logs: `docker logs mojo-traefik`

### Staging Middleware

**Datei:** `/root/infrastructure/traefik/config/staging-basicauth.yml`

```yaml
http:
  middlewares:
    staging-basicauth:
      basicAuth:
        usersFile: /traefik-config/staging-users.htpasswd
    
    staging-headers:
      headers:
        customRequestHeaders:
          X-Environment: staging
        customResponseHeaders:
          X-Robots-Tag: noindex
          X-Frame-Options: DENY
          X-Content-Type-Options: nosniff
```

### Basic Auth Credentials

**Datei:** `/root/infrastructure/traefik/config/staging-users.htpasswd`

**Erstellung:**
```bash
# htpasswd installieren (falls nicht vorhanden)
apt-get install apache2-utils

# User erstellen
htpasswd -c /root/infrastructure/traefik/config/staging-users.htpasswd staging-user

# Weitere User hinzufügen
htpasswd /root/infrastructure/traefik/config/staging-users.htpasswd staging-user-2
```

**Empfohlene Credentials:**
- Username: `staging` oder `mojo-staging`
- Passwort: Starkes, zufälliges Passwort

### Traefik Label Schema

#### Staging Labels (mit Clerk-Authentifizierung)

**Wichtig:** Für Apps mit Clerk-Authentifizierung müssen Clerk-Routen explizit von Basic Auth ausgeschlossen werden:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.docker.network=mojo-network"
  
  # Clerk Auth Routes (without Basic Auth to prevent loops) - HIGHEST PRIORITY
  - "traefik.http.routers.{app}-staging-clerk.rule=Host(`{app}.staging.mojo-institut.de`) && (PathPrefix(`/sign-in`) || PathPrefix(`/sign-up`) || PathPrefix(`/api/webhook`) || PathPrefix(`/api/clerk`))"
  - "traefik.http.routers.{app}-staging-clerk.entrypoints=websecure"
  - "traefik.http.routers.{app}-staging-clerk.tls.certresolver=letsencrypt"
  - "traefik.http.routers.{app}-staging-clerk.middlewares=staging-headers@file"
  - "traefik.http.routers.{app}-staging-clerk.service={app}-staging"
  - "traefik.http.routers.{app}-staging-clerk.priority=20"
  
  # Staging Route: {app}.staging.mojo-institut.de (exclude Clerk routes)
  - "traefik.http.routers.{app}-staging.rule=Host(`{app}.staging.mojo-institut.de`) && !PathPrefix(`/sign-in`) && !PathPrefix(`/sign-up`) && !PathPrefix(`/api/webhook`) && !PathPrefix(`/api/clerk`)"
  - "traefik.http.routers.{app}-staging.entrypoints=websecure"
  - "traefik.http.routers.{app}-staging.tls.certresolver=letsencrypt"
  - "traefik.http.routers.{app}-staging.middlewares=staging-basicauth@file,staging-headers@file"
  - "traefik.http.routers.{app}-staging.service={app}-staging"
  - "traefik.http.routers.{app}-staging.priority=1"
  
  # Service Definition
  - "traefik.http.services.{app}-staging.loadbalancer.server.port=${APP_PORT}"
```

**Prioritäten:**
- Clerk-Router: Priority 20 (höchste Priorität, keine Basic Auth)
- Frontend-Router: Priority 1 (niedrigste Priorität, mit Basic Auth)

#### Production Labels

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.docker.network=mojo-network"
  
  # Production Route: {app}.mojo-institut.de
  - "traefik.http.routers.{app}-prod.rule=Host(`{app}.mojo-institut.de`)"
  - "traefik.http.routers.{app}-prod.entrypoints=websecure"
  - "traefik.http.routers.{app}-prod.tls.certresolver=letsencrypt"
  - "traefik.http.routers.{app}-prod.service={app}-prod"
  
  # Service
  - "traefik.http.services.{app}-prod.loadbalancer.server.port=${APP_PORT}"
```

---

## 9. Blue/Green Deployment

### Konzept

Blue/Green Deployment ermöglicht Zero-Downtime Deployments durch parallele Umgebungen:

1. **Blue:** Aktuelle Production-Version (läuft)
2. **Green:** Neue Version (wird gestartet)
3. **Switch:** Traffic wird von Blue zu Green umgeleitet
4. **Cleanup:** Blue wird gestoppt (nach erfolgreichem Switch)

### Deployment Script

**WICHTIG:** Das Deployment-Script ist **direkt in die CI/CD Pipeline eingebettet**, nicht als separate Datei auf dem Server.

**Vorteile:**
- ✅ Keine Abhängigkeit von Server-Setup
- ✅ Versionierung über Git
- ✅ Einheitliche Logik für alle Apps
- ✅ Einfache Wartung und Updates

**Implementierung:**
Das Script wird als heredoc in den GitHub Actions Workflows eingebettet:

```yaml
- name: Deploy to Staging (Blue/Green)
  run: |
    ssh ... bash << 'DEPLOY_EOF'
    # Deployment Script Code hier...
    DEPLOY_EOF
```

**Prozess:**
1. Git Repository Setup (Clone/Checkout)
2. Pull Images (gleiche Tags)
3. Setze VERSION in .env
4. Starte Container mit docker-compose
5. Health Check (akzeptiert HTTP 401 für Staging)
6. Rollback bei Fehler (docker compose down)

**Referenz-Implementierung:**
Siehe `/root/projects/.project-template/.github/workflows/ci-staging.yml` und `ci-release.yml`

### Blue/Green mit Docker Compose

**Option 1: Separate Compose Files**
- `docker-compose.blue.yml` - Blue Environment
- `docker-compose.green.yml` - Green Environment

**Option 2: Container-Namen-Suffix**
- Blue: `{app}-blue-{env}`
- Green: `{app}-green-{env}`

**Empfehlung:** Option 2 (einfacher, weniger Dateien)

---

## 10. CI/CD Pipeline

### Staging Pipeline

**Datei:** `.github/workflows/ci-main.yml` oder `.github/workflows/ci-staging.yml`

**Trigger:** Push to `main` Branch

**Jobs:**
1. **Test:** Unit Tests, Integration Tests
2. **Build:** Docker Images bauen und taggen
3. **Push:** Images zu GHCR pushen
4. **Deploy Staging:** Blue/Green Deployment
5. **Health Check:** Validation nach Deployment
6. **Smoke Tests:** Basis-Funktionalität testen

**Image Tags:**
- `sha-{commit-sha}` (z.B. `sha-abc123def`)
- `main-latest`
- `v{version}` (falls Version in package.json)

### Release Pipeline

**Datei:** `.github/workflows/ci-release.yml`

**Trigger:** Release Tag `v*.*.*` (z.B. `v1.2.3`)

**Jobs:**
1. **Prepare Release:** Version aus Tag extrahieren und validieren
2. **Build Image (if needed):** Falls Image für Version nicht existiert, bauen und pushen
3. **Deploy to Staging:** Erst auf Staging deployen zur Validation
4. **Staging Health Check:** Health Check auf Staging durchführen
5. **Deploy to Production:** Gleiche Images auf Production deployen
6. **Production Health Check:** Health Check auf Production durchführen
7. **Create GitHub Release:** Release Notes und GitHub Release erstellen

**WICHTIG:** Release-Prozess validiert ERST auf Staging, DANN auf Production!

**Vorteile:**
- Gleiche Images werden auf beiden Umgebungen getestet
- Rollback möglich, falls Staging Health Check fehlschlägt
- Konsistenz zwischen Staging und Production garantiert

### Pipeline Template

Siehe `/root/projects/.project-template/.github/workflows/` für vollständige Templates.

---

## 11. Security Policy

### Staging Security

**Plattform-Level:**
- ✅ **Basic Auth:** Traefik Basic Auth Middleware
  - **Wichtig:** Clerk-Authentifizierungsrouten (`/sign-in`, `/sign-up`, `/api/webhook`, `/api/clerk`) müssen von Basic Auth ausgeschlossen werden, um Auth-Loops zu vermeiden
  - **Browser-Verhalten:** Browser cached Basic Auth Credentials automatisch und sendet sie bei jedem Request mit
  - **Bei Auth-Loops:** Browser-Cache leeren (Strg+Shift+Del) oder Inkognito-Modus verwenden
- ✅ **NoIndex:** `X-Robots-Tag: noindex` Header
- ✅ **Security Headers:** X-Frame-Options, X-Content-Type-Options

**App-Level:**
- ✅ **Clerk Authentication:** Wie in Production
- ✅ **HTTPS Only:** Traefik erzwingt HTTPS

### Production Security

**Plattform-Level:**
- ❌ **Kein Basic Auth:** Nur Clerk auf App-Level
- ✅ **Security Headers:** Standard Security Headers
- ✅ **HTTPS Only:** Traefik erzwingt HTTPS

**App-Level:**
- ✅ **Clerk Authentication:** Pflicht für alle geschützten Routes
- ✅ **Rate Limiting:** App-spezifisch implementiert

### Basic Auth Credentials

**Verwaltung:**
- Credentials in `/root/infrastructure/traefik/config/staging-users.htpasswd`
- Regelmäßige Rotation empfohlen
- Separate Credentials pro Team/Projekt (optional)

---

## 12. Health Check Standard

### Pflicht: `/health` Endpoint

**Alle Apps MÜSSEN** einen `/health` Endpoint implementieren.

### Health Check Response

**Format:**
```json
{
  "status": "ok",
  "service": "app-name",
  "version": "1.2.3",
  "uptime": 123456,
  "timestamp": "2025-12-29T12:00:00.000Z",
  "checks": {
    "database": "ok",
    "redis": "ok"
  }
}
```

**HTTP Status:**
- `200 OK`: Service ist gesund
- `503 Service Unavailable`: Service ist ungesund

### Docker Healthcheck

**Standard Healthcheck:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:${PORT}/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Alternative (curl):**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://127.0.0.1:${PORT}/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Health Check in CI/CD

**Nach Deployment:**
```bash
MAX_RETRIES=10
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    https://{app}.{env}.mojo-institut.de/health)
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health Check erfolgreich"
    exit 0
  fi
  
  echo "⚠️ Health Check fehlgeschlagen (HTTP $HTTP_CODE), warte ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done

echo "❌ Health Check nach $MAX_RETRIES Versuchen fehlgeschlagen"
exit 1
```

---

## 13. Onboarding-Checkliste

### Für neue Apps

1. ✅ **Projekt-Verzeichnis:** `/root/projects/{app}/` erstellen
2. ✅ **Docker Compose Staging:** `docker-compose.staging.yml` basierend auf Template
3. ✅ **Docker Compose Production:** `docker-compose.production.yml` basierend auf Template
4. ✅ **Traefik Labels:** Für `{app}.staging.mojo-institut.de` und `{app}.mojo-institut.de`
5. ✅ **Health Check:** `/health` Endpoint implementieren
6. ✅ **Docker Healthcheck:** In Compose definieren
7. ✅ **Environment Variables:** `.env` Dateien erstellen (Staging + Production)
8. ✅ **GitHub Secrets:** Alle erforderlichen Secrets setzen
9. ✅ **CI/CD Workflows:** Staging + Release Pipeline konfigurieren
10. ✅ **Erster Staging Deployment:** Testen auf Staging
11. ✅ **Erster Production Release:** Release Tag erstellen und testen

### Zero-Touch Onboarding

Mit Wildcard DNS `*.staging.mojo-institut.de` können neue Apps automatisch deployed werden:

1. Projekt-Verzeichnis erstellen
2. Docker Compose mit korrekten Traefik Labels
3. `docker compose up -d` ausführen
4. Traefik erkennt automatisch über Labels
5. DNS wird automatisch aufgelöst (Wildcard)

---

## 14. Migrationsplan

### Schrittweise Migration

#### Phase 1: Infrastruktur (1-2 Tage)

1. ✅ Traefik Basic Auth Middleware erstellen
2. ✅ Docker Compose Templates erstellen
3. ✅ Blue/Green Deployment Script erstellen
4. ✅ Dokumentation erstellen

#### Phase 2: CI/CD Templates (1 Tag)

1. ✅ Staging Pipeline Template aktualisieren
2. ✅ Release Pipeline Template aktualisieren
3. ✅ Secrets-Konvention dokumentieren

#### Phase 3: Pilot-Migration (1-2 Tage)

1. ✅ Eine App migrieren (z.B. `messaging.mojo`)
2. ✅ DNS von `dev.*` zu `{app}.staging.mojo-institut.de` ändern
3. ✅ Traefik Labels aktualisieren
4. ✅ CI/CD Workflows anpassen
5. ✅ Blue/Green Deployment testen
6. ✅ Release Pipeline testen

#### Phase 4: Rollout (1-2 Wochen)

1. ✅ Schrittweise alle Apps migrieren
2. ✅ GitHub Secrets migrieren (`DEPLOY_SERVER` → `STAGING_SERVER`)
3. ✅ Neue Secrets hinzufügen (`STAGING_SSH_KEY`, `PRODUCTION_SSH_KEY`, `PRODUCTION_SERVER`)
4. ✅ Alte `dev.*` Labels entfernen
5. ✅ Dokumentation aktualisieren

### Migration Checklist pro App

- [ ] Traefik Labels von `dev.*` zu `{app}.staging.mojo-institut.de` ändern
- [ ] Docker Compose Files aktualisieren (Staging + Production)
- [ ] CI/CD Workflows anpassen (Staging + Release Pipeline)
- [ ] GitHub Secrets setzen/aktualisieren
- [ ] Health Check validieren
- [ ] Blue/Green Deployment testen
- [ ] Release Pipeline testen
- [ ] DNS Einträge anpassen (falls nötig)

---

## 15. Troubleshooting

### Basic Auth Loop / Wiederholte Basic Auth Prompts

**Symptom:**
- Browser fragt immer wieder nach Basic Auth Credentials
- Nach Clerk Login erscheint erneut Basic Auth Prompt

**Ursache:**
- Browser cached Basic Auth Credentials und sendet sie bei jedem Request
- Nach Redirects kann es zu Inkonsistenzen kommen

**Lösung:**
1. **Browser-Cache leeren:**
   - Windows/Linux: `Strg + Shift + Del`
   - Mac: `Cmd + Shift + Del`
   - Oder: Inkognito/Private-Modus verwenden

2. **Konfiguration prüfen:**
   - Clerk-Routen müssen von Basic Auth ausgeschlossen sein
   - Router-Prioritäten müssen korrekt sein (Clerk: 20, Frontend: 1)

3. **Traefik Router prüfen:**
   ```bash
   docker exec mojo-traefik wget -qO- http://localhost:8080/api/http/routers | python3 -m json.tool | grep -A 10 "{app}-staging"
   ```

### SSL/TLS Zertifikat wird nicht ausgestellt

**Symptom:**
- `https://{app}.staging.mojo-institut.de` zeigt SSL-Fehler
- Let's Encrypt Rate Limit Fehler in Traefik Logs

**Lösung:**
1. **DNS prüfen:**
   ```bash
   dig {app}.staging.mojo-institut.de
   ```

2. **Traefik Logs prüfen:**
   ```bash
   docker logs mojo-traefik --tail 50 | grep -i "acme\|certificate\|letsencrypt"
   ```

3. **Rate Limit warten:**
   - Let's Encrypt Rate Limits: Max. 5 fehlgeschlagene Authorisierungen pro Stunde
   - Warten oder temporär HTTP verwenden

### Health Check schlägt fehl

**Symptom:**
- Blue/Green Deployment schlägt fehl
- Health Check gibt 503 zurück

**Lösung:**
1. **Health Endpoint testen:**
   ```bash
   curl -u mojo:mojo https://{app}.staging.mojo-institut.de/health
   ```

2. **Container Logs prüfen:**
   ```bash
   docker logs {app}-backend-staging --tail 50
   ```

3. **Health Check Konfiguration prüfen:**
   - Docker Healthcheck muss korrekt konfiguriert sein
   - `/health` Endpoint muss existieren und korrekt antworten

### Container startet nicht

**Symptom:**
- Container bleibt im Status "Starting"
- Container crasht sofort

**Lösung:**
1. **Container Logs prüfen:**
   ```bash
   docker logs {app}-backend-staging
   ```

2. **Environment Variables prüfen:**
   ```bash
   docker exec {app}-backend-staging env | grep -E "DB_|CLERK_|API_"
   ```

3. **Dependencies prüfen:**
   - Datenbank-Container muss healthy sein
   - Netzwerk `mojo-network` muss existieren

---

## 16. Referenzen

### Dokumentation

- **Ökosystem:** `/root/projects/MOJO_ECOSYSTEM.md`
- **Coding Standards:** `/root/projects/CODING_STANDARDS.md`
- **Design System:** `/root/projects/design.mojo/`

### Templates

- **Docker Compose Staging:** `/root/projects/.project-template/docker-compose.staging.yml`
- **Docker Compose Production:** `/root/projects/.project-template/docker-compose.production.yml`
- **CI/CD Staging:** `/root/projects/.project-template/.github/workflows/ci-staging.yml`
- **CI/CD Release:** `/root/projects/.project-template/.github/workflows/ci-release.yml`

### Scripts

- **Blue/Green Deployment:** Direkt in CI/CD Pipeline eingebettet (siehe Templates)
  - ❌ **VERALTET:** `/root/scripts/deploy-blue-green.sh` (nicht mehr benötigt, kann entfernt werden)

### Traefik

- **Traefik Config:** `/root/infrastructure/traefik/traefik.yml`
- **Staging Middleware:** `/root/infrastructure/traefik/config/staging-basicauth.yml`

---

## 17. Learnings & Best Practices

### Next.js 15 App Router + SSR/SSG

**Problem:** `'use client'` + `export const dynamic = 'force-dynamic'` verhindert SSG-Errors **NICHT**.

**Lösung:**
```tsx
// page.tsx
'use client'
import dynamic from 'next/dynamic'

const PageContent = dynamic(() => import('./page-content'), {
  ssr: false,
  loading: () => <div>Laden...</div>,
})

export default function Page() {
  return <PageContent />
}
```

**Erklärung:** `next/dynamic` mit `ssr: false` verhindert Server-Side-Rendering komplett und lädt die Komponente nur im Browser.

### pnpm Workspace Build-Reihenfolge

**Problem:** TypeScript DTS Build scheitert weil `workspace:*` Dependencies nicht gefunden werden.

**Lösung im Dockerfile:**
```dockerfile
# Build in korrekter Dependency-Reihenfolge
RUN pnpm --filter @gkeferstein/tokens build
RUN pnpm --filter @gkeferstein/design build
RUN pnpm --filter @mojo/ux build
RUN pnpm --filter @mojo/showcase build
```

**Regel:** Immer den Dependency-Graph beachten - Basis-Packages zuerst!

### Health Checks mit Basic Auth (Staging)

**Problem:** Staging mit Basic Auth gibt HTTP 401 zurück, Health Check scheitert.

**Lösung in CI/CD und deploy-blue-green.sh:**
```bash
# Accept 200 for production, and also 401 for staging (Basic Auth protected)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Health Check erfolgreich"
  exit 0
fi

# Staging is protected by Basic Auth, so 401 means the service is running
if [ "$ENVIRONMENT" = "staging" ] && [ "$HTTP_CODE" = "401" ]; then
  echo "✅ Health Check erfolgreich (Basic Auth aktiv)"
  exit 0
fi
```

**Erklärung:** HTTP 401 von Traefik bedeutet die App läuft, nur Auth fehlt. Das `deploy-blue-green.sh` Skript erkennt die Umgebung automatisch.

### Image-Naming Konvention

**WICHTIG:** Das `deploy-blue-green.sh` Skript erwartet folgende Image-Namen:

| Komponente | Image-Name | Beispiel |
|------------|------------|----------|
| Backend API | `{repo}-api` | `ghcr.io/gkeferstein/payments.mojo-api:v1.0.0` |
| Admin Frontend | `{repo}-admin` | `ghcr.io/gkeferstein/payments.mojo-admin:v1.0.0` |
| Web Frontend | `{repo}-web` | `ghcr.io/gkeferstein/accounts.mojo-web:v1.0.0` |
| Landing Page | `{repo}-landing` | `ghcr.io/gkeferstein/payments.mojo-landing:v1.0.0` |

**CI/CD Konfiguration:**
```yaml
# Backend API Image
- name: Extract metadata (Backend API)
  uses: docker/metadata-action@v5
  with:
    images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-api  # Beachte: -api Suffix!
```

### Image-Tagging Strategie

**Best Practice für Staging:**
```yaml
tags: |
  type=sha,prefix=,format=long
  type=raw,value=main-latest
  type=raw,value=${{ steps.version.outputs.version }}
```

**Vorteile:**
- `sha-{commit}`: Exakte Reproduzierbarkeit
- `main-latest`: Einfaches Re-Deploy
- `v{version}`: Semantische Versionierung für Release Pipeline

### GitHub Packages Authentication

**Problem:** `ERR_PNPM_FETCH_401` beim Install von `@gkeferstein/*` Packages.

**Lösung:**
```yaml
# In CI/CD Workflow
- name: Configure npm for GitHub Packages
  run: |
    echo "@gkeferstein:registry=https://npm.pkg.github.com" > ~/.npmrc
    echo "//npm.pkg.github.com/:_authToken=${{ secrets.GHCR_TOKEN }}" >> ~/.npmrc
```

**WICHTIG:** `GHCR_TOKEN` muss `read:packages` und `write:packages` Scopes haben.

### Version-Synchronisierung (package.json + src/version.ts)

**Problem:** Die Version in `package.json` und `src/version.ts` können auseinander laufen.

**Manuelle Synchronisierung:**
Wenn die Package-Version in `package.json` aktualisiert wird, muss auch die Version in `src/version.ts` manuell aktualisiert werden:

```typescript
// src/version.ts
export const VERSION = '1.2.3';  // Muss mit package.json übereinstimmen!
```

**Automatische Synchronisierung (empfohlen):**
Füge ein Build-Script hinzu, das die Version automatisch aus `package.json` synchronisiert:

```json
// package.json
{
  "scripts": {
    "prebuild": "node -e \"const pkg=require('./package.json'); const fs=require('fs'); fs.writeFileSync('src/version.ts', 'export const VERSION = \\'' + pkg.version + '\\';\\n');\""
  }
}
```

**Oder als separates Script:**
```bash
#!/bin/bash
# scripts/sync-version.sh
VERSION=$(node -p "require('./package.json').version")
echo "export const VERSION = '${VERSION}';" > src/version.ts
echo "✅ Version synchronized: ${VERSION}"
```

### Dependencies vs DevDependencies

**Problem:** `Cannot find module 'joi'` im Production Build.

**Ursache:** Package ist in `devDependencies` definiert, wird aber im Production-Code verwendet.

**Lösung:** Prüfe **alle** Imports in `src/` und stelle sicher, dass verwendete Packages in `dependencies` (nicht `devDependencies`) sind:

```json
// ❌ FALSCH: joi in devDependencies
{
  "devDependencies": {
    "joi": "^17.11.0"
  }
}

// ✅ RICHTIG: joi in dependencies
{
  "dependencies": {
    "joi": "^17.11.0"
  }
}
```

**Regel:** Alles was zur Runtime benötigt wird → `dependencies`. Alles was nur für Build/Test benötigt wird → `devDependencies`.

### Workflow Dispatch für manuelle Trigger

**Empfehlung:** Füge `workflow_dispatch` zu allen CI/CD Workflows hinzu:

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      force_deploy:
        description: 'Force deployment'
        required: false
        default: 'false'
        type: boolean
```

**Vorteile:**
- Manuelles Re-Run ohne Code-Änderung
- Debugging von Pipeline-Problemen
- Notfall-Deployments

### Deployment-Script in CI/CD Pipeline einbetten

**Konvention:** Das Blue/Green Deployment-Script wird direkt in die CI/CD Pipeline eingebettet (nicht als separate Datei auf dem Server).

**Vorteile:**
- ✅ Keine Server-Abhängigkeit (`/root/scripts/deploy-blue-green.sh` nicht mehr benötigt)
- ✅ Versionierung über Git
- ✅ Einheitliche Logik für alle Apps
- ✅ Einfache Wartung und Updates ohne Server-Zugriff

**Implementierung:**
```yaml
- name: Deploy to Staging
  run: |
    ssh ... bash << 'DEPLOY_EOF'
    # Deployment-Logik direkt hier...
    set -euo pipefail
    ENVIRONMENT="staging"
    # ... rest des Scripts ...
    DEPLOY_EOF
```

**Wichtig:** 
- Script-Logik ist Teil des Workflow-Files
- Keine externe Abhängigkeit mehr
- Änderungen werden mit Git versioniert

---

## Changelog

| Version | Datum | Änderungen |
|---------|-------|-----------|
| 1.4.0 | 01.01.2026 | Deployment-Script direkt in CI/CD Pipeline eingebettet (keine Server-Abhängigkeit mehr) |
| 1.3.0 | 01.01.2026 | Image-Naming Konvention, Version-Sync, Dependencies vs DevDependencies, Workflow Dispatch |
| 1.2.0 | 01.01.2026 | Learnings & Best Practices Sektion hinzugefügt |
| 1.1.0 | 31.12.2025 | Troubleshooting-Sektion hinzugefügt, Traefik Label Schema für Clerk-Auth aktualisiert |
| 1.0.0 | 29.12.2025 | Initial Release – Staging Server Konvention |

---

*MOJO Institut – System für chronische Gesundheit*

