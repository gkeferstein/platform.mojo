# MOJO Business Model

> **Flywheel-System für chronische Gesundheit** – Die Architektur eines nachhaltigen B2C/B2B Ökosystems

**Version:** 1.0.0  
**Letzte Aktualisierung:** 03. Januar 2026

---

## Inhaltsverzeichnis

1. [Übersicht: Das Flywheel-System](#1-übersicht-das-flywheel-system)
2. [B2C Segment: Menschen mit chronischen Krankheiten](#2-b2c-segment-menschen-mit-chronischen-krankheiten)
3. [B2B Segment: Gesundheitsprofis](#3-b2b-segment-gesundheitsprofis)
4. [Die zentrale User Journey: campus.mojo](#4-die-zentrale-user-journey-campusmojo)
5. [Flywheel-Mechanik: B2B → B2C Verbindung](#5-flywheel-mechanik-b2b--b2c-verbindung)
6. [Apps & Architektur](#6-apps--architektur)
7. [Revenue-Modell](#7-revenue-modell)

---

## 1. Übersicht: Das Flywheel-System

### Das Konzept

MOJO ist ein **Flywheel-System** mit zwei sich gegenseitig stärkenden Segmenten:

```
┌─────────────────────────────────────────────────────────────┐
│                      B2C Segment                            │
│  Menschen mit chronischen Krankheiten                       │
│  → Digitale Kurse, Workshops, Events, Mentoring             │
│  → Stufe 1: LEBENSENERGIE                                   │
│  → Stufe 2: RESILIENZ                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Buchen Events/Mentoring von B2B
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      B2B Segment                            │
│  Gesundheitsprofis (Heilpraktiker, Ärzte, Physios)         │
│  → Ausbildung zum selbstständigen Gesundheitsprofi          │
│  → Stufe 3: BUSINESS BOOTCAMP                               │
│  → Stufe 4: RegenerationsmedizinOS                          │
│  → Werden zu Mentoren für B2C                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Werden zu Service-Providern
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   campus.mojo                               │
│          Zentrale Begegnungsstätte                          │
│  Kurse | Foren | Community | Live Calls | Events            │
└─────────────────────────────────────────────────────────────┘
```

### Zentrale Frage B2C

**"Was kann ich selbst NOCH tun?"**

- Nicht zu medizinisch
- Empowerment-fokussiert
- Praktische Tools für mehr Gesundheit und Lebensenergie

### Zentrale Frage B2B

**"Wie werde ich selbstständiger Gesundheitsprofi im Selbstzahlerbereich?"**

- Aus dem Kassensystem raus
- Eigenständig im Selbstzahlerbereich arbeiten
- Teil des "Systems für chronische Gesundheit" werden

---

## 2. B2C Segment: Menschen mit chronischen Krankheiten

### Zielgruppe

Menschen mit chronischen Krankheiten, die nach zusätzlichen, selbstbestimmten Lösungen suchen.

### Zentrales Angebot

| Angebot | Format | Ziel |
|---------|--------|------|
| **Digitale Kurse** | Online | Mehr Gesundheit und Lebensenergie |
| **Live Workshops** | Online/Live | Gesundheitskompetenz aufbauen |
| **Events** | Live | Gemeinschaft und Lernen |
| **Gruppenformate** | Online/Live | Unterstützung in der Gruppe |
| **1-zu-1 Mentoring** | Online/Live | Individuelle Begleitung |

### User Journey: B2C Stufen

```
Stufe 1: LEBENSENERGIE
└─ Erste AHA-Momente
└─ Digitale Kurse für Grundlagen
└─ Community-Zugang
└─ Basis-Workshops

Stufe 2: RESILIENZ  
└─ Vertiefte Gesundheitskompetenz
└─ Erweiterte Workshops
└─ Gruppenformate
└─ Option: 1-zu-1 Mentoring (von B2B Profis)
```

**Ziel:** Mehr Selbstbestimmung und Handlungsfähigkeit im Umgang mit chronischen Krankheiten.

---

## 3. B2B Segment: Gesundheitsprofis

### Zielgruppe

- Heilpraktiker
- Ärzte (die aus dem Kassensystem raus wollen)
- Physiotherapeuten
- Andere Gesundheitsprofis

### Zentrales Angebot

**Ausbildung zum selbstständigen Gesundheitsprofi im Selbstzahlerbereich**

### User Journey: B2B Stufen

```
Stufe 3: BUSINESS BOOTCAMP
└─ Grundlagen Selbstständigkeit
└─ Selbstzahlerbereich verstehen
└─ Business-Modell entwickeln
└─ Erste Tools freigeschaltet (payments.mojo)

Stufe 4: RegenerationsmedizinOS
└─ Fachliche Vertiefung
└─ Voller Zugang zu allen Tools
└─ Werde Mentor für B2C Kunden
└─ Kann Events/Mentoring anbieten
```

**Ziel:** Eigenständig im Selbstzahlerbereich arbeiten und Teil des MOJO-Ökosystems werden.

### Tools für B2B

- `payments.mojo` – Multitenancy für einfache Zahlungsabwicklung
- `kontakte.mojo` – CRM für Kunden/Patienten
- `pos.mojo` – Point of Sale (optional)
- Event-Management – Events für B2C Kunden anbieten

---

## 4. Die zentrale User Journey: campus.mojo

### Konzept

**`campus.mojo` ist der zentrale Begegnungsort** – EINE zentrale User Journey durch die MOJO Welt.

### Struktur

```
campus.mojo-institut.de
├── Alle Kurse (B2C + B2B)
├── Foren (getrennt nach Stufen/Mitgliedschaften)
├── Community
├── Live Calls
└── Events (B2C können Events von B2B buchen)
```

### Multitenancy & Mitgliedschaften

| Mitgliedschaft | Zugang | Inhalt |
|----------------|--------|--------|
| **B2C: LEBENSENERGIE** | Stufe 1 | Basis-Kurse, Forum, Community |
| **B2C: RESILIENZ** | Stufe 2 | Erweiterte Kurse, Workshops, Gruppen |
| **B2B: BUSINESS BOOTCAMP** | Stufe 3 | Business-Kurse, Tools, Community |
| **B2B: RegenerationsmedizinOS** | Stufe 4 | Alle Kurse, Tools, Mentor-Status |

### Prinzipien

- **Eine zentrale Plattform** – alle Kurse, Foren, Community an einem Ort
- **Zugang basierend auf Mitgliedschaft** – jeder sieht nur, was zu seiner Stufe gehört
- **Nahtlose Progression** – User können durch die Stufen aufsteigen
- **Getrennte Bereiche** – B2C und B2B haben eigene Foren/Communities, aber können sich begegnen

---

## 5. Flywheel-Mechanik: B2B → B2C Verbindung

### Der Flywheel

```
1. B2B Kunden durchlaufen Stufe 3 & 4
   ↓
2. Werden ausgebildet und zertifiziert
   ↓
3. Werden zu Mentoren/Service-Providern
   ↓
4. Bieten Events/Workshops/1-zu-1 Mentoring für B2C an
   ↓
5. B2C Kunden buchen diese Services
   ↓
6. B2B Kunden generieren Revenue → mehr Engagement
   ↓
7. Mehr B2B Kunden → mehr Angebot → mehr B2C Kunden
   ↓
8. ZURÜCK ZU SCHRITT 1 (Flywheel beschleunigt sich)
```

### Konkrete Verbindungen

| B2B Angebot | B2C Nachfrage | Plattform |
|-------------|---------------|-----------|
| Live Workshops | B2C bucht Workshop | `campus.mojo` |
| Events | B2C bucht Event | `campus.mojo` |
| 1-zu-1 Mentoring | B2C bucht Mentoring | `campus.mojo` |
| Gruppensessions | B2C tritt Gruppe bei | `campus.mojo` |

### Value Proposition

**Für B2B:**
- ✅ Zusätzliche Revenue-Quelle
- ✅ Praktische Erfahrung mit Kunden
- ✅ Netzwerk-Aufbau
- ✅ Teil des Ökosystems

**Für B2C:**
- ✅ Persönliche Begleitung durch Profis
- ✅ Events und Workshops von Experten
- ✅ Direkter Kontakt zu Gesundheitsprofis
- ✅ Praktische Umsetzung des Gelernten

---

## 6. Apps & Architektur

### Zentrale Apps

#### `campus.mojo` – Die zentrale Plattform

**Rolle:** Zentrale Begegnungsstätte für alle User

**Features:**
- Multitenancy für verschiedene Mitgliedschaften
- Kurs-Management (B2C + B2B)
- Forum-System (getrennt nach Stufen)
- Community-Features
- Live Calls / Webinar-Funktionalität
- Event-Management & Buchungssystem
- Mentoring-Buchungssystem

**Technisch:**
- B2C und B2B Nutzer in einem System
- Zugriffskontrolle über Mitgliedschafts-Level
- Events können von B2B erstellt und von B2C gebucht werden

#### `account.mojo` – Account-Verwaltung

**Rolle:** Zentrale Account-Verwaltung für alle User (B2C + B2B)

**Features:**
- Persönliche Daten verwalten
- Mitgliedschaften verwalten
- Organizations (für B2B)
- Subscriptions verwalten
- Verknüpfte Accounts

**Wichtig:** 
- B2C: Persönliches Konto
- B2B: Kann Organisation erstellen (für Business-Context)

#### `payments.mojo` – Zahlungsabwicklung (Multitenancy)

**Rolle:** Zahlungsabwicklung für B2B Kunden (Multitenancy)

**Zugang:** Nur für B2B (ab Stufe 3: BUSINESS BOOTCAMP)

**Features:**
- Zahlungen entgegennehmen
- Rechnungen erstellen
- Subscriptions verwalten
- Auszahlungen (für B2B → B2C Services)

**Multitenancy:** Jeder B2B Kunde hat seinen eigenen Tenant für Zahlungsabwicklung

---

### Support Apps

#### `kontakte.mojo` – CRM (B2B)

**Rolle:** Single Source of Truth für Kontakte

**Zugang:** B2B (ab bestimmter Stufe)

**Features:**
- Kunden/Patienten verwalten
- Leads verwalten
- Partner/Affiliates verwalten

**Integration:** Wird von `payments.mojo` referenziert

#### `pos.mojo` – Point of Sale (optional für B2B)

**Rolle:** Kartenzahlungen an der Theke

**Zugang:** B2B (optional)

#### `checkin.mojo` – 10er-Karten (optional für B2B)

**Rolle:** Verwaltung von 10er-Karten

**Zugang:** B2B (optional)

---

### Platform Apps

#### `frontend.mojo` – Marketing Frontend

**Rolle:** Öffentliche Visitenkarte

**Content:**
- B2C Landing Pages (LEBENSENERGIE, RESILIENZ)
- B2B Landing Pages (BUSINESS BOOTCAMP, RegenerationsmedizinOS)
- Informationen zum Ökosystem

#### `messaging.mojo` – Echtzeit-Kommunikation

**Rolle:** Kommunikation zwischen allen Usern

**Features:**
- B2C ↔ B2C Kommunikation
- B2B ↔ B2B Kommunikation
- B2C ↔ B2B Kommunikation (für Mentoring/Events)

---

## 7. Revenue-Modell & Platform-Hierarchie

### Revenue-Modell (siehe unten)

### Platform-Hierarchie: Regionale Distributoren

Siehe [Abschnitt 7.5. Platform-Hierarchie: Regionale Distributoren](#75-platform-hierarchie-regionale-distributoren)

---

## 7.1. Revenue-Modell

### Revenue-Streams

#### 1. B2C Mitgliedschaften

| Stufe | Name | Revenue |
|-------|------|---------|
| Stufe 1 | LEBENSENERGIE | €X/Monat |
| Stufe 2 | RESILIENZ | €Y/Monat (> X) |

#### 2. B2B Mitgliedschaften

| Stufe | Name | Revenue |
|-------|------|---------|
| Stufe 3 | BUSINESS BOOTCAMP | €Z/Monat |
| Stufe 4 | RegenerationsmedizinOS | €W/Monat (> Z) |

#### 3. Transaction Fees (möglich)

- Bei Buchungen B2C → B2B Services über `campus.mojo`
- Platform-Fee pro Event/Mentoring-Buchung

#### 4. Tools (B2B)

- `payments.mojo` – mögliche Transaction Fees
- `pos.mojo` / `checkin.mojo` – mögliche Gebühren

---

## 8. Architektur-Prinzipien

### Klare Trennung, aber nahtlose Integration

```
┌─────────────────────────────────────────────────────────┐
│              campus.mojo (zentral)                      │
│  ┌──────────────┐           ┌──────────────┐          │
│  │   B2C Area   │           │   B2B Area   │          │
│  │ LEBENSENERGIE│           │BUSINESS      │          │
│  │ RESILIENZ    │           │BOOTCAMP      │          │
│  │              │◄──Events──►│Regenerations│          │
│  │              │   Mentoring│medizinOS    │          │
│  └──────────────┘           └──────────────┘          │
│         │                            │                 │
│         │                            │                 │
└─────────┼────────────────────────────┼─────────────────┘
          │                            │
          ▼                            ▼
┌─────────────────┐        ┌──────────────────────┐
│ account.mojo    │        │ payments.mojo        │
│ (alle User)     │        │ (nur B2B)            │
└─────────────────┘        └──────────────────────┘
```

### Datenmodell

**User Types:**
- `B2C_USER` – Menschen mit chronischen Krankheiten
- `B2B_USER` – Gesundheitsprofis

**Mitgliedschaften:**
- `LEBENSENERGIE` (B2C Stufe 1)
- `RESILIENZ` (B2C Stufe 2)
- `BUSINESS_BOOTCAMP` (B2B Stufe 3)
- `REGENERATIONSMEDIZIN_OS` (B2B Stufe 4)

**Organizations:**
- B2B User können Organizations erstellen
- Organizations sind Tenants für `payments.mojo`

**Events/Mentoring:**
- B2B User können Events/Mentoring anbieten
- B2C User können diese buchen
- Transaktionen über `payments.mojo` (B2B Tenant)

---

## 7.5. Platform-Hierarchie: Regionale Distributoren

### Die 3-Ebenen-Architektur

MOJO LLC ist der **Platform Owner** weltweit. Für jede Weltregion gibt es **Regionale Distributoren**, die regionalen Vertrieb und Anpassungen machen.

```
┌─────────────────────────────────────────────────────────────┐
│  EBENE 1: MOJO LLC (Platform Owner)                        │
│  → Sieht ALLES weltweit                                     │
│  → Alle Regionalen Partner                                  │
│  → Alle Tenants                                             │
│  → Alle Kunden                                              │
│  → Platform Administration (admin.mojo)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ EBENE 2:     │ │ EBENE 2:     │ │ EBENE 2:     │ │ EBENE 2:     │
│ DACH Region  │ │ US Region    │ │ INDIEN Region│ │ ... Region   │
│              │ │              │ │              │ │              │
│ Sieht nur:   │ │ Sieht nur:   │ │ Sieht nur:   │ │ Sieht nur:   │
│ • DACH Tenant│ │ • US Tenants │ │ • INDIEN     │ │ • ... Tenants│
│ • DACH Kunden│ │ • US Kunden  │ │   Tenants    │ │ • ... Kunden │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       └────────────────┼────────────────┼────────────────┘
                        │                │
        ┌───────────────┼────────────────┼───────────────┐
        │               │                │               │
        ▼               ▼                ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ EBENE 3:     │ │ EBENE 3:     │ │ EBENE 3:     │ │ EBENE 3:     │
│ Tenant Anna  │ │ Tenant Tom   │ │ Tenant ...   │ │ Tenant ...   │
│ (B2B Profi)  │ │ (B2B Profi)  │ │              │ │              │
│              │ │              │ │              │ │              │
│ Sieht nur:   │ │ Sieht nur:   │ │ Sieht nur:   │ │ Sieht nur:   │
│ • Eigene     │ │ • Eigene     │ │ • Eigene     │ │ • Eigene     │
│   Kunden     │ │   Kunden     │ │   Kunden     │ │   Kunden     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### admin.mojo – Platform Administration

**Rolle:** Zentrale Platform Administration für MOJO LLC

**Zugang:** Nur für MOJO LLC Team (Platform Owner)

**Features:**
- **Regionale Distributoren verwalten**
  - Neue Regionen anlegen (DACH, US, INDIEN, etc.)
  - Regionale Verträge verwalten
  - Provisionen und Auszahlungen für Regionen

- **Globale Übersicht**
  - Alle Regionen weltweit
  - Alle Tenants in allen Regionen
  - Alle Kunden (aggregiert)
  - Platform-Health & Analytics

- **Revenue & Provisionen**
  - Regionale Revenue-Tracking
  - Provision-Berechnung für Regionale Partner
  - Auszahlungs-Management
  - Platform-Fees

### Regionale Versionen

**Jede Region hat eigene Campus-Versionen:**

| Region | Campus Version | Domain (Beispiel) | Anpassungen |
|--------|----------------|-------------------|-------------|
| **DACH** | campus.mojo-dach | campus.dach.mojo-institut.de | Deutsche Sprache, DACH-spezifische Inhalte |
| **US** | campus.mojo-us | campus.us.mojo-institut.de | Englisch, US-spezifische Inhalte |
| **INDIEN** | campus.mojo-indien | campus.indien.mojo-institut.de | Hindi/Englisch, INDIEN-spezifische Inhalte |
| **...** | campus.mojo-{region} | campus.{region}.mojo-institut.de | Region-spezifisch |

**Gleiches gilt für andere Apps:**
- `payments.mojo-dach`, `payments.mojo-us`, etc.
- `kontakte.mojo-dach`, `kontakte.mojo-us`, etc.
- Alle Apps können regionalisiert werden

### Zugriffsrechte: Wer sieht was?

#### MOJO LLC (Platform Owner)

**Sieht ALLES:**
- ✅ Alle Regionen (DACH, US, INDIEN, ...)
- ✅ Alle Regionalen Partner
- ✅ Alle Tenants in allen Regionen
- ✅ Alle Kunden (aggregiert)
- ✅ Globale Platform-Metriken
- ✅ Regionale Revenue & Provisionen

**Zugang:** `admin.mojo` (Platform Administration)

#### Regionale Distributoren

**Sieht nur ihre Region:**
- ✅ Alle Tenants in ihrer Region
- ✅ Alle Kunden in ihrer Region
- ✅ Regionale Metriken
- ✅ Regionale Revenue
- ❌ Keine Zugriff auf andere Regionen
- ❌ Keine Zugriff auf globale Platform-Daten

**Zugang:** Regionale Admin-View in `admin.mojo` (gefiltert nach Region)

**Beispiel:**
- DACH Distributor sieht nur DACH Tenants und DACH Kunden
- US Distributor sieht nur US Tenants und US Kunden

#### Tenants (B2B Kunden)

**Sieht nur eigene Daten:**
- ✅ Eigene Kunden
- ✅ Eigene Zahlungen
- ✅ Eigene Events/Mentoring
- ❌ Keine Zugriff auf andere Tenants
- ❌ Keine Zugriff auf regionale Daten
- ❌ Keine Zugriff auf Platform-Daten

**Zugang:** Ihre eigenen Apps (`payments.mojo`, `kontakte.mojo`, etc.)

### Datenmodell: Regionale Hierarchie

```typescript
// Platform-Ebene
interface Region {
  id: string;
  code: 'DACH' | 'US' | 'INDIEN' | string;
  name: string;
  distributorId: string; // Regionale Distributor ID
  currency: string;
  locale: string;
}

// Tenant mit Region-Referenz
interface Tenant {
  id: string;
  slug: string;
  name: string;
  regionId: string; // VERBINDUNG ZUR REGION
  clerkOrgId?: string;
  // ...
}

// User mit Region (optional)
interface CampusUser {
  clerkUserId: string;
  membership: Membership;
  regionId?: string; // Region, in der User registriert ist
  // ...
}
```

### Technische Umsetzung

#### admin.mojo – Regionale Filterung

```typescript
// admin.mojo - Platform Owner sieht ALLES
async function getAllRegions() {
  // MOJO LLC sieht alle Regionen
  return await prisma.region.findMany();
}

// admin.mojo - Regionale Distributor sieht nur seine Region
async function getRegionalData(distributorId: string) {
  const region = await prisma.region.findUnique({
    where: { distributorId },
    include: {
      tenants: true, // Alle Tenants in dieser Region
      users: true,   // Alle User in dieser Region
    },
  });
  return region;
}
```

#### Tenant-Isolation pro Region

```typescript
// payments.mojo - Tenant sieht nur eigene Daten
async function getTenantCustomers(tenantId: string, regionId: string) {
  // Sicherstellung: Tenant gehört zur Region
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });
  
  if (tenant.regionId !== regionId) {
    throw new Error('Unauthorized: Tenant does not belong to region');
  }
  
  // Return nur Kunden dieses Tenants
  return await prisma.customer.findMany({
    where: { tenantId },
  });
}
```

#### Regionale Campus-Versionen

**Jede Region hat eigene Deployment:**
- `campus.mojo-dach` → Separate DB, eigene Instanz
- `campus.mojo-us` → Separate DB, eigene Instanz
- `campus.mojo-indien` → Separate DB, eigene Instanz

**Gemeinsam:**
- Gleiche Codebase
- Gleiche Architektur
- Regionale Konfiguration via Environment Variables
- Regionale Inhalte via CMS

---

## 8. Datenmodell: B2C ↔ B2B Verbindung

### Die Verbindung zwischen campus.mojo und payments.mojo

**Kernfrage:** Wie sind B2C Kunden in `campus.mojo` mit B2B Tenants in `payments.mojo` verbunden, wenn die gleiche Person beide Rollen hat?

### Lösung: Clerk User ID als zentrale Verbindung

**Prinzip:** Gleiche Person = Gleiche `clerkUserId` überall, aber verschiedene Kontexte durch Tenant-Separation.

```
┌─────────────────────────────────────────────────┐
│  account.mojo (Single Source of Truth)          │
│                                                  │
│  User: Max (Clerk User ID: user_abc123)         │
│  ├── B2C Mitgliedschaft: LEBENSENERGIE         │
│  │   → campus.mojo Zugriff                     │
│  │                                              │
│  └── B2B Tenant Kunde (in verschiedenen Tenants)│
│      → kontakte.mojo (Anna's Tenant)           │
│      → payments.mojo (Anna's Tenant)            │
└─────────────────────────────────────────────────┘
```

### Datenmodell-Struktur

#### campus.mojo

```typescript
interface CampusUser {
  clerkUserId: string; // "user_abc123" - ZENTRALE VERBINDUNG
  membership: 'LEBENSENERGIE' | 'RESILIENZ' | 'BUSINESS_BOOTCAMP' | 'REGENERATIONSMEDIZIN_OS';
  type: 'B2C' | 'B2B';
  email: string;
  name: string;
}
```

#### kontakte.mojo (B2B Tenant)

```typescript
interface Contact {
  id: string;
  clerkUserId: string; // "user_abc123" - VERBINDUNG ZU CAMPUS USER
  tenantId: string; // B2B Tenant ID (z.B. Anna's Tenant)
  name: string;
  email: string;
  // ... weitere Felder
}
```

**Wichtig:** Ein User kann in mehreren B2B Tenants als Kontakt existieren, immer mit derselben `clerkUserId`.

#### payments.mojo (B2B Tenant)

```typescript
interface Customer {
  id: string;
  clerkUserId: string; // "user_abc123" - VERBINDUNG ZU CAMPUS USER
  tenantId: string; // B2B Tenant ID
  contactId: string; // Referenz zu kontakte.mojo
  // ... weitere Felder
}
```

### Event-Buchung Flow

**Beispiel:** Max (B2C) bucht Event bei Anna (B2B)

```
1. Max (B2C, clerkUserId: "user_abc123") bucht Event bei Anna (B2B, tenantId: "tenant_anna")
   in campus.mojo
   ↓
2. campus.mojo erstellt Buchung:
   {
     buyerClerkUserId: "user_abc123",
     sellerTenantId: "tenant_anna",
     eventId: "event_xyz"
   }
   ↓
3. campus.mojo ruft kontakte.mojo auf (mit sellerTenantId als x-tenant-id Header):
   POST /api/contacts
   {
     clerkUserId: "user_abc123",  // Max's ID - VERBINDUNG!
     tenantId: "tenant_anna",
     name: "Max Mustermann",
     email: "max@example.com",
     source: "campus_event_booking"
   }
   ↓
4. kontakte.mojo erstellt/aktualisiert Kontakt:
   - Wenn Kontakt existiert (gleiche clerkUserId + tenantId) → Update
   - Wenn nicht → Neuer Kontakt
   ↓
5. campus.mojo leitet Zahlung an payments.mojo weiter (mit sellerTenantId als x-tenant-id Header):
   POST /api/payments
   {
     clerkUserId: "user_abc123",  // Max's ID - VERBINDUNG!
     tenantId: "tenant_anna",
     contactId: "contact_xyz",
     amount: 100,
     bookingId: "booking_123"
   }
   ↓
6. payments.mojo erstellt Zahlung:
   - Verknüpft mit Max's clerkUserId
   - In Anna's Tenant
   - Referenziert Kontakt aus kontakte.mojo
```

### Daten-Synchronisation: Real-time Sync (Option A)

**Entscheidung:** Real-time Synchronisation zwischen Systemen.

**Implementierung:**

1. **Bei Änderung in `account.mojo`:**
   - Webhook an alle betroffenen Services
   - Update in `campus.mojo` User-Profil
   - Update in allen B2B Tenants, wo User als Kontakt existiert

2. **Bei Event-Buchung in `campus.mojo`:**
   - Sofortige Synchronisation zu `kontakte.mojo`
   - Sofortige Synchronisation zu `payments.mojo`

3. **Cache-Strategie:**
   - User-Daten werden gecached (TTL: 5 Minuten)
   - Bei Updates: Cache-Invalidierung

**Vorteile:**
- ✅ Immer aktuelle Daten
- ✅ Konsistenz zwischen Systemen
- ✅ Bessere User Experience

**Implementierung:**
```typescript
// account.mojo - Webhook bei User-Update
async function onUserUpdate(userId: string, changes: UserChanges) {
  // 1. Update campus.mojo
  await updateCampusUser(userId, changes);
  
  // 2. Update in allen B2B Tenants, wo User Kontakt ist
  const contacts = await getContactsByClerkUserId(userId);
  for (const contact of contacts) {
    await updateContactInTenant(contact.tenantId, userId, changes);
  }
}
```

### User sieht B2B Tenant-Beziehungen: Mit Consent (Option 2)

**Entscheidung:** User kann seine B2B Tenant-Beziehungen sehen, aber nur mit explizitem Consent.

**Implementierung in `account.mojo`:**

```typescript
interface UserProfile {
  clerkUserId: string;
  b2cMembership: Membership;
  
  // B2B Tenant Beziehungen (nur wenn Consent gegeben)
  b2bRelationships?: Array<{
    tenantId: string;
    tenantName: string;
    role: 'customer' | 'contact';
    since: Date;
    lastInteraction: Date;
  }>;
  
  // Consent-Settings
  consentSettings: {
    showB2bRelationships: boolean; // User muss aktiv zustimmen
    shareB2cMembershipWithB2b: boolean; // Wird nicht verwendet (siehe unten)
  };
}
```

**UI in `account.mojo`:**
```
┌─────────────────────────────────────────────┐
│  Deine B2B Beziehungen                     │
│                                             │
│  ℹ️  Diese Informationen sind privat.      │
│      Aktiviere sie, um zu sehen, bei       │
│      welchen Gesundheitsprofis du Kunde    │
│      bist.                                  │
│                                             │
│  ☐ B2B Beziehungen anzeigen                │
│                                             │
│  [Speichern]                                │
└─────────────────────────────────────────────┘

Nach Aktivierung:
┌─────────────────────────────────────────────┐
│  Deine B2B Beziehungen                     │
│                                             │
│  Du bist Kunde bei:                        │
│  • Anna Schmidt (seit 15.12.2024)          │
│    → 3 Events gebucht                      │
│  • Tom Müller (seit 20.12.2024)            │
│    → 1 Mentoring gebucht                   │
└─────────────────────────────────────────────┘
```

**Privacy-First:**
- ✅ Standard: Aus (Opt-in)
- ✅ User muss explizit zustimmen
- ✅ Klare Information, was angezeigt wird

### B2B Profi sieht B2C Mitgliedschaft: Nein (Option 3)

**Entscheidung:** B2B Profis sehen NICHT die B2C Mitgliedschaft ihrer Kunden.

**Begründung:**
- Privacy-First Ansatz
- B2C Mitgliedschaft ist private Information
- Keine Notwendigkeit für B2B Geschäftsbeziehung

**Implementierung:**
- In `kontakte.mojo` wird `clerkUserId` gespeichert
- Aber: Kein Zugriff auf `campus.mojo` Mitgliedschafts-Daten
- B2B Profi sieht nur:
  - Kontakt-Informationen (Name, Email, etc.)
  - Buchungs-Historie
  - Zahlungs-Historie
  - **NICHT:** B2C Mitgliedschaft, LEBENSENERGIE-Level, etc.

**Ausnahme (nur wenn User explizit teilt):**
- User kann optional in `account.mojo` einstellen: "Teile meine B2C Mitgliedschaft mit B2B Profis"
- Aber: Standard ist "NEIN"

### Technische Integration

#### Service-to-Service Kommunikation

**Tenant-Header bei API-Calls:**
```typescript
// campus.mojo → kontakte.mojo
await fetch('https://kontakte.mojo-institut.de/api/contacts', {
  method: 'POST',
  headers: {
    'x-tenant-id': sellerTenantId, // Anna's Tenant
    'Authorization': `Bearer ${serviceToken}`,
  },
  body: JSON.stringify({
    clerkUserId: userId, // Max's ID
    // ...
  }),
});
```

**Kontakt-Lookup mit clerkUserId:**
```typescript
// kontakte.mojo - Finde Kontakt in Tenant
async function findContactByClerkUserId(
  tenantId: string,
  clerkUserId: string
): Promise<Contact | null> {
  return await prisma.contact.findUnique({
    where: {
      clerkUserId_tenantId: {
        clerkUserId,
        tenantId,
      },
    },
  });
}
```

---

## 9. Implementierungs-Überlegungen

### campus.mojo Multitenancy

**Option 1: Mitgliedschafts-basierte Zugriffskontrolle**
- Alle User in einer DB
- Zugriff über Mitgliedschafts-Level
- Separate Foren/Bereiche per Filter

**Option 2: Tenant-basiert**
- B2C und B2B als separate Tenants
- Events/Mentoring verbindet beide

**Empfehlung:** Option 1 (Mitgliedschafts-basiert), da es eine zentrale Journey ist.

### payments.mojo Multitenancy

- Jede B2B Organization = ein Tenant
- B2C hat keinen Zugang (nur B2B)

### Event/Mentoring-Buchung

**Flow:**
1. B2B User erstellt Event/Mentoring in `campus.mojo`
2. B2C User sieht verfügbare Events
3. B2C User bucht Event
4. **Daten-Synchronisation:**
   - B2C User wird als Kontakt in B2B Tenant angelegt/aktualisiert (`kontakte.mojo`)
   - Real-time Sync mit `clerkUserId` als Verbindung
5. Zahlung geht an B2B Tenant in `payments.mojo`
   - Verknüpft mit `clerkUserId` des B2C Users
6. Platform-Fee (optional) an MOJO

**Details:** Siehe [Event-Buchung Flow](#event-buchung-flow) in Abschnitt 8.

---

## 10. Nächste Schritte

### Dokumentation aktualisieren

- [x] `MOJO_ECOSYSTEM.md` aktualisieren mit B2C/B2B Trennung
- [x] B2C Angebotsmodell detailliert ausgearbeitet → [B2C_OFFER_MODEL.md](./B2C_OFFER_MODEL.md)
- [x] Datenmodell B2C ↔ B2B Verbindung dokumentiert
- [ ] Architektur-Dokumentation für Multitenancy-Ansatz

### Technische Umsetzung

- [ ] `campus.mojo` Multitenancy-Design finalisieren
- [ ] Mitgliedschafts-System designen
- [ ] Event/Mentoring-Buchungssystem planen
- [ ] Integration `campus.mojo` ↔ `payments.mojo` implementieren
- [x] Real-time Sync zwischen `account.mojo` ↔ `campus.mojo` ↔ `kontakte.mojo`
- [ ] Consent-System für B2B Beziehungen in `account.mojo`

### B2C Rollout

- [ ] Onboarding-Wizard implementieren
- [ ] Progressive Feature Freischaltung bauen
- [ ] LEBENSENERGIE Dashboard entwickeln

---

## Referenzen

- **B2C Angebotsmodell:** [B2C_OFFER_MODEL.md](./B2C_OFFER_MODEL.md) – Detailliertes Angebotsmodell für B2C Segment
- **Coding Standards:** [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- **MOJO Ökosystem:** [MOJO_ECOSYSTEM.md](./MOJO_ECOSYSTEM.md)

---

## Changelog

| Version | Datum | Änderungen |
|---------|-------|------------|
| 1.3.0 | 03.01.2026 | Platform-Hierarchie dokumentiert: 3-Ebenen-System (MOJO LLC → Regionale Distributoren → Tenants), regionale Campus-Versionen, Zugriffsrechte klar definiert |
| 1.2.0 | 03.01.2026 | Datenmodell B2C ↔ B2B Verbindung dokumentiert: Real-time Sync, Consent für B2B Beziehungen, Privacy-First Ansatz |
| 1.1.0 | 03.01.2026 | B2C Angebotsmodell Referenz hinzugefügt |
| 1.0.0 | 03.01.2026 | Initial Release – Business Model Dokumentation mit Flywheel-System |

---

*MOJO Institut – System für chronische Gesundheit*

