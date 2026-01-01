# MOJO Coding Standards

> Verbindliche Standards für alle MOJO-Anwendungen (kontakte.mojo, accounts.mojo, payments.mojo, campus.mojo)

**Version:** 1.6.0  
**Letzte Aktualisierung:** 01. Januar 2026

---

## Service URLs

Alle Services werden über **Traefik** geroutet. Keine Port-Dokumentation nötig.

### Core Apps

| Service | Production | Staging |
|---------|------------|---------|
| accounts.mojo | account.mojo-institut.de | accounts.staging.mojo-institut.de |
| kontakte.mojo | kontakte.mojo-institut.de | kontakte.staging.mojo-institut.de |
| payments.mojo | payments.mojo-institut.de | payments.staging.mojo-institut.de |
| campus.mojo | campus.mojo-institut.de | campus.staging.mojo-institut.de |
| messaging.mojo | messaging.mojo-institut.de | messaging.staging.mojo-institut.de |
| frontend.mojo | mojo-institut.de | staging.mojo-institut.de |

### Team Apps

| Service | Production | Staging |
|---------|------------|---------|
| pos.mojo | pos.mojo-institut.de | pos.staging.mojo-institut.de |
| checkin.mojo | checkin.mojo-institut.de | checkin.staging.mojo-institut.de |

### Admin/Tool Apps

| Service | Production | Staging |
|---------|------------|---------|
| connect.mojo (n8n) | connect.mojo-institut.de | connect.staging.mojo-institut.de |
| mailer.mojo (Mautic) | mailer.mojo-institut.de | mailer.staging.mojo-institut.de |
| design.mojo | design.mojo-institut.de | design.staging.mojo-institut.de |

### URL-Konvention

```
Production:  {service}.mojo-institut.de
Staging:     {service}.staging.mojo-institut.de
```

> **VERALTET:** `dev.{service}.mojo-institut.de` wird zu `{service}.staging.mojo-institut.de` migriert.

> **Staging Auth:** Alle Staging-URLs sind mit Basic Auth geschützt (Traefik Middleware).

Alle API-Endpoints sind unter `/api` erreichbar (NICHT `/api/v1`).

---

## Inhaltsverzeichnis

