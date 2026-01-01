# Repository-Struktur Anforderungen

> **Verpflichtende Dokumentations-Struktur für alle MOJO-Projekte**

**Version:** 1.0.0  
**Letzte Aktualisierung:** 01. Januar 2026

---

## Übersicht

Jedes MOJO-Projekt **MUSS** eine bestimmte Dokumentations-Struktur haben, damit neue Entwickler schnell loslegen können und Zugriff auf alle notwendigen Informationen haben.

---

## Verpflichtende Dateien

### 1. `SETUP.md` (PFLICHT)

**Zweck:** Schnellstart-Anleitung für neue Entwickler (5 Minuten zum Loslegen)

**Muss enthalten:**
- ✅ Voraussetzungen (Node.js, Docker, Git)
- ✅ **Repository-Setup mit `platform.mojo`** (PFLICHT!)
- ✅ Schnellstart-Anleitung (mit Traefik und ohne Docker)
- ✅ Health Check Test
- ✅ Nächste Schritte
- ✅ Troubleshooting
- ✅ Verweise auf README.md und zentrale Dokumentation

**Beispiel-Struktur:**
```markdown
# Setup-Anleitung für neue Entwickler

## Voraussetzungen
- Node.js >= 18.0.0
- Docker & Docker Compose
- Git

## Schnellstart (5 Minuten)

### 1. Repositories klonen

**WICHTIG:** Du brauchst sowohl das Projekt-Repository als auch `platform.mojo`...

### 2. Lokale Entwicklung starten
...
```

**Template:** Siehe `/root/projects/payments.mojo/SETUP.md` als Referenz

### 2. `README.md` (PFLICHT)

**Zweck:** Vollständige Projekt-Dokumentation

**Muss enthalten:**
- ✅ Quick Start Sektion mit **Repository-Setup** (inkl. `platform.mojo`)
- ✅ Lokale Entwicklung Sektion (vollständig, funktioniert ohne `platform.mojo`)
- ✅ Dokumentations-Sektion mit:
  - Verweis auf `SETUP.md`
  - **Zentrale Dokumentation (platform.mojo)** mit lokalen Links UND GitHub-Links
  - Projekt-spezifische Dokumentation

**Beispiel-Struktur:**
```markdown
## Quick Start

### Repository-Setup

**WICHTIG:** Klone auch `platform.mojo`...

## Lokale Entwicklung

[Vollständige Anleitung, funktioniert ohne platform.mojo]

## Dokumentation

### Zentrale Dokumentation (platform.mojo)

> **WICHTIG:** Du musst `platform.mojo` lokal klonen...
```

**Template:** Siehe `/root/projects/payments.mojo/README.md` als Referenz

---

## Repository-Setup Anforderung

### PFLICHT: `platform.mojo` Repository

**Jede App MUSS** in ihrer Dokumentation klar machen, dass `platform.mojo` geklont werden muss:

```markdown
### Repository-Setup

**WICHTIG:** Klone auch `platform.mojo` - die zentrale Dokumentation wird lokal benötigt:

```bash
# Projekt-Repository
git clone git@github.com:gkeferstein/{app}.mojo.git

# Platform-Repository (PFLICHT!)
cd ..
git clone git@github.com:gkeferstein/platform.mojo.git
cd {app}.mojo
```

**Struktur:**
```
~/projects/
├── {app}.mojo/      # ← Dieses Projekt
└── platform.mojo/   # ← Zentrale Dokumentation (PFLICHT!)
```

**Warum `platform.mojo`?**
- `.cursorrules` verweisen auf lokale Pfade
- Lokale Links in der Dokumentation funktionieren nur mit lokalem Repository
- Templates und Scripts für neue Projekte
- Zentrale Standards und Konventionen
```

### Verweise auf zentrale Dokumentation

**Jede App MUSS** zwei Arten von Links bereitstellen:

1. **Lokale Links** (benötigen `platform.mojo` Repository):
   ```markdown
   - 📖 [Lokale Entwicklung](../../platform.mojo/docs/LOCAL_DEVELOPMENT.md)
   ```

