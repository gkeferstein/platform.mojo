# Audit-Logging Standard

## Übersicht

Dieses Dokument definiert den einheitlichen Standard für Audit-Logging in allen MOJO-Projekten (kontakte.mojo, payments.mojo, schnelltest.mojo).

## Ziele

- **Nachvollziehbarkeit**: Alle kritischen Geschäftsprozesse müssen nachvollziehbar sein
- **Compliance**: Audit-Logs für rechtliche und regulatorische Anforderungen
- **Sicherheit**: Überwachung von Zugriffen und Änderungen
- **Resilienz**: Audit-Logging darf Hauptoperationen nicht beeinträchtigen
- **Konsistenz**: Einheitliche Struktur über alle Projekte

## Audit-Log-Struktur

### Gemeinsame Felder

Alle Audit-Log-Einträge müssen folgende Felder enthalten:

| Feld | Typ | Beschreibung | Pflicht |
|------|-----|--------------|---------|
| `entity_type` | string | Typ der betroffenen Entität (z.B. 'order', 'payment', 'session', 'admin') | ✅ |
| `entity_id` | string | ID der betroffenen Entität | ⚠️ Optional |
| `action` | string | Durchgeführte Aktion (z.B. 'create', 'update', 'status_change', 'login_success') | ✅ |
| `field_name` | string | Name des geänderten Feldes (bei Update-Aktionen) | ⚠️ Optional |
| `old_value` | string (JSON) | Alter Wert (als JSON-String) | ⚠️ Optional |
| `new_value` | string (JSON) | Neuer Wert (als JSON-String) | ⚠️ Optional |
| `changed_by` | string | Wer/Was die Änderung vorgenommen hat | ✅ |
| `change_reason` | string | Grund für die Änderung | ⚠️ Optional |
| `request_id` | string | Request-ID zur Nachverfolgung | ⚠️ Optional |
| `metadata` | object (JSON) | Zusätzliche Metadaten | ⚠️ Optional |
| `changed_at` | timestamp | Zeitpunkt der Änderung | ✅ (automatisch) |

### Entity Types

#### kontakte.mojo & payments.mojo
- `order` - Bestellungen
- `payment` - Zahlungen
- `invoice` - Rechnungen
- `channel_config` - Kanal-Konfigurationen
- `payment_provider` - Zahlungsanbieter
- `api_key` - API-Schlüssel
- `customer` - Kunden

#### schnelltest.mojo
- `session` - Quiz-Sessions
- `payment` - Zahlungen/Checkouts
- `mautic` - Mautic-Submissionen
- `admin` - Admin-Operationen

### Actions

#### Standard-Aktionen
- `create` - Erstellung einer neuen Entität
- `update` - Aktualisierung einer Entität
- `delete` - Löschung einer Entität
- `status_change` - Status-Änderung
- `amount_change` - Betrags-Änderung
- `metadata_change` - Metadaten-Änderung
- `config_change` - Konfigurations-Änderung

#### Spezielle Aktionen (schnelltest.mojo)
- `complete` - Session abgeschlossen
- `checkout_created` - Checkout erstellt
- `checkout_created_failed` - Checkout-Erstellung fehlgeschlagen
- `submit_success` - Mautic-Submission erfolgreich
- `submit_failed` - Mautic-Submission fehlgeschlagen
- `login_success` - Admin-Login erfolgreich
- `login_failed` - Admin-Login fehlgeschlagen

### Changed By Format

Das `changed_by` Feld sollte folgendes Format verwenden:

- `system` - System-Operationen
- `api` - API-Aufrufe ohne Authentifizierung
- `api_key:<id>` - API-Aufrufe mit API-Key
- `webhook:stripe` - Stripe Webhook
- `webhook:simulator` - Webhook-Simulator (Sandbox)
- `admin:<username>` - Admin-Benutzer
- `user` - Endbenutzer (für schnelltest.mojo)

## Implementierungs-Pattern

### Resilienz-Pattern

Audit-Logging sollte **niemals** die Hauptoperation beeinträchtigen:

```typescript
async criticalOperation() {
  try {
    // Main operation
    const result = await doMainOperation();
    
    // Audit logging (non-blocking)
    try {
      await auditLogService.log({ ... });
    } catch (auditError) {
      logger.error('Audit logging failed', { auditError });
      // Don't fail main operation
    }
    
    return result;
  } catch (error) {
    // Log failure to audit
    try {
      await auditLogService.log({ 
        action: 'operation_failed',
        error: error.message 
      });
    } catch {}
    throw error;
  }
}
```

### Retry-Mechanismus (payments.mojo)

payments.mojo verwendet einen Retry-Mechanismus mit exponentieller Backoff:

- **Max Retries**: 3
- **Initial Delay**: 100ms
- **Backoff**: Exponential (100ms, 200ms, 400ms)

### Request-ID

Request-IDs sollten generiert werden, wenn nicht vorhanden:

```typescript
const requestId = req.headers['x-request-id'] 
  || req.headers['idempotency-key']
  || `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
