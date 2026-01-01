# Lokale Entwicklung

> **Guide für lokale Entwicklung ohne Docker** – Hot Reload, Multi-Repo Setup, Feature Branches

**Version:** 1.0.0  
**Letzte Aktualisierung:** 01. Januar 2026

---

## Übersicht

Dieser Guide erklärt, wie du:
1. Lokal ohne Docker entwickelst (mit Hot Reload)
2. An mehreren MOJO-Repos gleichzeitig arbeitest
3. Feature Branches verwendest
4. Code vor dem Merge validierst

---

## Schnellstart: Einzelnes Projekt

### 1. Repository klonen

```bash
git clone git@github.com:gkeferstein/payments.mojo.git
cd payments.mojo
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Environment einrichten

```bash
# Template kopieren
cp .env.development.example .env.development

# Werte eintragen (z.B. Clerk Keys, Database URL)
nano .env.development
```

### 4. Development Server starten

```bash
npm run dev
```

Der Server startet mit **Hot Reload** – Änderungen werden automatisch neu geladen.

### 5. Health Check testen

```bash
curl http://localhost:3000/health
```

---

## Hot Reload Setup

### Für TypeScript-Projekte

Das Standard-Template verwendet `tsx watch` für Hot Reload:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts"
  }
}
```

### Für Next.js-Projekte

```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

### Für einfache JavaScript-Projekte

```json
{
  "scripts": {
    "dev": "node --watch src/index.js"
  }
}
```

---

## Multi-Repo Entwicklung

Wenn du gleichzeitig an mehreren MOJO-Repos arbeitest (z.B. `design.mojo` + `payments.mojo`):

### Option A: npm link (Einfach)

Ideal für schnelle Tests zwischen zwei Repos.

```bash
# 1. Im Package-Repo (design.mojo)
cd /root/projects/design.mojo/packages/design
npm run build
npm link

# 2. Im Consumer-Repo (payments.mojo)
cd /root/projects/payments.mojo
npm link @gkeferstein/design

# 3. Entwickeln - Änderungen nach 'npm run build' sofort sichtbar
```

**Wichtig:** Nach Änderungen in `design.mojo` musst du `npm run build` ausführen!

### Option B: pnpm Workspace (Empfohlen)

Ideal für kontinuierliche Entwicklung an mehreren Packages.

```bash
# 1. Workspace-Verzeichnis erstellen
mkdir -p ~/dev/mojo-workspace
cd ~/dev/mojo-workspace

# 2. pnpm-workspace.yaml erstellen
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'design.mojo/packages/*'
  - 'platform.mojo/packages/*'
  - 'payments.mojo'
  - 'kontakte.mojo'
EOF

# 3. Repos klonen
git clone git@github.com:gkeferstein/design.mojo.git
git clone git@github.com:gkeferstein/platform.mojo.git
git clone git@github.com:gkeferstein/payments.mojo.git

# 4. Dependencies installieren (pnpm verknüpft automatisch)
pnpm install

# 5. Alle Packages bauen
pnpm -r build
```

Jetzt sind alle lokalen Packages automatisch verknüpft!

### Option C: Lokale Overrides in package.json

Für temporäre lokale Entwicklung:

```json
{
  "overrides": {
    "@gkeferstein/design": "file:../design.mojo/packages/design"
  }
}
```

**Wichtig:** Vor dem Commit entfernen!

---

## Feature Branch Workflow

### 1. Feature Branch erstellen

```bash
git checkout main
git pull origin main
git checkout -b feature/mein-neues-feature
```

### 2. Lokal entwickeln

```bash
# Development Server starten
npm run dev