2. **GitHub-Links** (funktionieren ohne lokales Repository):
   ```markdown
   - 📖 [Lokale Entwicklung (GitHub)](https://github.com/gkeferstein/platform.mojo/blob/main/docs/LOCAL_DEVELOPMENT.md)
   ```

---

## Checkliste für neue Apps

Wenn du eine neue App erstellst, stelle sicher:

- [ ] `SETUP.md` existiert mit Repository-Setup (inkl. `platform.mojo`)
- [ ] `README.md` hat Quick Start mit Repository-Setup
- [ ] `README.md` hat vollständige "Lokale Entwicklung" Sektion
- [ ] `README.md` hat Dokumentations-Sektion mit:
  - [ ] Verweis auf `SETUP.md`
  - [ ] Zentrale Dokumentation mit lokalen Links
  - [ ] Zentrale Dokumentation mit GitHub-Links (Alternative)
  - [ ] Projekt-spezifische Dokumentation
- [ ] `.cursorrules` verweist auf `platform.mojo` Pfade

---

## Anpassung an die App

### Was anpassen?

1. **App-Namen** ersetzen:
   - `{app}.mojo` → z.B. `payments.mojo`
   - `{APP_NAME}` → z.B. `payments.mojo`

2. **Projekt-spezifische Details:**
   - Ports (falls abweichend)
   - Services (Backend, Frontend, etc.)
   - Environment-Variablen
   - Datenbank-Typ

3. **Projekt-spezifische Dokumentation:**
   - API-Dokumentation
   - Deployment-Details
   - Projekt-spezifische Konfiguration

### Was NICHT anpassen?

- ✅ Struktur von `SETUP.md` und `README.md`
- ✅ Verweise auf `platform.mojo`
- ✅ Repository-Setup Anweisungen
- ✅ Format der Dokumentations-Sektion

---

## Beispiele

### Gute Beispiele

- ✅ `payments.mojo/SETUP.md` - Vollständig mit `platform.mojo` Setup
- ✅ `payments.mojo/README.md` - Vollständig mit Repository-Setup und Dokumentation

### Template verwenden

Für neue Projekte:
```bash
# Template kopieren
cp /root/projects/payments.mojo/SETUP.md /root/projects/{neue-app}/SETUP.md
cp /root/projects/payments.mojo/README.md /root/projects/{neue-app}/README.md

# Platzhalter ersetzen
sed -i 's/payments.mojo/{neue-app}/g' SETUP.md README.md
sed -i 's/payments/{app-name}/g' SETUP.md README.md
```

---

## Warum diese Struktur?

### Problem

- Entwickler klonen nur das Projekt-Repository
- `.cursorrules` verweisen auf lokale `platform.mojo` Pfade
- Dokumentations-Links funktionieren nicht
- Entwickler wissen nicht, was zu tun ist

### Lösung

- ✅ `SETUP.md` erklärt explizit, dass `platform.mojo` geklont werden muss
- ✅ `README.md` hat vollständige lokale Entwicklung (funktioniert auch ohne `platform.mojo`)
- ✅ Beide Arten von Links (lokal UND GitHub)
- ✅ Klare Struktur, die in jeder App gleich ist

---

## Wartung

### Bei Änderungen in `platform.mojo`

Wenn sich zentrale Dokumentation ändert:
1. Alle Apps haben bereits die richtigen Links (lokal UND GitHub)
2. Entwickler müssen nur `platform.mojo` aktualisieren: `git pull`
3. Keine Änderungen in einzelnen Apps nötig

### Bei neuen Apps

1. `SETUP.md` und `README.md` von bestehender App kopieren
2. App-spezifische Details anpassen
3. Repository-Setup und Dokumentations-Links bleiben gleich

---

## Referenzen

- [Projekt-Setup Workflow](./PROJECT_SETUP.md) - Wie neue Projekte erstellt werden
- [Lokale Entwicklung](./LOCAL_DEVELOPMENT.md) - Zentrale Entwicklungs-Dokumentation
- [Staging Server Konvention](./STAGING_SERVER_CONVENTION.md) - Deployment-Konventionen

---

**Letzte Aktualisierung:** 01. Januar 2026