```

## Projekt-spezifische Details

### kontakte.mojo

- **Logger**: Winston-basierter `auditLogger` (File-basiert)
- **Format**: JSON
- **Datei**: `logs/audit.log`
- **Retention**: 10 Dateien à 5MB

**Verwendung:**
```typescript
import { auditLog } from '../../../infrastructure/logging/audit-logger';

auditLog.paymentCreated(paymentId, orderId, provider, amount, currency, changedBy, requestId);
auditLog.paymentStatusChanged(paymentId, orderId, oldStatus, newStatus, reason, changedBy, requestId);
auditLog.orderCreated(orderId, source, sourceOrderId, status, changedBy, requestId);
auditLog.orderStatusChanged(orderId, oldStatus, newStatus, reason, changedBy, requestId);
```

### payments.mojo

- **Logger**: Datenbank-basiert (`audit_log` Tabelle)
- **Format**: PostgreSQL JSONB
- **Retry**: Ja (3 Versuche mit Backoff)
- **Resilienz**: Try-Catch mit Fehler-Logging

**Verwendung:**
```typescript
import { auditLogService } from '../../../infrastructure/audit';

await auditLogService.log({
  entity_type: 'payment',
  entity_id: paymentId,
  action: 'status_change',
  old_value: oldStatus,
  new_value: newStatus,
  changed_by: changedBy,
  change_reason: reason,
  request_id: requestId,
});
```

### schnelltest.mojo

- **Logger**: SQLite-basiert (`audit_log` Tabelle)
- **Format**: SQLite TEXT (JSON-String)
- **Resilienz**: Try-Catch mit Fehler-Logging

**Verwendung:**
```javascript
import { AuditLogService } from './infrastructure/audit/index.js';

await AuditLogService.log({
  entity_type: 'session',
  entity_id: sessionId,
  action: 'complete',
  changed_by: 'user',
  change_reason: 'Session completed',
  request_id: requestId,
  metadata: { ... },
}, db);
```

## Kritische Operationen

### kontakte.mojo
- ✅ Payment-Erstellung (`PaymentService.createPayment`)
- ✅ Payment-Status-Änderung (`PaymentService.updatePaymentStatus`)
- ✅ Order-Erstellung (`OrderService.createOrder`)
- ✅ Order-Status-Änderung (`OrderService.updateOrderStatus`)

### payments.mojo
- ✅ Payment-Erstellung (`PaymentService.createPayment`)
- ✅ Payment-Status-Änderung (`PaymentService.updatePaymentStatus`)
- ✅ Order-Erstellung (`OrderService.createOrder`)
- ✅ Order-Status-Änderung (`OrderService.updateOrderStatus`)
- ✅ Invoice-Operationen (bereits implementiert)

### schnelltest.mojo
- ✅ Session-Completion (`/api/session/complete`)
- ✅ Payment-Processing (`/api/checkout/create`)
- ✅ Mautic-Submission (`/api/mautic/submit`)
- ✅ Admin-Login (`/api/admin/login` - erfolgreich und fehlgeschlagen)

## Monitoring und Alerting

### Fehler-Monitoring

Alle Projekte sollten fehlgeschlagene Audit-Log-Einträge überwachen:

```typescript
logger.error('Failed to write audit log', {
  error: error.message,
  entry: { entity_type, entity_id, action },
  retries: maxRetries,
});
```

### Metriken

Empfohlene Metriken:
- Anzahl fehlgeschlagener Audit-Log-Einträge
- Durchschnittliche Audit-Log-Latenz
- Anzahl Audit-Log-Einträge pro Tag/Stunde

## Retention und Archivierung

### Retention-Policies

- **kontakte.mojo**: 10 Dateien à 5MB (ca. 50MB)
- **payments.mojo**: Noch zu definieren (empfohlen: 1 Jahr)
- **schnelltest.mojo**: Noch zu definieren (empfohlen: 1 Jahr)

### Archivierung

Empfohlene Strategie:
1. Tägliche Archivierung alter Einträge (> 1 Jahr)
2. Komprimierung archivierter Logs
3. Langzeit-Speicherung (z.B. S3, Glacier)

## Best Practices

1. **Immer Try-Catch**: Audit-Logging sollte niemals die Hauptoperation beeinträchtigen
2. **Request-ID verwenden**: Für bessere Nachverfolgbarkeit
3. **Strukturierte Metadaten**: Verwende JSON für komplexe Daten
4. **Konsistente Entity-Types**: Verwende die definierten Entity-Types
5. **Sinnvolle change_reason**: Erkläre, warum die Änderung vorgenommen wurde
6. **IP-Anonymisierung**: Für Datenschutz (nur bei schnelltest.mojo relevant)

## Migration

Bei der Migration bestehender Systeme:

1. Audit-Logging schrittweise hinzufügen
2. Bestehende Logs nicht ändern (nur neue Einträge)
3. Tests für Audit-Logging-Funktionalität
4. Monitoring für fehlgeschlagene Einträge einrichten

## Referenzen

- kontakte.mojo: `src/infrastructure/logging/audit-logger.ts`
- payments.mojo: `src/infrastructure/audit/audit-log.service.ts`
- schnelltest.mojo: `server/infrastructure/audit/audit-log.service.js`















