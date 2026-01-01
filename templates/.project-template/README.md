# {APP_NAME}

> Teil des MOJO-Ökosystems – System für chronische Gesundheit

## 🌐 URLs

| Umgebung | URL |
|----------|-----|
| **Staging** | https://{SERVICE_NAME}.staging.mojo-institut.de |
| **Production** | https://{SERVICE_NAME}.mojo-institut.de |

## 🚀 Schnellstart

### Lokal entwickeln

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Health Check testen
curl http://localhost:3000/health
```

### Staging Deployment

```bash
# Docker Compose für Staging
docker compose -f docker-compose.staging.yml up -d

# Logs prüfen
docker compose -f docker-compose.staging.yml logs -f
```

## 📁 Projektstruktur

```
{APP_NAME}/
├── .github/
│   └── workflows/
│       ├── ci-staging.yml       # Push zu main → Staging
│       └── ci-release.yml       # Release Tag → Production
├── src/
│   └── index.js                 # Hauptanwendung
├── docker-compose.staging.yml   # Staging Config
├── docker-compose.production.yml # Production Config
├── Dockerfile
├── .cursorrules
├── package.json
└── README.md
```

## 🔧 CI/CD

### Automatische Deployments

| Trigger | Ziel | URL |
|---------|------|-----|
| Push zu `main` | Staging | {SERVICE_NAME}.staging.mojo-institut.de |
| Release Tag `v*.*.*` | Production | {SERVICE_NAME}.mojo-institut.de |

### GitHub Secrets (PFLICHT!)

Diese Secrets müssen im Repository gesetzt sein:

- `STAGING_SERVER` - Staging Server Hostname/IP
- `STAGING_SSH_KEY` - SSH Private Key für Staging
- `PRODUCTION_SERVER` - Production Server Hostname/IP
- `PRODUCTION_SSH_KEY` - SSH Private Key für Production
- `GHCR_TOKEN` - GitHub Container Registry Token

## 📋 Health Check

Alle MOJO Apps müssen einen `/health` Endpoint haben:

```bash
curl https://{SERVICE_NAME}.staging.mojo-institut.de/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "{SERVICE_NAME}",
  "version": "1.0.0",
  "uptime": 123456,
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

## 📚 Dokumentation

- [MOJO Ökosystem](https://github.com/gkeferstein/platform.mojo/blob/main/docs/MOJO_ECOSYSTEM.md)
- [Coding Standards](https://github.com/gkeferstein/platform.mojo/blob/main/docs/CODING_STANDARDS.md)
- [Staging Konvention](https://github.com/gkeferstein/platform.mojo/blob/main/docs/STAGING_SERVER_CONVENTION.md)

## 🔄 Release erstellen

```bash
# Version in package.json aktualisieren
npm version patch  # oder minor / major

# Release Tag erstellen und pushen
git push origin main --tags
```

---

*MOJO Institut – System für chronische Gesundheit*

