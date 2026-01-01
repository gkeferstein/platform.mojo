# Projekt-Setup Workflow

> **Standard-Workflow für neue MOJO-Projekte** – Von der Erstellung bis zum ersten Deployment

**Version:** 2.0.0  
**Letzte Aktualisierung:** 01. Januar 2026

---

## Übersicht

Jedes neue MOJO-Projekt sollte:
1. ✅ Standard-Struktur mit CI/CD Pipelines haben
2. ✅ Separate Docker Compose für Staging und Production
3. ✅ Health Check Endpoint implementieren
4. ✅ Automatisch per Traefik erreichbar sein

---

## Neues Projekt erstellen

### Automatisch (Empfohlen)

```bash
/root/projects/platform.mojo/scripts/create-new-project.sh <projektname>
```

**Beispiel:**
```bash
/root/projects/platform.mojo/scripts/create-new-project.sh billing.mojo
```

Das Script erstellt automatisch:
- Projektverzeichnis mit Standard-Struktur
- `.github/workflows/ci-staging.yml` – Staging Pipeline
- `.github/workflows/ci-release.yml` – Production Pipeline
- `docker-compose.staging.yml` – Docker für Staging
- `docker-compose.production.yml` – Docker für Production
- `Dockerfile` für Container-Build
- `.cursorrules` für Cursor AI
- Health Check Endpoint (`/health`)
- `README.md` mit Projekt-Dokumentation

### Manuell

1. **Projektverzeichnis erstellen:**
   ```bash
   mkdir -p /root/projects/mein-projekt
   cd /root/projects/mein-projekt
   ```

2. **Template kopieren:**
   ```bash
   cp -r /root/projects/platform.mojo/templates/.project-template/* .
   cp -r /root/projects/platform.mojo/templates/.project-template/.* . 2>/dev/null || true
   ```

3. **Platzhalter ersetzen:**
   - `{APP_NAME}` → Projektname (z.B. `billing.mojo`)
   - `{SERVICE_NAME}` → Service-Name (z.B. `billing`)

4. **Docker Container starten:**
   ```bash
   docker compose -f docker-compose.staging.yml up -d
   ```

---

## Projektstruktur

```
projektname/
├── .github/
│   └── workflows/
│       ├── ci-staging.yml       # Staging CI/CD Pipeline
│       └── ci-release.yml       # Production Release Pipeline
├── src/
│   └── index.js                 # Hauptanwendung mit /health Endpoint
├── docker-compose.staging.yml   # Docker für Staging
├── docker-compose.production.yml # Docker für Production
├── Dockerfile                   # Container Definition
├── .cursorrules                 # Cursor AI Regeln
├── package.json                 # Node.js Dependencies
└── README.md                    # Projekt-Dokumentation
```

---

## URL-Konvention

| Umgebung | Pattern | Beispiel |
|----------|---------|----------|
| **Staging** | `{service}.staging.mojo-institut.de` | `billing.staging.mojo-institut.de` |
| **Production** | `{service}.mojo-institut.de` | `billing.mojo-institut.de` |

**Wildcard DNS:** `*.staging.mojo-institut.de` zeigt auf den Staging-Server für automatisches Routing.

---

## CI/CD Pipeline

### Trigger

| Trigger | Ziel | Strategie |
|---------|------|-----------|
| Push zu `main` | Staging | Blue/Green |
| Release Tag `v*.*.*` | Production | Blue/Green |

### GitHub Secrets (PFLICHT!)

Für jedes Repository müssen diese Secrets gesetzt werden:

| Secret | Beschreibung | Pflicht |
|--------|--------------|---------|
| `STAGING_SERVER` | Hostname/IP des Staging Servers | ✅ Ja |
| `STAGING_SSH_KEY` | SSH Private Key für Staging | ✅ Ja |
| `PRODUCTION_SERVER` | Hostname/IP des Production Servers | ✅ Ja |
| `PRODUCTION_SSH_KEY` | SSH Private Key für Production | ✅ Ja |
| `GHCR_TOKEN` | GitHub Container Registry Token | ✅ Ja |

**Setup in GitHub:**
1. Repository → Settings → Secrets and variables → Actions
2. "New repository secret" für jeden Secret
3. Alle 5 Secrets hinzufügen

**Wichtig:**
- ❌ **NIEMALS** Server-IPs hardcoden!
- ❌ **NIEMALS** SSH Keys committen!
- ✅ **IMMER** über GitHub Secrets konfigurieren!

---

## Health Check (PFLICHT!)