1. [Design System & UX](#1-design-system--ux)
2. [Navigation Standards](#2-navigation-standards)
3. [Clerk Authentication](#3-clerk-authentication)
   - [3.1 Clerk Setup](#31-clerk-setup)
   - [3.2 Protected API Routes (Next.js)](#32-protected-api-routes-nextjs)
   - [3.3 Protected API Routes (Fastify/Express)](#33-protected-api-routes-fastifyexpress)
   - [3.4 Clerk Webhooks](#34-clerk-webhooks)
   - [3.5 Session Token für Service-to-Service](#35-session-token-für-service-to-service)
   - [3.6 Sign-In/Sign-Up Seiten](#36-sign-insign-up-seiten-nextjs)
   - [3.7 Redirect-Logik nach Sign-In/Sign-Up](#37-redirect-logik-nach-sign-insign-up)
   - [3.8 Sign-Out Implementation](#38-sign-out-implementation)
   - [3.9 Neue User & Organizations (Onboarding Flow)](#39-neue-user--organizations-onboarding-flow)
   - [3.10 Debugging Checklist für Auth-Probleme](#310-debugging-checklist-für-auth-probleme)
4. [Multitenancy](#4-multitenancy)
5. [API Standards](#5-api-standards)
6. [Error Handling](#6-error-handling)
7. [Logging & Monitoring](#7-logging--monitoring)
8. [Code Style](#8-code-style)
9. [Datenbankstandards](#9-datenbankstandards)
10. [Testing](#10-testing)
11. [Deployment & CI/CD](#11-deployment--cicd)
12. [Messaging Integration](#12-messaging-integration)
13. [Einheitliche CI/CD Pipeline](#13-einheitliche-cicd-pipeline)

---

## 1. Design System & UX

### 1.1 Verbindliches Design System

Alle Apps MÜSSEN `@gkeferstein/design` verwenden. Das Design System ist in `design.mojo` definiert und enthält:

- **Komponenten:** UI-Komponenten (Button, Card, Dialog, etc.)
- **Navigation:** App Switcher, Tenant Switcher, User Menu
- **Layouts:** MojoShell, MojoSidebar, SettingsLayout
- **UX Patterns:** Dokumentierte Flows und Best Practices

```bash
pnpm add @gkeferstein/design
```

**Vollständige Dokumentation:** `/root/projects/design.mojo/`

### 1.2 UX Flows übernehmen

Die UX-Patterns aus `design.mojo/packages/ux/docs/patterns/` sind verbindlich:

| Pattern | Dokumentation |
|---------|---------------|
| Tenant Switching | `tenant-switching.mdx` |
| Settings Architecture | `settings-architecture.mdx` |
| Entitlement Gating | `entitlement-gating.mdx` |

### 1.3 Verfügbare Komponenten

```tsx
// Layout-Komponenten (PFLICHT: MojoAppLayout verwenden)
import { MojoAppLayout, MojoShell, MojoSidebar, SettingsLayout, MojoFooter } from '@gkeferstein/design'

// Navigation
import { MojoGlobalHeader, MojoAppSwitcher, TenantSwitcher, MojoUserMenu } from '@gkeferstein/design'

// Platform
import { EntitlementGate, RoleBadge, MembershipStatusPill } from '@gkeferstein/design'

// UI
import { Button, Card, Badge, Dialog, Tabs, SearchInput, EmptyState } from '@gkeferstein/design'

// Charts
import { BarChart, LineChart, PieChart, AreaChart, Sparkline } from '@gkeferstein/design'
```

### 1.4 Einheitliches App-Layout (PFLICHT)

**ALLE MOJO Apps MÜSSEN `MojoAppLayout` aus `@gkeferstein/design` verwenden.**

`MojoAppLayout` kombiniert alle notwendigen Layout-Komponenten:
- **MojoGlobalHeader** (Topbar mit App Switcher, Tenant Switcher, User Menu)
- **MojoSidebar** (App-spezifische Navigation)
- **MojoFooter** (Einheitlicher Footer)
- **MojoShell** (Layout Wrapper mit Background)

#### Standard Implementation

```tsx
// app/(dashboard)/layout.tsx
import { MojoAppLayout } from '@gkeferstein/design'
import { useAuth } from '@clerk/nextjs'
import { Home, Users, Settings } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { userId, orgId, user } = useAuth()
  const entitlements = (user?.publicMetadata?.entitlements as string[]) || []
  
  const sidebarSections = [
    {
      id: 'main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <Home />, href: '/' },
        { id: 'contacts', label: 'Kontakte', icon: <Users />, href: '/contacts' },
      ],
    },
    {
      id: 'admin',
      title: 'Administration',
      items: [
        { id: 'settings', label: 'Einstellungen', icon: <Settings />, href: '/settings' },
      ],
    },
  ]

  return (
    <MojoAppLayout
      currentApp="kontakte"
      user={{
        id: userId!,
        name: user?.fullName || 'User',
        email: user?.emailAddresses[0]?.emailAddress || '',
        imageUrl: user?.imageUrl,
      }}
      tenant={orgId ? {
        id: orgId,
        name: org?.name || 'Organisation',
        type: 'organization',
      } : {
        id: userId!,
        name: 'Persönliches Konto',
        type: 'personal',
      }}
      tenants={organizations.map(org => ({
        id: org.id,
        name: org.name,
        type: 'organization',
      }))}
      entitlements={entitlements}
      sidebarSections={sidebarSections}
      sidebarLogo={<KontakteLogo />}
      onTenantSwitch={(id) => setActiveOrg(id)}
      onLogout={() => signOut()}
    >
      {children}
    </MojoAppLayout>
  )
}
```

#### Regeln

| ✅ RICHTIG | ❌ VERBOTEN |
|------------|-------------|
| IMMER `MojoAppLayout` verwenden | Eigene Header/Sidebar/Footer implementieren |
| IMMER alle Props korrekt setzen | Layout-Komponenten umgehen |
| Einheitliche Sidebar-Struktur (max. 2-3 Sections) | Verschiedene Layout-Patterns pro App |
| View Transitions API für App-Wechsel nutzen | `window.location.href` ohne View Transitions |

#### Smooth Navigation zwischen Apps

`MojoAppLayout` verwendet automatisch die **View Transitions API** für smooth Cross-App Navigation:
- ✅ Automatisch aktiviert, wenn Browser unterstützt
- ✅ Fallback für ältere Browser
- ✅ Keine zusätzliche Konfiguration nötig

#### Sidebar-Struktur

```tsx
const sidebarSections: SidebarSection[] = [
  {
    id: 'main', // Haupt-Navigation
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <Home />, href: '/' },
      { id: 'feature1', label: 'Feature 1', icon: <Icon />, href: '/feature1' },
    ],
  },
  {
    id: 'admin', // Optional: Admin-Bereich
    title: 'Administration',
    items: [
      { id: 'settings', label: 'Einstellungen', icon: <Settings />, href: '/settings' },
    ],
  },
]
```

**Best Practices:**
- Maximal 2-3 Sections
- Pro Section maximal 6-8 Items
- Aktives Item wird automatisch hervorgehoben
- Sidebar Collapse-State wird gespeichert (localStorage)

#### Legacy: MojoShell direkt verwenden

**NUR** wenn spezielle Anforderungen bestehen, kann `MojoShell` direkt verwendet werden. In diesem Fall müssen Header, Sidebar und Footer manuell kombiniert werden. Dies ist jedoch **nicht empfohlen** und sollte nur in Ausnahmefällen verwendet werden.

### 1.5 Loading States

```tsx
import { LoadingSkeleton, Skeleton } from '@gkeferstein/design'

// Skeleton für Listen
<div className="space-y-3">
  {[...Array(5)].map((_, i) => (
    <Skeleton key={i} className="h-16 w-full" />
  ))}
</div>

// Page Loading
<div className="flex items-center justify-center h-[50vh]">
  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
</div>
```

### 1.6 Error & Empty States

```tsx
import { EmptyState, ErrorState, ForbiddenState } from '@gkeferstein/design'

// Leere Liste
<EmptyState
  title="Keine Kontakte"
  description="Füge deinen ersten Kontakt hinzu"
  action={<Button>Kontakt erstellen</Button>}
/>

// Fehler
<ErrorState
  error={error}
  onRetry={() => refetch()}
/>

// Keine Berechtigung
<ForbiddenState
  title="Zugriff verweigert"
  description="Du hast keine Berechtigung für diese Seite"
/>
```

### 1.7 Toast/Notifications

```tsx
import { toast } from 'sonner';

// Success
toast.success('Erfolgreich gespeichert');

// Error
toast.error('Fehler beim Speichern', {
  description: 'Bitte versuchen Sie es erneut.',
});

// Loading
const toastId = toast.loading('Wird gespeichert...');
toast.success('Gespeichert', { id: toastId });
```

### 1.8 Form Patterns

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@gkeferstein/design'

const schema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  email: z.string().email('Ungültige E-Mail'),
});

export function ExampleForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
        </Button>
      </form>
    </Form>
  );
}
```

### 1.9 Entitlement Gating

Für Feature-Gating basierend auf Subscription/Berechtigungen:

```tsx
import { EntitlementGate } from '@gkeferstein/design'

function PremiumFeature() {
  return (
    <EntitlementGate
      hasAccess={user.entitlements.includes('premium')}
      featureName="Premium Analytics"
      featureDescription="Erweiterte Einblicke in deine Daten"
      onCtaClick={() => router.push('/billing/upgrade')}
    >
      <AdvancedAnalytics />
    </EntitlementGate>
  )
}
```

**UX Regel:** Gesperrte Features SOLLEN sichtbar aber als gesperrt markiert sein (nicht verstecken).

---

## 2. Navigation Standards

### 2.1 Globale Navigation Architektur

```
┌──────────────────────────────────────────────────────────────────────┐
│ [App-Switcher]     [Search]     [Messaging] [Tenant-Switcher] [User] │
├──────────────────────────────────────────────────────────────────────┤
│ Sidebar            │                                                  │
│ ┌────────────────┐ │              Main Content                       │
│ │ Logo           │ │                                                  │
│ ├────────────────┤ │                                                  │
│ │ Navigation     │ │                                                  │
│ │ • Dashboard    │ │                                                  │
│ │ • Feature 1    │ │                                                  │
│ │ • Feature 2    │ │                                                  │
│ ├────────────────┤ │                                                  │
│ │ Admin          │ │                                                  │
│ │ • Settings     │ │                                                  │
│ └────────────────┘ │                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 App Switching (Plattform-übergreifend)

Der App Switcher ermöglicht Navigation zwischen MOJO-Anwendungen:

```tsx
import { MojoGlobalHeader, MojoAppSwitcher } from '@gkeferstein/design'

// In der Topbar verwenden
<MojoGlobalHeader
  currentApp="kontakte"  // ID der aktuellen App
  user={user}
  tenant={tenant}
  tenants={tenants}
  entitlements={entitlements}
  onTenantSwitch={switchTenant}
  onLogout={signOut}
/>
```

**App-Kategorien:**

| Kategorie | Apps | Zugang |
|-----------|------|--------|
| User | campus.mojo, account.mojo | Alle authentifizierten User |
| Team | pos.mojo, checkin.mojo | Mit Entitlement `{app}:access` |
| Admin | payments.mojo, kontakte.mojo, connect.mojo, mailer.mojo | Mit Entitlement `{app}:admin` |

**Registrierte Apps:** Definiert in `design.mojo/packages/design/src/navigation/apps.ts`

### 2.3 Tenant Switching

Der Tenant Switcher ermöglicht Wechsel zwischen persönlichem Konto und Organisationen:

```tsx
import { TenantSwitcher } from '@gkeferstein/design'

<TenantSwitcher
  currentTenant={tenant}
  tenants={tenants}
  onTenantChange={(newTenant) => switchTenant(newTenant.id)}
  onCreateOrganization={() => router.push('/create-org')}
  variant="compact"
/>
```

**UX-Regeln für Tenant Switching:**

1. **Immer aktuellen Kontext zeigen** - User darf nie verwirrt sein, in welchem Kontext er arbeitet
2. **Beim Wechsel zur äquivalenten Seite navigieren** - Wenn Seite im neuen Kontext nicht existiert → Dashboard
3. **Unsaved Changes Warning** - Vor dem Wechsel warnen wenn ungespeicherte Änderungen
4. **Loading Indicator** - Kurze Ladeanimation während des Wechsels

**Visuelle Indikatoren:**
- Persönliches Konto: User-Icon
- Organisation: Building-Icon oder Logo
- Rolle als Badge anzeigen

### 2.4 In-App Navigation (Sidebar)

Jede App MUSS eine konsistente Sidebar-Navigation haben:

```tsx
import { MojoSidebar, type SidebarSection } from '@gkeferstein/design'

const sections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <Home />, href: '/' },
      { id: 'contacts', label: 'Kontakte', icon: <Users />, href: '/contacts' },
    ],
  },
  {
    id: 'admin',
    title: 'Administration',
    items: [
      { id: 'settings', label: 'Einstellungen', icon: <Settings />, href: '/settings' },
    ],
  },
]

<MojoSidebar
  logo={<AppLogo />}
  collapsedLogo={<AppLogoSmall />}
  sections={sections}
  collapsed={sidebarCollapsed}
  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
  footer={<SidebarFooter />}
/>
```

**Sidebar-Struktur:**

| Bereich | Inhalt |
|---------|--------|
| Header | App-Logo (klappbar auf Icon) |
| Navigation | Hauptfeatures gruppiert nach Sections |
| Footer | Collapse-Toggle, optional User-Info |

**Regeln:**
- Maximal 2-3 Sektionen
- Pro Sektion maximal 6-8 Items
- Aktives Item visuell hervorheben
- Collapsed-State speichern (localStorage)

**Client-Side Navigation:**
- `UnifiedSidebar` verwendet automatisch Next.js Link für client-side Navigation
- Kein Page-Reload beim Navigieren zwischen Seiten
- Automatisches Prefetching für bessere Performance
- Fallback zu `<a>` Tags, wenn Next.js nicht verfügbar

### 2.5 Settings Navigation

Settings sind auf 3 Ebenen organisiert:

```
Account Settings (Persönlich)
├── Profil
├── Sicherheit
├── Benachrichtigungen
└── Verbundene Accounts

Organization Settings (Tenant)
├── Allgemein
├── Mitglieder & Rollen
├── Abrechnung
├── Integrationen
└── Sicherheitsrichtlinien

Platform Settings (Admin Only)
├── Systemkonfiguration
├── Feature Flags
├── Audit Logs
└── Support Tools
```

```tsx
import { SettingsLayout } from '@gkeferstein/design'

<SettingsLayout
  title="Einstellungen"
  description="Verwalte dein Konto"
  settingsType="account"  // 'account' | 'tenant' | 'platform'
  sections={settingsSections}
  activeSectionId={currentSection}
>
  <SettingsContent />
</SettingsLayout>
```

**UX-Regeln:**
- Immer Settings-Level anzeigen (Badge/Farbe)
- Nur Einstellungen zeigen, die User sehen darf
- Einstellungen die User sehen aber nicht ändern darf → disabled (nicht verstecken)

### 2.6 Komplettes Layout Beispiel

**⚠️ WICHTIG:** Verwende `MojoAppLayout` statt der manuellen Kombination (siehe Section 1.4).

**✅ EMPFOHLEN: MojoAppLayout verwenden**

```tsx
// app/(dashboard)/layout.tsx
import { MojoAppLayout } from '@gkeferstein/design'
// ... siehe Section 1.4 für vollständiges Beispiel
```

**❌ VERALTET: Manuelle Kombination (nur für Referenz)**

Die manuelle Kombination von `MojoShell`, `MojoGlobalHeader` und `MojoSidebar` wird nicht mehr empfohlen. Verwende stattdessen `MojoAppLayout` für konsistente Layouts.
```

---

## 3. Clerk Authentication

### 3.1 Clerk Setup

```typescript
// middleware.ts (Next.js)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const { pathname } = request.nextUrl;

  // Eingeloggt + auf Sign-In → Dashboard (verhindert Redirect-Loops)
  if (userId && pathname.startsWith('/sign-in')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Eingeloggt + auf Sign-Up → Dashboard
  if (userId && pathname.startsWith('/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Nicht eingeloggt + protected Route → Sign-In
  if (!userId && !isPublicRoute(request)) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Protected Routes prüfen
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**WICHTIG:** Middleware ist der einzige Ort für Auth-Redirects! Siehe Abschnitt 3.7 für Details.

### 3.2 Protected API Routes (Next.js)

```typescript
// app/api/example/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { verifyToken } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  const { userId, orgId, getToken } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // orgId = aktueller Tenant (Clerk Organization)
  const tenantId = orgId || userId; // Fallback auf Personal Account

  // Optional: JWT Token verifizieren (mit Clock Skew Toleranz)
  try {
    const token = await getToken();
    if (token) {
      await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
        clockSkewInMs: 60000, // 60 Sekunden Toleranz für Clock Skew
      });
    }
  } catch (error) {
    // Clock Skew Error ignorieren, aber andere Fehler weiterwerfen
    if (!error.message?.includes('cannot be used prior to not before date')) {
      throw error;
    }
  }
  
  // Business Logic...
}
```

**JWT Clock Skew:**
- Problem: Server-Uhren können leicht abweichen, führt zu "cannot be used prior to not before date" Fehlern
- Lösung: `clockSkewInMs: 60000` (60 Sekunden Toleranz) beim Token-Verify setzen

### 3.3 Protected API Routes (Fastify/Express)

```typescript
// Fastify Plugin
import { clerkPlugin, getAuth } from '@clerk/fastify';

fastify.register(clerkPlugin);

fastify.addHook('preHandler', async (request, reply) => {
  const { userId, orgId } = getAuth(request);
  
  if (!userId) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  
  request.userId = userId;
  request.tenantId = orgId || userId;
});
```

### 3.4 Clerk Webhooks

```typescript
// Standard Webhook Handler für User/Org Sync
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };

  const wh = new Webhook(WEBHOOK_SECRET);
  const evt = wh.verify(payload, headers) as WebhookEvent;

  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data);
      break;
    case 'organization.created':
      await handleOrgCreated(evt.data);
      break;
    case 'organizationMembership.created':
      await handleMembershipCreated(evt.data);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

### 3.5 Session Token für Service-to-Service

```typescript
// Frontend: Token für API Calls holen
import { useAuth } from '@clerk/nextjs';

export function useApiClient() {
  const { getToken } = useAuth();
  
  return async (endpoint: string, options?: RequestInit) => {
    const token = await getToken();
    
    return fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };
}
```

### 3.6 Sign-In/Sign-Up Seiten (Next.js)

**ALLE Apps MÜSSEN einheitliche Sign-In/Sign-Up Seiten implementieren.**

#### ⚠️ WICHTIG: Next.js Route Groups & Layouts

**Route Groups `(groupName)` ändern die URL nicht, aber beeinflussen welches Layout verwendet wird.**

**Problem:**
```
app/page.tsx → "/" (Root Layout)
app/(dashboard)/page.tsx → "/" (Dashboard Layout)
```
**Wenn beide existieren, wird `app/page.tsx` BEVORZUGT und das Dashboard-Layout wird NICHT verwendet!**

**Lösung:**
```
app/page.tsx → redirect('/dashboard')
app/(dashboard)/dashboard/page.tsx → Dashboard-Inhalt mit Layout
```

Oder alternativ:
```
app/page.tsx → Root-Inhalt (wenn gewünscht)
app/(dashboard)/dashboard/page.tsx → Dashboard-Inhalt
app/(dashboard)/layout.tsx → Dashboard Layout (nur für /dashboard/*)
```

#### Dateistruktur

```
app/
├── page.tsx                    # Root → redirect('/dashboard')
├── (auth)/
│   ├── sign-in/
│   │   └── page.tsx
│   └── sign-up/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx              # Dashboard Layout
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard-Inhalt
│   └── [feature]/
│       └── page.tsx
└── layout.tsx                  # Root Layout
```

#### ClerkProvider Konfiguration (GLOBAL)

**WICHTIG:** `fallbackRedirectUrl` in der `<SignIn>` Komponente allein reicht NICHT für zuverlässige Redirects!

```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
    >
      {children}
    </ClerkProvider>
  );
}
```

**Regel:** Redirect-URLs IMMER GLOBAL im ClerkProvider setzen, nicht nur in den Sign-In/Sign-Up Komponenten!

#### Standard Implementation

```tsx
// app/(auth)/sign-in/page.tsx
'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  
  // Client-Side Fallback Redirect (wenn Middleware nicht greift)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
      router.replace(redirectUrl);
    }
  }, [isLoaded, isSignedIn, router, searchParams]);
  
  // Wenn bereits eingeloggt, zeige Loading (Middleware sollte redirecten)
  if (isLoaded && isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Weiterleitung...</div>
      </div>
    );
  }

  // Redirect URL aus Query-Parameter oder Standard-Route
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl={redirectUrl}
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
}
```

```tsx
// app/(auth)/sign-up/page.tsx
'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  
  // Nach Sign-Up zur Onboarding-Seite oder angegebene Route
  const redirectUrl = searchParams.get('redirect_url') || '/onboarding';
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl={redirectUrl}
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
}
```

#### Regeln

| ✅ RICHTIG | ❌ VERBOTEN |
|------------|-------------|
| `/sign-in` und `/sign-up` als Routen verwenden | Andere Pfade wie `/login` oder `/register` |
| Clerk `<SignIn />` und `<SignUp />` Komponenten verwenden | Eigene Auth-Forms implementieren |
| `afterSignInUrl` und `afterSignUpUrl` setzen | Ohne Redirect-Logik arbeiten |
| Zentriertes Layout mit minimalem Styling | Komplexe Custom-Styles (nutze Clerk Appearance API) |

### 3.7 Redirect-Logik nach Sign-In/Sign-Up

**WICHTIG:** Alle Apps müssen konsistente Redirect-Flows implementieren.

#### ⚠️ Redirect-Loop Prävention

**Ursachen für Redirect-Loops:**

1. **Race Conditions**: Server-Side `auth()` vs Client-Side `useAuth()` haben unterschiedliches Timing
2. **Doppelte Redirects**: Middleware UND Komponenten machen Auth-Checks
3. **Auth-State Abhängigkeit**: `isAuthenticated` wartet auf Backend-Daten statt Clerk-State

**Best Practices:**

**✅ DO: Middleware für ALLE Auth-Redirects**
- Middleware ist server-side und läuft vor jeder Route
- Siehe Abschnitt 3.1 für vollständige Implementation

**✅ DO: Client-Side nur als Fallback**
- Nur in Sign-In/Sign-Up Pages als Backup
- Siehe Abschnitt 3.6 für Beispiel

**❌ DON'T: Auth-Checks in Layout-Komponenten**

```tsx
// ❌ FALSCH - Führt zu Loops!
function DashboardLayout({ children }) {
  const { isSignedIn } = useAuth();
  
  if (!isSignedIn) {
    router.push('/sign-in'); // ❌ NICHT MACHEN
  }
  
  return <MojoShell>{children}</MojoShell>;
}
```

```tsx
// ✅ RICHTIG - Trust Middleware
function DashboardLayout({ children }) {
  const { isLoaded } = useAuth();
  
  // Nur Loading-State während Clerk lädt
  if (!isLoaded) {
    return <Loading />;
  }
  
  // Middleware hat Auth bereits geprüft
  return <MojoShell>{children}</MojoShell>;
}
```

#### isAuthenticated Definition

**Problem:** `isAuthenticated` basierte auf Backend-User-Daten, die noch laden.

**Lösung:** Basiere `isAuthenticated` auf Clerk's `isSignedIn`, nicht auf Backend-Daten.

```tsx
// lib/auth-context.tsx
import { useAuth as useClerkAuth } from '@clerk/nextjs';

export function useAuth() {
  const { isSignedIn, isLoaded: clerkLoaded, user: clerkUser } = useClerkAuth();
  
  return {
    // ✅ Basiert auf Clerk's isSignedIn, nicht auf Backend-Daten
    isAuthenticated: isSignedIn === true && clerkLoaded === true,
    // Backend-Daten können im Hintergrund laden
    user: clerkUser, // Kann null sein während isAuthenticated true ist
    clerkLoaded,
    isSignedIn,
  };
}
```

**Regel:** `isAuthenticated` = `isSignedIn && clerkLoaded`. Backend-Daten sind optional und können später laden.

#### Standard Redirect-Flows

```typescript
// lib/auth-redirect.ts
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export function useAuthRedirect() {
  const router = useRouter();
  const { userId, orgId, isLoaded } = useAuth();

  /**
   * Bestimmt die Redirect-URL nach erfolgreichem Sign-In
   */
  function getRedirectUrlAfterSignIn(): string {
    // 1. Prüfe Query-Parameter für explizite Redirect-URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect_url');
      if (redirectUrl && redirectUrl.startsWith('/')) {
        return redirectUrl;
      }
    }

    // 2. Wenn User bereits Teil einer Organization ist → Dashboard
    if (orgId) {
      return '/';
    }

    // 3. Wenn User keine Organization hat → Onboarding/Org-Auswahl
    return '/onboarding';
  }

  /**
   * Bestimmt die Redirect-URL nach erfolgreichem Sign-Up
   */
  function getRedirectUrlAfterSignUp(): string {
    // Immer zum Onboarding für neue User
    return '/onboarding';
  }

  return {
    getRedirectUrlAfterSignIn,
    getRedirectUrlAfterSignUp,
  };
}
```

#### Redirect-Prioritäten (nach Sign-In)

1. **Query-Parameter `redirect_url`** (höchste Priorität)
   - Erlaubt explizite Redirects z.B. von Deep-Links
   - Beispiel: `/sign-in?redirect_url=/contacts/123`

2. **Aktive Organization** (`orgId` vorhanden)
   - Redirect zum Dashboard der App (`/`)
   - User ist bereits Teil einer Organisation

3. **Keine Organization** (Fallback)
   - Redirect zum Onboarding (`/onboarding`)
   - User muss Organisation erstellen oder beitreten

#### Redirect-Prioritäten (nach Sign-Up)

1. **Immer Onboarding**
   - Neue User werden IMMER zu `/onboarding` weitergeleitet
   - Ausnahme: `redirect_url` Query-Parameter (für spezielle Flows)

2. **Onboarding-Flow**
   ```
   Sign-Up → /onboarding → (Organisation erstellen oder beitreten) → Dashboard
   ```

#### Empfohlene Architektur

```
┌─────────────────────────────────────────────────────────┐
│                     Middleware                          │
│  - ALLE Auth-Redirects                                  │
│  - Server-Side, zuverlässig                             │
│  - Eingeloggt + auf Sign-In → Dashboard                │
│  - Nicht eingeloggt + protected → Sign-In              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   ClerkProvider                         │
│  - afterSignInUrl, afterSignUpUrl                      │
│  - Global Redirect-Konfiguration                       │
│  - Fallback-Redirects                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Sign-In Page                          │
│  - Client-Side Fallback (router.replace)               │
│  - NUR wenn Middleware nicht greift                    │
│  - Zeigt Loading wenn bereits eingeloggt               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 DashboardLayout                         │
│  - KEINE Auth-Redirects!                               │
│  - Nur Loading-State während Clerk lädt                │
│  - Trust Middleware                                    │
│  - isAuthenticated = isSignedIn && clerkLoaded         │
└─────────────────────────────────────────────────────────┘
```

**Regeln:**
1. ✅ Middleware = einzige Quelle für Auth-Redirects
2. ✅ ClerkProvider = globale Redirect-Konfiguration
3. ✅ Sign-In Page = nur Client-Side Fallback
4. ✅ Layouts = keine Auth-Redirects, nur Loading-States

### 3.8 Sign-Out Implementation

```tsx
// components/auth/sign-out-button.tsx
'use client';

import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@gkeferstein/design';

export function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      redirectUrl: '/',
    });
    router.push('/');
  };

  return (
    <Button variant="ghost" onClick={handleSignOut}>
      Abmelden
    </Button>
  );
}
```

**Regeln:**
- Sign-Out redirectet IMMER zur Startseite (`/`) oder zur Sign-In-Seite
- Keine Redirect-URL Parameter bei Sign-Out (Sicherheit)

### 3.9 Neue User & Organizations (Onboarding Flow)

**WICHTIG:** Wenn ein neuer User oder eine neue Organization erstellt wird, müssen entsprechende Tenants angelegt werden.

#### Webhook-Handler für neue User

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { createPersonalTenant } from '@/lib/tenant-service';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = await headers();
  
  const headersList = {
    'svix-id': headerPayload.get('svix-id')!,
    'svix-timestamp': headerPayload.get('svix-timestamp')!,
    'svix-signature': headerPayload.get('svix-signature')!,
  };

  const wh = new Webhook(WEBHOOK_SECRET);
  const evt = wh.verify(payload, headersList) as WebhookEvent;

  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data);
      break;
    
    case 'organization.created':
      await handleOrganizationCreated(evt.data);
      break;
    
    case 'organizationMembership.created':
      await handleOrganizationMembershipCreated(evt.data);
      break;
  }

  return new Response('OK', { status: 200 });
}

/**
 * Neuer User wurde erstellt
 * → Persönlichen Tenant anlegen
 */
async function handleUserCreated(data: any) {
  const userId = data.id;
  const email = data.email_addresses[0]?.email_address;
  const firstName = data.first_name;
  const lastName = data.last_name;

  // Persönlichen Tenant für User anlegen
  await createPersonalTenant({
    clerkUserId: userId,
    email,
    name: `${firstName} ${lastName}`.trim() || 'Persönliches Konto',
  });
}

/**
 * Neue Organization wurde erstellt
 * → Tenant für Organization anlegen
 */
async function handleOrganizationCreated(data: any) {
  const orgId = data.id;
  const orgName = data.name;
  const clerkUserId = data.created_by; // Owner User ID

  // Tenant für Organization anlegen
  await createOrganizationTenant({
    clerkOrgId: orgId,
    name: orgName,
    ownerUserId: clerkUserId,
  });
}

/**
 * User wurde zu Organization hinzugefügt
 * → Optional: Berechtigungen synchronisieren
 */
async function handleOrganizationMembershipCreated(data: any) {
  const userId = data.public_user_data.user_id;
  const orgId = data.organization.id;
  const role = data.role; // 'org:admin' | 'org:member' | etc.

  // Optional: Rollen in eigener Datenbank synchronisieren
  // await syncOrganizationMembership(userId, orgId, role);
}
```

#### Tenant-Service Implementation

```typescript
// lib/tenant-service.ts
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Erstellt einen persönlichen Tenant für einen neuen User
 */
export async function createPersonalTenant(data: {
  clerkUserId: string;
  email: string;
  name: string;
}) {
  // Prüfe ob bereits existiert
  const existing = await prisma.tenant.findFirst({
    where: {
      metadata: {
        path: ['clerkUserId'],
        equals: data.clerkUserId,
      },
      isPersonal: true,
    },
  });

  if (existing) {
    return existing;
  }

  // Slug aus E-Mail generieren
  const slug = generateSlugFromEmail(data.email);

  // Tenant anlegen
  const tenant = await prisma.tenant.create({
    data: {
      id: uuidv4(),
      slug,
      name: data.name,
      isPersonal: true,
      status: 'active',
      metadata: {
        clerkUserId: data.clerkUserId,
        email: data.email,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return tenant;
}

/**
 * Erstellt einen Tenant für eine Organization
 */
export async function createOrganizationTenant(data: {
  clerkOrgId: string;
  name: string;
  ownerUserId: string;
}) {
  // Prüfe ob bereits existiert
  const existing = await prisma.tenant.findFirst({
    where: {
      clerkOrgId: data.clerkOrgId,
    },
  });

  if (existing) {
    return existing;
  }

  // Slug aus Name generieren
  const slug = generateSlugFromName(data.name);

  // Tenant anlegen
  const tenant = await prisma.tenant.create({
    data: {
      id: uuidv4(),
      slug,
      name: data.name,
      clerkOrgId: data.clerkOrgId,
      isPersonal: false,
      status: 'active',
      metadata: {
        ownerUserId: data.ownerUserId,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return tenant;
}

function generateSlugFromEmail(email: string): string {
  const base = email.split('@')[0].toLowerCase();
  return base.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
}

function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 63);
}
```

#### Onboarding-Seite (nach Sign-Up)

```tsx
// app/onboarding/page.tsx
'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@gkeferstein/design';

export default function OnboardingPage() {
  const { userId, orgId, isLoaded } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    if (!isLoaded) return;

    // Wenn bereits in Organization → direkt zum Dashboard
    if (orgId) {
      router.push('/');
      return;
    }

    // Lade verfügbare Organizations
    // loadOrganizations();
  }, [isLoaded, orgId, router]);

  const handleCreateOrganization = () => {
    router.push('/organizations/new');
  };

  const handleJoinOrganization = () => {
    router.push('/organizations/join');
  };

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Willkommen bei MOJO</CardTitle>
          <CardDescription>
            Bitte wähle, ob du eine neue Organisation erstellen oder einer bestehenden beitreten möchtest.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCreateOrganization} className="w-full">
            Neue Organisation erstellen
          </Button>
          <Button onClick={handleJoinOrganization} variant="outline" className="w-full">
            Organisation beitreten
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Flow-Diagramm: Neuer User

```
1. User registriert sich
   ↓
2. Clerk Webhook: user.created
   ↓
3. Tenant-Service: Persönlicher Tenant wird angelegt
   ↓
4. Redirect: /onboarding
   ↓
5. User wählt: Organisation erstellen ODER beitreten
   ↓
6a. Organisation erstellen → clerkOrgId wird angelegt → Tenant für Org angelegt → Redirect: /dashboard
6b. Organisation beitreten → Mitgliedschaft erstellt → Redirect: /dashboard
```

#### Flow-Diagramm: Neue Organization

```
1. User erstellt Organisation in Clerk
   ↓
2. Clerk Webhook: organization.created
   ↓
3. Tenant-Service: Tenant für Organisation wird angelegt (mit clerkOrgId)
   ↓
4. Automatischer Redirect: /dashboard (mit orgId im Session)
```

### 3.10 Debugging Checklist für Auth-Probleme

**Bei Redirect-Loops prüfen:**

- [ ] **Route Groups**: Gibt es `app/page.tsx` UND `app/(dashboard)/page.tsx`?
  - Lösung: `app/page.tsx` → `redirect('/dashboard')`
- [ ] **ClerkProvider**: Ist `afterSignInUrl` im ClerkProvider gesetzt?
  - Lösung: Redirect-URLs GLOBAL im ClerkProvider konfigurieren
- [ ] **Mehrfache Redirects**: Machen mehrere Komponenten Auth-Redirects?
  - Lösung: NUR Middleware macht Redirects, Layouts prüfen nur Loading
- [ ] **Auth-State**: Basiert `isAuthenticated` auf Clerk oder Backend?
  - Lösung: `isAuthenticated = isSignedIn && clerkLoaded`

**Clerk Console Messages:**

| Message | Bedeutung | Lösung |
|---------|-----------|--------|
| `"SignIn cannot render when user is already signed in"` | User ist eingeloggt, Redirect fehlt | Middleware sollte eingeloggte User von `/sign-in` redirecten |
| `"redirecting to afterSignIn URL"` | Clerk versucht Redirect | Prüfe URL-Konfiguration in ClerkProvider |
| `"JWT cannot be used prior to not before date claim (nbf)"` | Clock Skew Problem | `clockSkewInMs: 60000` beim Token-Verify setzen |

**Weitere Erkenntnisse:**

| Thema | Learning |
|-------|----------|
| **Knex.js** | In neueren Versionen ist `db.destroy` read-only, nicht überschreibbar |
| **Port-Konflikte** | Immer prüfen ob Backend/Frontend Ports belegt sind vor dem Start |
| **Auto-Tenant** | Bei Clerk Org IDs (`org_...`) Tenant automatisch erstellen wenn nicht vorhanden |
| **Database Migrations** | Manuelles Migration-Script als Fallback wenn Knex CLI fehlschlägt |

---

## 4. Multitenancy

### 4.1 Shared Package

Alle Apps MÜSSEN `@mojo/tenant` verwenden:

```bash
pnpm add @mojo/tenant
```

### 4.2 Standard Headers

| Header | Beschreibung | Beispiel |
|--------|-------------|----------|
| `x-tenant-id` | UUID des Tenants | `550e8400-e29b-41d4-a716-446655440000` |
| `x-tenant-slug` | Slug des Tenants | `acme-corp` |
| `x-service-name` | Name des aufrufenden Services | `kontakte-api` |

### 4.3 Tenant Model (Prisma)

```prisma
model Tenant {
  id         String   @id @default(uuid()) @db.Uuid
  name       String
  slug       String   @unique
  clerkOrgId String?  @unique @map("clerk_org_id")
  isPersonal Boolean  @default(false) @map("is_personal")
  status     String   @default("active") // active, pending, suspended
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("tenants")
}
```

### 4.4 Tenant Model (Knex)

```typescript
interface Tenant {
  id: string;
  name: string;
  slug: string;
  clerk_org_id: string | null;
  is_personal: boolean;
  status: 'active' | 'pending' | 'suspended';
  created_at: Date;
  updated_at: Date;
}
```

### 4.5 Service-to-Service Calls

```typescript
// Immer Tenant-Context mitsenden
async function callExternalService(endpoint: string, tenantId: string) {
  return fetch(endpoint, {
    headers: {
      'x-tenant-id': tenantId,
      'x-service-name': 'kontakte-api',
      'Content-Type': 'application/json',
    },
  });
}
```

### 4.6 Tenant Middleware (Fastify)

```typescript
import { createFastifyTenantMiddleware } from '@mojo/tenant';

// In Fastify App registrieren
fastify.register(createFastifyTenantMiddleware, {
  required: true,
  headerName: 'x-tenant-id',
});

// Zugriff in Routes
fastify.get('/data', async (request) => {
  const tenant = request.tenant;
  // tenant.id, tenant.slug, tenant.name verfügbar
});
```

### 4.7 Tenant Middleware (Express)

```typescript
import { createExpressTenantMiddleware } from '@mojo/tenant';

// In Express App verwenden
app.use(createExpressTenantMiddleware({
  required: true,
  headerName: 'x-tenant-id',
}));

// Zugriff in Routes
app.get('/data', (req, res) => {
  const tenant = req.tenant;
  // tenant.id, tenant.slug, tenant.name verfügbar
});
```

---

## 5. API Standards

### 5.1 Response Format

```typescript
// Success Response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

// Error Response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

### 5.2 Standard Error Codes

| Code | HTTP Status | Beschreibung |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Nicht authentifiziert |
| `FORBIDDEN` | 403 | Keine Berechtigung |
| `NOT_FOUND` | 404 | Ressource nicht gefunden |
| `VALIDATION_ERROR` | 400 | Validierungsfehler |
| `CONFLICT` | 409 | Konflikt (z.B. Duplikat) |
| `RATE_LIMITED` | 429 | Zu viele Anfragen |
| `INTERNAL_ERROR` | 500 | Interner Serverfehler |
| `SERVICE_UNAVAILABLE` | 503 | Service nicht verfügbar |

### 5.3 Pagination

```typescript
// Request Query Parameter
interface PaginationParams {
  page?: number;      // Default: 1
  pageSize?: number;  // Default: 20, Max: 100
  sort?: string;      // z.B. "createdAt:desc"
}

// Response Meta
interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Beispiel Response
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 5.4 Validation Errors

```typescript
// Validation Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validierung fehlgeschlagen",
    "details": {
      "fields": {
        "email": "Ungültige E-Mail-Adresse",
        "name": "Name ist erforderlich"
      }
    }
  }
}
```

### 5.5 API Pfade

```
/api/contacts
/api/payments
/api/health
```

**Konvention:** Alle APIs nutzen `/api` ohne Versionierung. Breaking Changes werden über Feature-Flags oder neue Endpoints gelöst.

---

## 6. Error Handling

### 5.1 Custom Error Classes

```typescript
// Base Error
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Specific Errors
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      'NOT_FOUND',
      id ? `${resource} mit ID ${id} nicht gefunden` : `${resource} nicht gefunden`,
      404
    );
  }
}

export class ValidationError extends AppError {
  constructor(fields: Record<string, string>) {
    super('VALIDATION_ERROR', 'Validierung fehlgeschlagen', 400, { fields });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Nicht authentifiziert') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Keine Berechtigung') {
    super('FORBIDDEN', message, 403);
  }
}
```

### 5.2 Error Handler (Fastify)

```typescript
fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Unbekannter Fehler
  fastify.log.error(error);
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ein interner Fehler ist aufgetreten',
    },
  });
});
```

### 5.3 Error Handler (Express)

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ein interner Fehler ist aufgetreten',
    },
  });
});
```

### 5.4 Frontend Error Boundary

```tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, info);
    // Optional: Error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2>Ein Fehler ist aufgetreten</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 7. Logging & Monitoring

### 6.1 Log Levels

| Level | Verwendung |
|-------|-----------|
| `error` | Fehler, die Intervention erfordern |
| `warn` | Unerwartete Situationen, aber kein Fehler |
| `info` | Wichtige Business Events |
| `debug` | Entwickler-relevante Details |

### 6.2 Log Format (JSON)

```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601
  level: string;          // error, warn, info, debug
  message: string;
  service: string;        // z.B. "kontakte-api"
  tenantId?: string;
  userId?: string;
  requestId?: string;
  duration?: number;      // ms
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  meta?: Record<string, unknown>;
}
```

### 6.3 Pino Logger Setup

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: process.env.SERVICE_NAME || 'unknown',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Child Logger mit Context
const requestLogger = logger.child({
  tenantId: request.tenant?.id,
  userId: request.userId,
  requestId: request.id,
});

requestLogger.info('Processing request');
```

### 6.4 Request ID Propagation

```typescript
// Fastify Plugin
import { randomUUID } from 'crypto';

fastify.addHook('onRequest', async (request) => {
  request.id = request.headers['x-request-id'] as string || randomUUID();
});

fastify.addHook('onSend', async (request, reply) => {
  reply.header('x-request-id', request.id);
});
```

### 6.5 Performance Logging

```typescript
// Request Duration logging
fastify.addHook('onResponse', async (request, reply) => {
  const duration = reply.elapsedTime;
  
  logger.info({
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    duration: Math.round(duration),
    tenantId: request.tenant?.id,
  }, `${request.method} ${request.url} ${reply.statusCode} - ${Math.round(duration)}ms`);
});
```

### 6.6 Audit Logging

```typescript
// Für kritische Aktionen
interface AuditLogEntry {
  action: string;         // z.B. "user.created", "payment.processed"
  actor: {
    type: 'user' | 'system' | 'service';
    id: string;
  };
  target: {
    type: string;         // z.B. "contact", "invoice"
    id: string;
  };
  tenantId: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

async function auditLog(entry: AuditLogEntry) {
  logger.info({ audit: true, ...entry }, `AUDIT: ${entry.action}`);
  // Optional: In separate Audit-Tabelle speichern
}
```

---

## 8. Code Style

### 7.1 TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 7.2 ESLint Config

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### 7.3 Prettier Config

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 7.4 Naming Conventions

| Element | Convention | Beispiel |
|---------|-----------|----------|
| Variablen | camelCase | `userName`, `isActive` |
| Funktionen | camelCase | `getUserById`, `calculateTotal` |
| Klassen | PascalCase | `UserService`, `PaymentController` |
| Interfaces | PascalCase | `User`, `PaymentRequest` |
| Types | PascalCase | `UserId`, `TenantContext` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Dateien (Komponenten) | PascalCase | `UserCard.tsx`, `PaymentForm.tsx` |
| Dateien (Utils) | kebab-case | `date-utils.ts`, `api-client.ts` |
| Datenbank Tabellen | snake_case (Plural) | `users`, `payment_transactions` |
| Datenbank Spalten | snake_case | `created_at`, `tenant_id` |

### 7.5 Dateistruktur (Next.js App)

```
app/
├── (auth)/
│   ├── sign-in/
│   └── sign-up/
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── [feature]/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
├── api/
│   └── [feature]/
│       └── route.ts
└── layout.tsx

components/
├── ui/              # Shadcn/Design System
├── forms/           # Form-spezifische Komponenten
├── layout/          # Header, Sidebar, etc.
└── [feature]/       # Feature-spezifische Komponenten

lib/
├── api.ts           # API Client
├── utils.ts         # Utility Functions
└── validations.ts   # Zod Schemas

hooks/
└── use-[hook].ts    # Custom Hooks

types/
└── index.ts         # Type Definitions
```

### 7.6 Dateistruktur (Backend API)

```
src/
├── api/
│   ├── routes/
│   │   └── [feature].routes.ts
│   ├── controllers/
│   │   └── [feature].controller.ts
│   └── middleware/
│       ├── auth.ts
│       └── tenant.ts
├── domains/
│   └── [feature]/
│       ├── models/
│       │   └── [feature].interface.ts
│       ├── repositories/
│       │   └── [feature].repository.ts
│       └── services/
│           └── [feature].service.ts
├── infrastructure/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   └── external/
│       └── [service].client.ts
├── lib/
│   ├── errors.ts
│   └── logger.ts
└── index.ts
```

---

## 9. Datenbankstandards

### 8.1 Migration Naming

```
Format: YYYYMMDDHHMMSS_beschreibung.ts

Beispiele:
- 20251229120000_create_users_table.ts
- 20251229120100_add_tenant_id_to_contacts.ts
- 20251229120200_create_payment_transactions_index.ts
```

### 8.2 Standard Spalten

Jede Tabelle MUSS haben:

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id   UUID NOT NULL REFERENCES tenants(id)
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### 8.3 Soft Delete (optional)

```sql
deleted_at  TIMESTAMPTZ NULL
```

### 8.4 Index Conventions

```sql
-- Single Column
CREATE INDEX idx_[table]_[column] ON [table]([column]);

-- Composite
CREATE INDEX idx_[table]_[col1]_[col2] ON [table]([col1], [col2]);

-- Unique
CREATE UNIQUE INDEX uidx_[table]_[column] ON [table]([column]);

-- Tenant-spezifisch (häufig)
CREATE INDEX idx_[table]_tenant_id ON [table](tenant_id);
```

### 8.5 Foreign Key Naming

```sql
CONSTRAINT fk_[table]_[referenced_table] 
  FOREIGN KEY ([column]) 
  REFERENCES [referenced_table]([column])
```

---

## 10. Testing

### 9.1 Test Struktur

```
tests/
├── unit/
│   └── [feature]/
│       └── [file].test.ts
├── integration/
│   └── [feature]/
│       └── [file].integration.test.ts
└── e2e/
    └── [feature].e2e.test.ts
```

### 9.2 Test Naming

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {});
    it('should throw ValidationError for invalid email', async () => {});
    it('should throw ConflictError for duplicate email', async () => {});
  });
});
```

### 9.3 Test Utilities

```typescript
// Test Factory
export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: randomUUID(),
    email: `test-${randomUUID()}@example.com`,
    name: 'Test User',
    tenantId: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Test Tenant Context
export function createTestTenantContext(): TenantContext {
  return {
    tenant: {
      id: randomUUID(),
      slug: 'test-tenant',
      name: 'Test Tenant',
      status: 'active',
      isPersonal: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    source: 'header',
  };
}
```

---

## 11. Deployment & CI/CD

### 10.1 Environment Variables

```bash
# Pflicht für alle Apps
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...

# Service-spezifisch
PORT=3000
SERVICE_NAME=kontakte-api

# Optional
LOG_LEVEL=info
SENTRY_DSN=https://...
```

### 10.2 Health Check Endpoint

```typescript
// GET /health
{
  "status": "ok",
  "service": "kontakte-api",
  "version": "1.2.3",
  "uptime": 123456,
  "timestamp": "2025-12-29T12:00:00.000Z"
}
```

### 10.3 CI/CD Pipeline

Siehe `/root/projects/.project-template/.github/workflows/ci-cd.yml` für Standard-Pipeline.

**Wichtige Regeln:**
- ❌ NIEMALS Server-IPs hardcoden
- ✅ IMMER `secrets.DEPLOY_SERVER` verwenden
- ✅ IMMER `secrets.SSH_PRIVATE_KEY` verwenden

### 10.4 Docker Deployment

Alle Projekte verwenden Docker + Traefik für das Deployment:

```yaml
# docker-compose.yml
services:
  app:
    build: .
    environment:
      PORT: 3000
    expose:
      - "3000"
    networks:
      - mojo-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`app.mojo-institut.de`)"
```

**Server-Konzept:**
- **Dev-Server:** Entwicklung und Testing
- **Live-Server:** Produktiver Betrieb für Endnutzer

---

## 12. Messaging Integration

Das zentrale Messaging-System (`messaging.mojo`) ermöglicht Echtzeit-Kommunikation zwischen allen MOJO-Nutzern.

### 11.1 Architektur

```
                    ┌─────────────────────────┐
                    │    messaging.mojo       │
                    │  (Zentraler Service)    │
                    ├─────────────────────────┤
                    │  REST API + WebSocket   │
                    │  PostgreSQL + Redis     │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ kontakte.mojo │     │ accounts.mojo │     │  campus.mojo  │
│   (Widget)    │     │   (Widget)    │     │   (Widget)    │
└───────────────┘     └───────────────┘     └───────────────┘
```

**Wichtig:** Messaging wird als **eigenständiger Service** integriert, NICHT als Shared Package.

**Gründe:**
- ✅ Fehlertoleranz - Ein Bug crasht nicht alle Apps
- ✅ Unabhängiges Deployment - Apps können unabhängig deployen
- ✅ API-Versionierung - Breaking Changes kontrollierbar
- ✅ Lose Kopplung - Apps bleiben eigenständig

### 11.2 URLs

| Environment | REST API | WebSocket |
|-------------|----------|-----------|
| Production | `https://messaging.mojo-institut.de/api` | `wss://messaging.mojo-institut.de` |
| Development | `https://dev.messaging.mojo-institut.de/api` | `wss://dev.messaging.mojo-institut.de` |

### 11.3 Environment Variables

```bash
NEXT_PUBLIC_MESSAGING_API_URL=https://messaging.mojo-institut.de
NEXT_PUBLIC_MESSAGING_WS_URL=wss://messaging.mojo-institut.de
```

### 11.4 Widget-Position in Top Bar

```
[App-Switcher] ... [Search] ... [Messaging] [Notifications] [Tenant-Switcher] [User-Menu]
```

Das Messaging-Widget MUSS:
- In der Top-Bar rechts platziert sein
- `MessageCircle` Icon (Lucide) verwenden
- Ungelesen-Badge zeigen (1-99, >99 wird "99+")
- Dropdown mit max. 5 Konversationen
- Online-Status Punkt am Avatar zeigen
- Offline-Indicator am Icon bei WebSocket-Disconnect

### 11.5 Authentifizierung

Alle API-Calls benötigen Clerk JWT:

```typescript
const token = await getToken();

const response = await fetch(`${MESSAGING_API}/api/conversations`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-ID': orgId, // Optional
  },
});
```

### 11.6 WebSocket Verbindung

```typescript
import { io } from 'socket.io-client';

const socket = io(MESSAGING_WS_URL, {
  auth: {
    token: clerkJWT,
    tenantId: orgId, // Optional
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Events empfangen
socket.on('message:new', ({ message, conversationId }) => {
  // Neue Nachricht empfangen
});

socket.on('typing:update', ({ userId, conversationId, isTyping }) => {
  // Typing-Indicator aktualisieren
});

socket.on('presence:online', ({ userId }) => {
  // User ist online
});

// Events senden
socket.emit('message:send', {
  conversationId: 'uuid',
  content: 'Hello!',
  type: 'TEXT',
});

socket.emit('typing:start', { conversationId: 'uuid' });
socket.emit('messages:read', { conversationId: 'uuid' });
```

### 11.7 Wichtige Endpoints

| Endpoint | Method | Beschreibung |
|----------|--------|--------------|
| `/api/health` | GET | Health Check |
| `/api/conversations` | GET | Alle Konversationen |
| `/api/conversations` | POST | Neue Konversation |
| `/api/conversations/:id/messages` | GET | Nachrichten laden |
| `/api/conversations/:id/messages` | POST | Nachricht senden |
| `/api/conversations/:id/read` | POST | Als gelesen markieren |
| `/api/messages/unread` | GET | Ungelesene Anzahl |
| `/api/contacts/requests` | GET/POST | Kontaktanfragen |
| `/api/contacts/can-message/:userId` | GET | Berechtigung prüfen |

### 11.8 Permission System

Das Messaging-System verwendet regelbasierte Berechtigungen:

| Regel | Beschreibung |
|-------|-------------|
| Team-intern | Mitglieder derselben Organisation können frei kommunizieren |
| Cross-Org Manager | Owner/Admins können andere Owner/Admins kontaktieren (Kontaktanfrage nötig) |
| Support-Kanal | Alle können den MOJO Support kontaktieren |
| Plattform-Ankündigungen | Platform-Admins können Broadcasts senden |

### 11.9 Graceful Degradation

Das Widget DARF NIEMALS die Host-App crashen:

```tsx
// API-Fehler abfangen
try {
  const data = await fetchConversations();
  setConversations(data);
} catch (error) {
  console.error('[Messaging] API Error:', error);
  setShowWidget(false); // Widget ausblenden
}

// WebSocket-Fehler abfangen
socket.on('connect_error', (error) => {
  console.error('[Messaging] WebSocket Error:', error);
  setIsConnected(false); // Nur offline markieren, nicht crashen
});

// Error Boundary um Widget
<ErrorBoundary fallback={null}>
  <MessagingWidget />
</ErrorBoundary>
```

### 11.10 TypeScript Types

Types kopieren aus: `/root/projects/messaging.mojo/docs/types.ts`

```typescript
interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP' | 'SUPPORT' | 'ANNOUNCEMENT';
  name: string | null;
  participants: Participant[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'SYSTEM' | 'ATTACHMENT';
  createdAt: string;
  sender?: { name: string; avatarUrl?: string };
}

interface Participant {
  userId: string;
  tenantId: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  name?: string;
  avatarUrl?: string;
  isOnline: boolean;
}
```

### 11.11 Dokumentation

Vollständige Dokumentation im Repository:
- **README:** `/root/projects/messaging.mojo/README.md`
- **REST API:** `/root/projects/messaging.mojo/docs/api-reference.md`
- **WebSocket:** `/root/projects/messaging.mojo/docs/websocket-events.md`
- **Widget-Standards:** `/root/projects/messaging.mojo/docs/widget-standards.md`
- **TypeScript Types:** `/root/projects/messaging.mojo/docs/types.ts`

---

## 13. Einheitliche CI/CD Pipeline

Alle Projekte MÜSSEN die Standard-Pipelines verwenden.

> **Vollständige Dokumentation:** `/root/projects/STAGING_SERVER_CONVENTION.md`

### 13.1 Pipeline-Übersicht

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Code Quality│ ──► │ Build Image │ ──► │   Deploy    │ ──► │ Health Check│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
   TypeScript          Docker Build       Blue/Green          HTTP 200
   ESLint              Push to GHCR       Deployment          oder 401*
   Tests               Version Tags

* HTTP 401 ist auf Staging akzeptabel (Basic Auth)
```

**Templates:**
- Staging: `/root/projects/.project-template/.github/workflows/ci-staging.yml`
- Release: `/root/projects/.project-template/.github/workflows/ci-release.yml`

### 12.2 Test Stage

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test || echo "No tests configured"
    
    - name: Build
      run: npm run build || echo "No build script"
```

### 12.3 Deploy Stage

```yaml
deploy:
  needs: test
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
  steps:
    - uses: actions/checkout@v4
    
    - name: Check required secrets
      run: |
        if [ -z "${{ secrets.DEPLOY_SERVER }}" ]; then
          echo "❌ Fehler: DEPLOY_SERVER Secret nicht gesetzt!"
          exit 1
        fi
        if [ -z "${{ secrets.SSH_PRIVATE_KEY }}" ]; then
          echo "❌ Fehler: SSH_PRIVATE_KEY Secret nicht gesetzt!"
          exit 1
        fi
    
    - name: Deploy to Server
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.DEPLOY_SERVER }}
        username: root
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /root/projects/${{ github.event.repository.name }}
          git pull origin main || git pull origin develop
          
          # Docker Deployment (Traefik übernimmt Routing)
          if [ -f "docker-compose.yml" ]; then
            docker compose down || true
            docker compose build --no-cache
            docker compose up -d
          fi
          
          echo "✅ Deployed successfully"
```

### 12.4 Smoke Tests Stage

```yaml
smoke-tests:
  needs: deploy
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
  steps:
    - name: Wait for Deployment
      run: sleep 30
    
    - name: Health Check
      continue-on-error: true
      run: |
        MAX_RETRIES=5
        PROJECT_NAME="${{ github.event.repository.name }}"
        HEALTH_URL="https://${{ secrets.DEPLOY_SERVER }}/$PROJECT_NAME/health"
        
        for i in $(seq 1 $MAX_RETRIES); do
          HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_URL")
          
          if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
            echo "✅ Health-Check erfolgreich (HTTP $HTTP_CODE)"
            exit 0
          fi
          
          echo "⚠️ Health-Check fehlgeschlagen (HTTP $HTTP_CODE), warte 15s..."
          sleep 15
        done
        
        echo "❌ Health-Check nach $MAX_RETRIES Versuchen fehlgeschlagen"
        exit 1
```

### 13.5 Erforderliche GitHub Secrets

| Secret | Beschreibung | Pflicht |
|--------|-------------|---------|
| `STAGING_SERVER` | Staging Server Hostname/IP | ✅ Ja |
| `STAGING_SSH_KEY` | SSH Private Key für Staging | ✅ Ja |
| `PRODUCTION_SERVER` | Production Server Hostname/IP | ✅ Ja |
| `PRODUCTION_SSH_KEY` | SSH Private Key für Production | ✅ Ja |
| `GHCR_TOKEN` | GitHub Container Registry Token | ✅ Ja |

**VERALTET (bitte migrieren):**
- ❌ `DEPLOY_SERVER` → ✅ `STAGING_SERVER`
- ❌ `SSH_PRIVATE_KEY` → ✅ `STAGING_SSH_KEY` + `PRODUCTION_SSH_KEY`

**Setup in GitHub:**
1. Repository → Settings → Secrets and variables → Actions
2. "New repository secret" klicken
3. Secrets hinzufügen

### 13.6 Deployment-Strategie

| Trigger | Zielumgebung | Strategie |
|---------|--------------|-----------|
| Push zu `main` | Staging | Blue/Green |
| Release Tag `v*.*.*` | Production | Blue/Green |

**Wichtig:** Production verwendet **exakt gleiche Images** wie Staging (Build Once, Deploy Many).

### 13.7 Docker Labels für Traefik

> ⚠️ **WICHTIG:** Separate Docker Compose Dateien für Staging und Production!

**Staging:** `docker-compose.staging.yml` mit Basic Auth Middleware
**Production:** `docker-compose.production.yml` ohne Basic Auth

```yaml
# docker-compose.staging.yml
services:
  app:
    image: ghcr.io/gkeferstein/{app}-api:${VERSION:-main-latest}
    expose:
      - "3000"
    networks:
      - mojo-network
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=mojo-network"
      
      # Staging Route: {app}.staging.mojo-institut.de
      - "traefik.http.routers.{app}-staging.rule=Host(`{app}.staging.mojo-institut.de`)"
      - "traefik.http.routers.{app}-staging.entrypoints=websecure"
      - "traefik.http.routers.{app}-staging.tls.certresolver=letsencrypt"
      - "traefik.http.routers.{app}-staging.middlewares=staging-basicauth@file"
      - "traefik.http.services.{app}-staging.loadbalancer.server.port=3000"

networks:
  mojo-network:
    external: true
```

### 13.8 Image-Naming Konvention

**WICHTIG:** Das `deploy-blue-green.sh` Skript erwartet diese Image-Namen:

| Komponente | Image-Suffix | Beispiel |
|------------|--------------|----------|
| Backend API | `-api` | `ghcr.io/gkeferstein/payments.mojo-api:v1.0.0` |
| Admin Frontend | `-admin` | `ghcr.io/gkeferstein/payments.mojo-admin:v1.0.0` |
| Web Frontend | `-web` | `ghcr.io/gkeferstein/accounts.mojo-web:v1.0.0` |
| Landing Page | `-landing` | `ghcr.io/gkeferstein/payments.mojo-landing:v1.0.0` |

### 13.9 Version-Synchronisierung

Wenn `src/version.ts` existiert, muss sie mit `package.json` synchron sein:

```bash
# Automatische Synchronisierung
./scripts/sync-version.sh

# Oder in package.json:
{
  "scripts": {
    "prebuild": "./scripts/sync-version.sh"
  }
}
```

**Template:** `/root/projects/.project-template/scripts/sync-version.sh`

### 13.10 Wichtige Regeln

| ❌ VERBOTEN | ✅ RICHTIG |
|------------|-----------|
| Server-IPs im Code hardcoden | `secrets.STAGING_SERVER` / `secrets.PRODUCTION_SERVER` verwenden |
| SSH Keys committen | GitHub Secrets verwenden |
| Manuelles Deployment | CI/CD Pipeline nutzen |
| Ohne Health-Endpoint deployen | `/health` Endpoint implementieren |
| Production-Build in Release-Pipeline | Images aus Staging wiederverwenden (Build Once, Deploy Many) |
| `dev.*` Domain verwenden | `{app}.staging.mojo-institut.de` verwenden |
| Runtime-Dependencies in devDependencies | Alles was zur Runtime benötigt wird → `dependencies` |

### 13.11 Neues Projekt Setup

```bash
# 1. Projekt erstellen
/root/scripts/create-new-project.sh <projektname>

# 2. Docker Compose Dateien konfigurieren
#    - docker-compose.staging.yml
#    - docker-compose.production.yml

# 3. GitHub Secrets setzen
# → Repository Settings → Secrets:
#    - STAGING_SERVER
#    - STAGING_SSH_KEY
#    - PRODUCTION_SERVER
#    - PRODUCTION_SSH_KEY
#    - GHCR_TOKEN

# 4. Erster Push zu main (Staging Deployment)
git push origin main

# 5. Pipeline prüfen
# → GitHub Actions Tab

# 6. Production Release
git tag v1.0.0
git push origin v1.0.0
```

### 13.12 Health Check auf Staging (Basic Auth)

Staging ist mit Basic Auth geschützt. Health Checks akzeptieren HTTP 401:

```bash
# Im CI/CD Health Check
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Health Check erfolgreich"
elif [ "$HTTP_CODE" = "401" ]; then
  echo "✅ App läuft (Basic Auth aktiv)"
fi
```

---

## Changelog

| Version | Datum | Änderungen |
|---------|-------|-----------|
| 1.6.0 | 01.01.2026 | Sign-In/Sign-Up Standards hinzugefügt: Standard-Implementation, Redirect-Logik, Onboarding-Flows, Redirect-Loop Prävention, Debugging Checklist, Next.js Route Groups, ClerkProvider Konfiguration, JWT Clock Skew |
| 1.5.0 | 01.01.2026 | CI/CD komplett überarbeitet: Neue Secrets-Konvention, Image-Naming, Version-Sync, Health Checks für Basic Auth |
| 1.4.0 | 29.12.2025 | Service URLs konsolidiert, API-Pfade vereinheitlicht (ohne /v1), manage.mojo entfernt |
| 1.3.0 | 29.12.2025 | Design System & Navigation Standards hinzugefügt (design.mojo Integration) |
| 1.2.0 | 29.12.2025 | PORT.md entfernt - Traefik übernimmt Routing komplett |
| 1.1.0 | 29.12.2025 | Messaging Integration + CI/CD Pipeline Doku hinzugefügt |
| 1.0.0 | 29.12.2025 | Initial Release |

---

## Referenzen

- **Design System:** `/root/projects/design.mojo/`
- **Tenant Package:** `/root/projects/shared.mojo/packages/tenant/`
- **Messaging System:** `/root/projects/messaging.mojo/`
- **Project Template:** `/root/projects/.project-template/`
- **CI/CD Pipeline:** `/root/projects/.project-template/.github/workflows/ci-cd.yml`


