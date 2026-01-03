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

## 7. Revenue-Modell

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
4. Zahlung geht an B2B Tenant in `payments.mojo`
5. Platform-Fee (optional) an MOJO

---

## 10. Nächste Schritte

### Dokumentation aktualisieren

- [x] `MOJO_ECOSYSTEM.md` aktualisieren mit B2C/B2B Trennung
- [x] B2C Angebotsmodell detailliert ausgearbeitet → [B2C_OFFER_MODEL.md](./B2C_OFFER_MODEL.md)
- [ ] Architektur-Dokumentation für Multitenancy-Ansatz

### Technische Umsetzung

- [ ] `campus.mojo` Multitenancy-Design finalisieren
- [ ] Mitgliedschafts-System designen
- [ ] Event/Mentoring-Buchungssystem planen
- [ ] Integration `campus.mojo` ↔ `payments.mojo` planen

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
| 1.1.0 | 03.01.2026 | B2C Angebotsmodell Referenz hinzugefügt |
| 1.0.0 | 03.01.2026 | Initial Release – Business Model Dokumentation mit Flywheel-System |

---

*MOJO Institut – System für chronische Gesundheit*