Alle Apps MÜSSEN einen `/health` Endpoint implementieren.

### Response Format

```json
{
  "status": "ok",
  "service": "billing-api",
  "version": "1.2.3",
  "uptime": 123456,
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

### Implementation (Express)

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: process.env.SERVICE_NAME || 'unknown',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
```

### Docker Healthcheck

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## Docker Compose

### Staging (`docker-compose.staging.yml`)

```yaml
services:
  app:
    image: ghcr.io/gkeferstein/{app}-api:${VERSION:-main-latest}
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
      - "traefik.http.routers.{app}-staging.middlewares=staging-basicauth@file"
      - "traefik.http.services.{app}-staging.loadbalancer.server.port=3000"

networks:
  mojo-network:
    external: true
```

### Production (`docker-compose.production.yml`)

```yaml
services:
  app:
    image: ghcr.io/gkeferstein/{app}-api:${VERSION:-latest}
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
      - "traefik.http.services.{app}-prod.loadbalancer.server.port=3000"

networks:
  mojo-network:
    external: true
```

**Unterschied:** Staging hat `staging-basicauth@file` Middleware, Production nicht.

---

## Projekt starten

### Lokal (Development)

```bash
cd /root/projects/mein-projekt
npm install
npm run dev
```

### Staging

```bash
cd /root/projects/mein-projekt
docker compose -f docker-compose.staging.yml up -d
```

### Production

Production Deployment erfolgt automatisch über CI/CD bei Release Tag.

---

## Checkliste für neue Projekte

### Erstellung

- [ ] Projekt mit `create-new-project.sh` erstellt
- [ ] Platzhalter ersetzt (`{APP_NAME}`, `{SERVICE_NAME}`)
- [ ] `.cursorrules` angepasst (falls nötig)
- [ ] `README.md` aktualisiert

### GitHub Setup

- [ ] Repository auf GitHub erstellt
- [ ] `STAGING_SERVER` Secret gesetzt
- [ ] `STAGING_SSH_KEY` Secret gesetzt
- [ ] `PRODUCTION_SERVER` Secret gesetzt
- [ ] `PRODUCTION_SSH_KEY` Secret gesetzt
- [ ] `GHCR_TOKEN` Secret gesetzt

### Erstes Deployment

- [ ] Code zu `main` gepusht
- [ ] Staging Pipeline erfolgreich
- [ ] App erreichbar unter `{app}.staging.mojo-institut.de`
- [ ] Health Check funktioniert

### Production Release

- [ ] Release Tag erstellt (`git tag v1.0.0 && git push origin v1.0.0`)
- [ ] Release Pipeline erfolgreich
- [ ] App erreichbar unter `{app}.mojo-institut.de`

---

## Troubleshooting

### Pipeline schlägt fehl: "Secret nicht gesetzt"

**Ursache:** GitHub Secrets fehlen.

**Lösung:**
1. Repository → Settings → Secrets
2. Alle 5 Secrets hinzufügen

### Container startet nicht

**Ursache:** Port-Konflikt oder fehlende Umgebungsvariablen.

**Lösung:**
```bash
docker compose -f docker-compose.staging.yml logs
docker compose -f docker-compose.staging.yml down
docker compose -f docker-compose.staging.yml up -d
```

### App nicht erreichbar

**Ursache:** Traefik erkennt Container nicht.

**Lösung:**
```bash
# Prüfe Labels
docker inspect {app}-staging | grep -i traefik

# Prüfe Netzwerk
docker network inspect mojo-network

# Prüfe Traefik Logs
docker logs mojo-traefik --tail 50
```

### Health Check schlägt fehl

**Ursache:** `/health` Endpoint nicht implementiert oder falscher Port.

**Lösung:**
1. `/health` Endpoint implementieren
2. Port in Docker Healthcheck prüfen
3. Container-Logs prüfen

---

## Referenzen

- **Ökosystem:** `platform.mojo/docs/MOJO_ECOSYSTEM.md`
- **Coding Standards:** `platform.mojo/docs/CODING_STANDARDS.md`
- **Staging Konvention:** `platform.mojo/docs/STAGING_SERVER_CONVENTION.md`
- **Projekt-Template:** `platform.mojo/templates/.project-template/`

---

## Changelog

| Version | Datum | Änderungen |
|---------|-------|------------|
| 2.0.0 | 01.01.2026 | Komplett überarbeitet: Neue URL-Konvention, neue Secrets, separate Docker Compose |
| 1.0.0 | 26.12.2025 | Initial Release |

---

*MOJO Institut – System für chronische Gesundheit*

