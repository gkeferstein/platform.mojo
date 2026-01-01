# GitHub Secrets Guide

> **Konfiguration der GitHub Secrets für MOJO CI/CD Pipelines**

**Version:** 1.0.0  
**Letzte Aktualisierung:** 01. Januar 2026

---

## Übersicht

Alle MOJO-Projekte benötigen GitHub Secrets für automatisierte Deployments. Diese Secrets dürfen **NIEMALS** im Code committet werden.

---

## Erforderliche Secrets

Für jedes Repository müssen folgende Secrets gesetzt werden:

### Staging

| Secret | Beschreibung | Beispiel |
|--------|--------------|----------|
| `STAGING_SERVER` | Hostname/IP des Staging Servers | `staging.mojo-institut.de` oder IP |
| `STAGING_SSH_KEY` | SSH Private Key für Staging Server | Kompletter Private Key |

### Production

| Secret | Beschreibung | Beispiel |
|--------|--------------|----------|
| `PRODUCTION_SERVER` | Hostname/IP des Production Servers | `prod.mojo-institut.de` oder IP |
| `PRODUCTION_SSH_KEY` | SSH Private Key für Production Server | Kompletter Private Key |

### Shared

| Secret | Beschreibung | Beispiel |
|--------|--------------|----------|
| `GHCR_TOKEN` | GitHub Container Registry Token | Personal Access Token |

---

## Setup-Anleitung

### Schritt 1: SSH Keys erstellen

```bash
# Staging Key
ssh-keygen -t ed25519 -C "github-actions-staging" -f ~/.ssh/staging_deploy_key
# Keine Passphrase eingeben!

# Production Key
ssh-keygen -t ed25519 -C "github-actions-production" -f ~/.ssh/production_deploy_key
# Keine Passphrase eingeben!
```

### Schritt 2: Public Keys auf Server installieren

```bash
# Staging Server
ssh-copy-id -i ~/.ssh/staging_deploy_key.pub root@<STAGING_SERVER>

# Production Server
ssh-copy-id -i ~/.ssh/production_deploy_key.pub root@<PRODUCTION_SERVER>
```

### Schritt 3: Private Keys zu GitHub hinzufügen

1. **Repository öffnen:** GitHub → Repository → Settings
2. **Secrets öffnen:** Secrets and variables → Actions
3. **Secret hinzufügen:** "New repository secret"
4. **Name:** `STAGING_SSH_KEY`
5. **Value:** Kompletter Private Key Inhalt:
   ```bash
   cat ~/.ssh/staging_deploy_key
   # Kopiere ALLES inkl. -----BEGIN OPENSSH PRIVATE KEY----- und -----END OPENSSH PRIVATE KEY-----
   ```
6. Wiederholen für `PRODUCTION_SSH_KEY`

### Schritt 4: Server-Adressen hinzufügen

1. **Secret:** `STAGING_SERVER` → Hostname oder IP
2. **Secret:** `PRODUCTION_SERVER` → Hostname oder IP

### Schritt 5: GHCR Token hinzufügen

1. **Personal Access Token erstellen:**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Scopes: `read:packages`, `write:packages`
2. **Secret:** `GHCR_TOKEN` → Token-Wert

---

## Verwendung in Workflows

### Staging Pipeline (ci-staging.yml)

```yaml
- name: Deploy to Staging
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.STAGING_SERVER }}
    username: root
    key: ${{ secrets.STAGING_SSH_KEY }}
    script: |
      cd /root/projects/${{ github.event.repository.name }}
      # Deployment commands...
```

### Release Pipeline (ci-release.yml)

```yaml
- name: Deploy to Production
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.PRODUCTION_SERVER }}
    username: root
    key: ${{ secrets.PRODUCTION_SSH_KEY }}
    script: |
      cd /root/projects/${{ github.event.repository.name }}
      # Deployment commands...
```

---

## Migration von alten Secrets

Falls noch alte Secrets verwendet werden:

| Alt (veraltet) | Neu |
|----------------|-----|
| `DEPLOY_SERVER` | `STAGING_SERVER` |
| `SSH_PRIVATE_KEY` | `STAGING_SSH_KEY` + `PRODUCTION_SSH_KEY` |

### Migrations-Schritte

1. Neue Secrets hinzufügen (wie oben beschrieben)
2. CI/CD Workflows aktualisieren (ci-staging.yml, ci-release.yml)
3. Erste Deployments testen
4. Alte Secrets entfernen

---

## Sicherheitshinweise

| ❌ Verboten | ✅ Richtig |
|------------|-----------|
| Server-IPs im Code | Secrets verwenden |
| SSH Keys committen | Nur in GitHub Secrets |
| Secrets teilen | Separate Keys pro Server |
| Passwort-geschützte Keys | Keys ohne Passphrase (für CI) |

---

## Troubleshooting

### "STAGING_SERVER Secret nicht gesetzt"

**Lösung:** Secret in Repository Settings hinzufügen

### "Permission denied (publickey)"

**Lösung:**
1. Prüfe ob Public Key auf Server installiert ist
2. Prüfe ob Private Key komplett kopiert wurde (inkl. BEGIN/END Zeilen)
3. Teste SSH manuell: `ssh -i ~/.ssh/staging_deploy_key root@<SERVER>`

### "Image not found"

**Lösung:**
1. Prüfe `GHCR_TOKEN` Secret
2. Token braucht `read:packages` und `write:packages` Scopes

---

## Checkliste pro Repository

- [ ] `STAGING_SERVER` gesetzt
- [ ] `STAGING_SSH_KEY` gesetzt (kompletter Private Key)
- [ ] `PRODUCTION_SERVER` gesetzt
- [ ] `PRODUCTION_SSH_KEY` gesetzt (kompletter Private Key)
- [ ] `GHCR_TOKEN` gesetzt (mit korrekten Scopes)
- [ ] Public Keys auf Servern installiert
- [ ] Erstes Staging Deployment getestet
- [ ] Erstes Production Release getestet

---

*MOJO Institut – System für chronische Gesundheit*

