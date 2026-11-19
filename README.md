# Studio Pixel App Hub (`app.studiopixel.cl`)

> **Hub Central y Catálogo de Aplicaciones SaaS de Studio Pixel SpA**  
> Diseñado bajo arquitectura Edge Serverless en Cloudflare Pages, Cloudflare Functions y Cloudflare D1.

---

## 🏛️ Arquitectura del Sistema

```
appStudioPixel/
├── wrangler.toml               # Configuración de Cloudflare Pages / Workers y D1
├── schema.sql                  # Esquema D1 (organizations, users, apps_catalog, subscriptions, waitlist)
├── package.json                # Scripts y tooling local
├── public/                     # Frontend estático ultra ligero (sin frameworks pesados)
│   ├── index.html              # Catálogo principal y landing interactiva
│   ├── dashboard.html          # Consola cliente "Mis Ecosistemas Activos"
│   └── assets/
│       ├── css/
│       │   └── styles.css      # Sistema de diseño de Studio Pixel (Glassmorphism, glow, tokens)
│       └── js/
│           └── app.js          # Lógica reactiva de catálogo, filtros, modales, demo KDS y sesión
└── functions/                  # Cloudflare Pages Functions (Edge API)
    └── api/
        ├── catalog.js          # Endpoint GET /api/catalog (D1 + fallback JSON)
        └── auth.js             # Endpoint POST /api/auth (Login, registro, waitlist)
```

---

## 🎨 Identidad Visual y Paleta Corporativa

- **Fondo Principal:** `#060B14` y `#0A192F` con gradiente radial y grilla técnica sutil.
- **Superficies y Tarjetas:** `#0F172A` con borde `1px solid rgba(255, 255, 255, 0.08)` y hover turquesa `rgba(0, 196, 181, 0.4)`.
- **Acento Primario:** `#00C4B5` (Turquesa Studio Pixel) con hover `#00A89B`.
- **Tipografía:** `Inter` (Google Fonts), títulos en `#FFFFFF` ExtraBold/Black y descripciones en gris pizarra `#94A3B8`.
- **Iconografía:** Lucide Icons (CDN lineal minimalista).

---

## 🚀 Despliegue y Ejecución Local

### 1. Pruebas Locales Inmediatas (con Wrangler y Functions)

```bash
# Iniciar servidor de desarrollo de Cloudflare Pages
npx wrangler pages dev public
```

### 2. Inicialización de Base de Datos Cloudflare D1

Para crear y vincular la base de datos localmente:

```bash
# Ejecutar esquema y datos semilla en SQLite local
npx wrangler d1 execute sp_hub_db --local --file=./schema.sql

# Iniciar servidor con binding D1 activo
npx wrangler pages dev public --d1=sp_hub_db
```

Para crear y aplicar en producción:

```bash
# 1. Crear base de datos en Cloudflare
npx wrangler d1 create sp_hub_db

# 2. Copiar el database_id obtenido y pegarlo en wrangler.toml
# 3. Aplicar migraciones / esquema en la nube
npx wrangler d1 execute sp_hub_db --remote --file=./schema.sql
```

### 3. Despliegue a Producción (Cloudflare Pages)

```bash
npx wrangler pages deploy public --project-name=sp-app-hub
```

---

## 🔐 Cuentas de Demostración Preconfiguradas

Para pruebas inmediatas sin necesidad de crear cuentas nuevas:
- **Email:** `gerencia@laterraza.cl`
- **Empresa:** Bistró La Terraza SpA
- **App Activa:** `Restaurapp Lite` (Subdominio: `laterraza.restaurapp.cl`)
- También disponible el botón directo **"Acceder con Cuenta de Prueba Demo"** en el modal de Studio Pixel ID.

---

## 🏢 Studio Pixel SpA
*Ingeniería de Software & Ecosistemas Digitales*  
Santiago, Chile • [studiopixel.cl](https://studiopixel.cl)
