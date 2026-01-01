# Audit-Log Retention Policies

## Übersicht

Dieses Dokument definiert die Retention-Policies und Archivierungs-Strategien für Audit-Logs in allen MOJO-Projekten.

## Retention-Policies

### kontakte.mojo

**Format**: File-basiert (Winston Logger)
- **Dateien**: `logs/audit.log`, `logs/audit.log.1`, etc.
- **Max Dateigröße**: 5MB pro Datei
- **Max Dateien**: 10 Dateien
- **Gesamt**: ~50MB
- **Retention**: Automatisch durch Winston (älteste Dateien werden gelöscht)

**Empfehlung**: 
- Tägliche Überprüfung der Log-Größe
- Archivierung bei Bedarf (z.B. monatlich)

### payments.mojo

**Format**: Datenbank-basiert (PostgreSQL)
- **Tabelle**: `audit_log`
- **Retention**: 1 Jahr (empfohlen)
- **Archivierung**: Nach 1 Jahr

**Implementierung**:
```sql
-- Archivierung alter Einträge (> 1 Jahr)
CREATE TABLE audit_log_archive (
  LIKE audit_log INCLUDING ALL
);

-- Migration alter Einträge
INSERT INTO audit_log_archive
SELECT * FROM audit_log
WHERE changed_at < NOW() - INTERVAL '1 year';

-- Löschung alter Einträge (nach Archivierung)
DELETE FROM audit_log
WHERE changed_at < NOW() - INTERVAL '1 year';
```

**Cleanup-Job**: Täglich um 02:00 Uhr

### schnelltest.mojo

**Format**: Datenbank-basiert (SQLite)
- **Tabelle**: `audit_log`
- **Retention**: 1 Jahr (empfohlen)
- **Archivierung**: Nach 1 Jahr

**Implementierung**:
```sql
-- Archivierung alter Einträge (> 1 Jahr)
-- SQLite unterstützt keine separate Archiv-Tabelle einfach
-- Empfehlung: Export zu JSON/CSV und dann Löschung

-- Export alter Einträge
.mode json
.output audit_log_archive_YYYY_MM.json
SELECT * FROM audit_log
WHERE changed_at < datetime('now', '-1 year');

-- Löschung alter Einträge
DELETE FROM audit_log
WHERE changed_at < datetime('now', '-1 year');
```

**Cleanup-Job**: Täglich um 02:00 Uhr

## Archivierungs-Strategien

### 1. Komprimierung

Archivierte Logs sollten komprimiert werden:
- **Format**: GZIP
- **Dateiname**: `audit_log_archive_YYYY_MM.json.gz`

### 2. Langzeit-Speicherung

Empfohlene Speicherorte:
- **Cloud Storage**: AWS S3, Google Cloud Storage, Azure Blob Storage
- **Cold Storage**: AWS Glacier, Google Coldline
- **Lokaler Backup**: Externe Festplatte, NAS

### 3. Zugriff auf Archive

- **Lesbarkeit**: Archivierte Logs sollten weiterhin lesbar sein
- **Format**: JSON (für einfache Verarbeitung)
- **Dokumentation**: Metadaten über Archiv-Inhalt

## Implementierung

### payments.mojo - Cleanup-Skript

```typescript
// scripts/cleanup-audit-logs.ts
import { db } from '../src/infrastructure/database';
import { logger } from '../src/infrastructure/logging/logger';

async function cleanupAuditLogs() {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Archive old entries
    await db('audit_log_archive').insert(
      db('audit_log')
        .where('changed_at', '<', oneYearAgo)
        .select('*')
    );

    // Delete old entries
    const deleted = await db('audit_log')
      .where('changed_at', '<', oneYearAgo)
      .delete();

    logger.info('Audit log cleanup completed', {
      deletedCount: deleted,
      cutoffDate: oneYearAgo.toISOString(),
    });
  } catch (error) {
    logger.error('Audit log cleanup failed', { error });
    throw error;
  }
}
```

### schnelltest.mojo - Cleanup-Skript

```javascript
// scripts/cleanup-audit-logs.js
import Database from 'better-sqlite3';
import { writeFile, gzip } from 'fs/promises';
import path from 'path';
import logger from '../server/utils/logger.js';

async function cleanupAuditLogs() {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/mojo-regenerationscheck.db');
  const db = new Database(dbPath);

  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString();

    // Export old entries to JSON
    const oldEntries = db.prepare(`
      SELECT * FROM audit_log
      WHERE changed_at < ?
    `).all(oneYearAgoStr);

    if (oldEntries.length > 0) {
      const archiveFileName = `audit_log_archive_${oneYearAgo.getFullYear()}_${String(oneYearAgo.getMonth() + 1).padStart(2, '0')}.json`;
      const archivePath = path.join(__dirname, '../archives', archiveFileName);

      // Ensure archive directory exists
      await mkdir(path.dirname(archivePath), { recursive: true });

      // Write JSON file
      await writeFile(archivePath, JSON.stringify(oldEntries, null, 2));

      // Compress
      const gzipPath = `${archivePath}.gz`;
      // ... gzip implementation

      logger.info('Audit log archive created', {
        entryCount: oldEntries.length,
        archiveFile: archiveFileName,
      });
    }

    // Delete old entries
    const deleted = db.prepare(`
      DELETE FROM audit_log
      WHERE changed_at < ?
    `).run(oneYearAgoStr);

    logger.info('Audit log cleanup completed', {
      deletedCount: deleted.changes,
      cutoffDate: oneYearAgoStr,
    });
  } catch (error) {
    logger.error('Audit log cleanup failed', { error: error.message });
    throw error;
  } finally {
    db.close();
  }
}
```

## Cron-Jobs

### payments.mojo

```bash
# /etc/cron.d/audit-log-cleanup
0 2 * * * cd /root/projects/payments.mojo && npm run cleanup:audit-logs
```

### schnelltest.mojo

```bash
# /etc/cron.d/audit-log-cleanup
0 2 * * * cd /root/projects/schnelltest.mojo && node scripts/cleanup-audit-logs.js
```

## Monitoring

### Metriken

Überwache folgende Metriken:
- Anzahl Audit-Log-Einträge pro Tag
- Größe der Audit-Log-Tabelle/Dateien
- Anzahl archivierter Einträge
- Cleanup-Job-Erfolgsrate

### Alerts

Alarmiere bei:
- Cleanup-Job-Fehlern
- Ungewöhnlich hoher Anzahl von Einträgen
- Fehlgeschlagenen Archivierungen

## Compliance

### DSGVO

- **Löschung**: Audit-Logs können personenbezogene Daten enthalten
- **Retention**: Maximal 1 Jahr (oder nach gesetzlichen Anforderungen)
- **Anonymisierung**: Bei Archivierung können personenbezogene Daten anonymisiert werden

### Weitere Anforderungen

- **Finanzaufsicht**: Möglicherweise längere Retention erforderlich
- **Branchenspezifisch**: Je nach Branche können andere Anforderungen gelten

## Best Practices

1. **Regelmäßige Cleanups**: Täglich oder wöchentlich
2. **Backup vor Löschung**: Immer Backup vor Cleanup
3. **Testen**: Cleanup-Skripte in Test-Umgebung testen
4. **Dokumentation**: Archiv-Inhalt dokumentieren
5. **Monitoring**: Cleanup-Jobs überwachen















