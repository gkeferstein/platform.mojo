# platform.mojo

> **Zentrale Platform für das MOJO-Ökosystem** – Dokumentation, Templates, Scripts und Shared Packages

**Version:** 1.0.0  
**Letzte Aktualisierung:** 01. Januar 2026

---

## 🎯 Übersicht

`platform.mojo` ist das zentrale Repository für alle plattformweiten Ressourcen des MOJO-Ökosystems:

| Bereich | Beschreibung |
|---------|--------------|
| **docs/** | Zentrale Dokumentation (Ökosystem, Standards, Konventionen) |
| **templates/** | Projekt-Templates für neue MOJO Apps |
| **scripts/** | Zentrale Scripts (Projekt-Erstellung, Deployment) |
| **packages/** | Shared Backend-Packages (Tenant Middleware) |

---

## 📁 Struktur

```
platform.mojo/
├── docs/                              # Zentrale Dokumentation
│   ├── MOJO_ECOSYSTEM.md              # Ökosystem-Übersicht
│   ├── CODING_STANDARDS.md            # Coding Standards
│   ├── STAGING_SERVER_CONVENTION.md   # Deployment-Konventionen
│   ├── PROJECT_SETUP.md               # Projekt-Setup-Workflow
│   ├── GITHUB_SECRETS.md              # GitHub Secrets Guide
│   ├── AUDIT_LOGGING_STANDARD.md      # Audit-Logging
│   └── brand/                         # Brand Guidelines
│       ├── VOICE_AND_TONE.md          # Brand Voice
│       └── MOJO_GLOSSARY.md           # MOJO-Terminologie
│
├── templates/                         # Projekt-Templates
│   └── .project-template/
│       ├── .github/workflows/
│       │   ├── ci-staging.yml         # Staging Pipeline
│       │   └── ci-release.yml         # Production Pipeline
│       ├── docker-compose.staging.yml
│       ├── docker-compose.production.yml
│       ├── Dockerfile
│       ├── .cursorrules
│       └── README.md
│
├── scripts/                           # Zentrale Scripts
│   ├── create-new-project.sh          # Projekt-Erstellung
│   ├── setup-dev-environment.sh       # Dev-Environment Setup
│   ├── setup-git-ssh.sh               # Git SSH Setup
│   └── local-ci.sh                    # Lokales CI-Testing
│
├── packages/                          # Shared Backend-Packages
│   └── tenant/                        # @gkeferstein/tenant
│       ├── src/
│       └── package.json
│
└── config/                            # Zentrale Konfiguration
    └── port-registry.json             # Port-Registry
```

---

## 🚀 Neues Projekt erstellen

```bash
# Standard-Skript verwenden
/root/projects/platform.mojo/scripts/create-new-project.sh <projektname>

# Beispiel
/root/projects/platform.mojo/scripts/create-new-project.sh billing.mojo
```

Das Script erstellt automatisch:
- Projektverzeichnis mit Standard-Struktur
- CI/CD Pipelines (Staging + Release)
- Docker Compose Dateien (Staging + Production)
- Health Check Endpoint
- `.cursorrules` für Cursor AI

---

## 📚 Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| [MOJO_ECOSYSTEM.md](./docs/MOJO_ECOSYSTEM.md) | Vision, Mission, App-Katalog, User Journey |
| [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md) | Technische Standards, API, Design System |
| [STAGING_SERVER_CONVENTION.md](./docs/STAGING_SERVER_CONVENTION.md) | Deployment, CI/CD, Blue/Green |
| [PROJECT_SETUP.md](./docs/PROJECT_SETUP.md) | Projekt-Setup-Workflow |
| [VOICE_AND_TONE.md](./docs/brand/VOICE_AND_TONE.md) | Brand Voice Guidelines |
| [MOJO_GLOSSARY.md](./docs/brand/MOJO_GLOSSARY.md) | MOJO-spezifische Terminologie |

---

## 📦 Shared Packages

### @gkeferstein/tenant

Unified Tenant Middleware für Multitenancy:

```bash
pnpm add @gkeferstein/tenant
```

```typescript
import { fastifyTenantPlugin } from '@gkeferstein/tenant'

fastify.register(fastifyTenantPlugin, {
  findById: (id) => prisma.tenant.findUnique({ where: { id } }),
  findBySlug: (slug) => prisma.tenant.findUnique({ where: { slug } }),
})
```

---

## 🔗 Verwandte Repositories

| Repository | Beschreibung |
|------------|--------------|
| [design.mojo](https://github.com/gkeferstein/design.mojo) | Design System (`@gkeferstein/design`) |
| [admin.mojo](https://github.com/gkeferstein/admin.mojo) | Platform Administration |

---

## 📋 Konventionen

### Domain-Konvention

```
Staging:    {app}.staging.mojo-institut.de
Production: {app}.mojo-institut.de
```

### GitHub Secrets

| Secret | Beschreibung |
|--------|--------------|
| `STAGING_SERVER` | Hostname/IP des Staging Servers |
| `STAGING_SSH_KEY` | SSH Private Key für Staging |
| `PRODUCTION_SERVER` | Hostname/IP des Production Servers |
| `PRODUCTION_SSH_KEY` | SSH Private Key für Production |
| `GHCR_TOKEN` | GitHub Container Registry Token |

### Branch-Strategie

| Trigger | Ziel |
|---------|------|
| Push zu `main` | Staging Deployment |
| Release Tag `v*.*.*` | Production Deployment |

---

## 🛠️ Development

### Tenant Package bauen

```bash
cd packages/tenant
pnpm install
pnpm build
```

### Tenant Package veröffentlichen

```bash
cd packages/tenant
pnpm publish
```

---

## 📄 Lizenz

UNLICENSED - Internal MOJO Package

---

*MOJO Institut – System für chronische Gesundheit*