# In anderem Terminal: Tests laufen lassen
npm run test:watch
```

### 3. Code validieren (vor Push)

```bash
# Alle Checks lokal ausführen
npm run lint
npm run typecheck
npm run test
npm run build
```

### 4. Pushen

```bash
git add .
git commit -m "feat: Mein neues Feature"
git push -u origin feature/mein-neues-feature
```

### 5. CI läuft automatisch

Nach dem Push startet automatisch die CI-Pipeline (`ci-pr.yml`):
- ✅ Lint
- ✅ Type Check
- ✅ Tests
- ✅ Build

**Kein Deployment** – erst nach Merge zu `main`.

### 6. Pull Request erstellen

1. GitHub → "Compare & pull request"
2. Beschreibung ausfüllen
3. Review anfordern
4. Nach Approval: Merge zu `main`

### 7. Automatisches Staging Deployment

Nach dem Merge zu `main` startet automatisch das Staging Deployment.

---

## Lokale Datenbank

### PostgreSQL mit Docker (empfohlen)

```bash
# PostgreSQL starten
docker run -d \
  --name mojo-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16

# Datenbank erstellen
docker exec -it mojo-postgres psql -U postgres -c "CREATE DATABASE payments_dev;"
```

### PostgreSQL nativ (macOS)

```bash
brew install postgresql@16
brew services start postgresql@16
createdb payments_dev
```

### Prisma Migrations

```bash
# Migration erstellen
npx prisma migrate dev --name init

# Schema pushen (ohne Migration)
npx prisma db push

# Prisma Studio öffnen
npx prisma studio
```

---

## Lokale Services

### Alle Services einzeln starten

Für komplette lokale Entwicklung mit mehreren Services:

| Service | Port | Befehl |
|---------|------|--------|
| payments.mojo | 3000 | `cd payments.mojo && npm run dev` |
| kontakte.mojo | 3001 | `cd kontakte.mojo && npm run dev` |
| messaging.mojo | 3002 | `cd messaging.mojo && npm run dev` |
| campus.mojo | 3003 | `cd campus.mojo && npm run dev` |

### Mit docker-compose.local.yml (optional)

Falls du doch Docker für lokale Services nutzen möchtest:

```yaml
# docker-compose.local.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```bash
docker compose -f docker-compose.local.yml up -d
```

---

## Debugging

### VS Code Launch Config

Erstelle `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Dev Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Cursor AI

Die `.cursorrules` Datei ist bereits konfiguriert. Cursor AI kennt:
- Die MOJO-Konventionen
- Die Projektstruktur
- Die verfügbaren Commands

---

## Troubleshooting

### "Module not found: @gkeferstein/design"

**Ursache:** GitHub Packages Auth fehlt.

**Lösung:**
```bash
# .npmrc erstellen
echo "@gkeferstein:registry=https://npm.pkg.github.com" > ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc

# Dann neu installieren
npm install
```

### "Port 3000 already in use"

**Lösung:**
```bash
# Prozess finden und beenden
lsof -i :3000
kill -9 <PID>

# Oder anderen Port verwenden
PORT=3001 npm run dev
```

### "Database connection refused"

**Ursache:** PostgreSQL läuft nicht.

**Lösung:**
```bash
# Mit Docker
docker start mojo-postgres

# Oder nativ (macOS)
brew services start postgresql@16
```

### "Hot Reload funktioniert nicht"

**Ursache:** Falsches dev Script.

**Lösung für TypeScript:**
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts"
  }
}
```

### "Tests schlagen fehl nach npm link"

**Ursache:** Doppelte Dependencies durch Link.

**Lösung:**
```bash
# Link entfernen
npm unlink @gkeferstein/design

# Normal installieren
npm install
```

---

## Checkliste für neue Entwickler

- [ ] Node.js 20+ installiert
- [ ] pnpm installiert (`npm install -g pnpm`)
- [ ] GitHub SSH Key eingerichtet
- [ ] GitHub Packages Auth konfiguriert (`.npmrc`)
- [ ] Lokale PostgreSQL verfügbar
- [ ] VS Code / Cursor mit Extensions

### Empfohlene VS Code Extensions

- ESLint
- Prettier
- Prisma
- TypeScript Vue Plugin (für Vue-Projekte)
- Tailwind CSS IntelliSense

---

## Referenzen

- [MOJO Ökosystem](./MOJO_ECOSYSTEM.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [Projekt-Setup](./PROJECT_SETUP.md)
- [GitHub Secrets](./GITHUB_SECRETS.md)

---

*MOJO Institut – System für chronische Gesundheit*

