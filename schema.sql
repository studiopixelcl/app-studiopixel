-- ==============================================================================
-- Studio Pixel SpA - Cloudflare D1 Database Schema
-- Base de datos: sp_hub_db
-- Hub Central y Catálogo de Aplicaciones SaaS (app.studiopixel.cl)
-- ==============================================================================

-- 1. TABLA: ORGANIZACIONES / EMPRESAS CLIENTE
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    rut TEXT,
    contact_email TEXT NOT NULL UNIQUE,
    contact_phone TEXT,
    industry TEXT DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: USUARIOS (Studio Pixel ID)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin', -- 'superadmin', 'admin', 'operator', 'viewer'
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- 3. TABLA: CATÁLOGO DE APLICACIONES SAAS
CREATE TABLE IF NOT EXISTS apps_catalog (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Gastronomía', 'Comercio & IA', 'Gestión & Cobros', 'Corporativo'
    status TEXT NOT NULL, -- 'available', 'in_development', 'coming_soon', 'enterprise'
    status_label TEXT NOT NULL, -- 'Disponible', 'En Desarrollo', 'Próximamente', '100% Propiedad IP'
    status_color TEXT DEFAULT 'turquoise', -- 'turquoise', 'amber', 'slate', 'blue'
    short_desc TEXT NOT NULL,
    full_desc TEXT,
    pricing_ref TEXT NOT NULL,
    monthly_price_clp INTEGER DEFAULT 0,
    features_json TEXT NOT NULL, -- JSON array de strings o perks
    demo_url TEXT,
    is_featured INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: SUSCRIPCIONES Y ECOSISTEMAS ACTIVOS DE CLIENTES
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    app_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'trial', -- 'trial', 'active', 'suspended', 'cancelled'
    subdomain_assigned TEXT, -- ej: gourmetbar.restaurapp.cl
    trial_starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trial_ends_at TIMESTAMP,
    current_period_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP,
    auto_renew INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES apps_catalog(id) ON DELETE CASCADE
);

-- 5. TABLA: LISTA DE ESPERA VIP (EARLY ACCESS)
CREATE TABLE IF NOT EXISTS waitlist (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    app_slug TEXT NOT NULL,
    full_name TEXT,
    company_name TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified INTEGER DEFAULT 0
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps_catalog(category);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps_catalog(status);
CREATE INDEX IF NOT EXISTS idx_subs_org ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_app ON waitlist(app_slug, email);

-- ==============================================================================
-- DATOS SEMILLA INICIALES (SEED DATA)
-- ==============================================================================

-- Apps del Catálogo Oficial Studio Pixel
INSERT OR IGNORE INTO apps_catalog (
    id, slug, name, category, status, status_label, status_color, 
    short_desc, full_desc, pricing_ref, monthly_price_clp, 
    features_json, demo_url, is_featured, sort_order
) VALUES 
(
    'app_restaurapp_lite',
    'restaurapp-lite',
    'Restaurapp Lite',
    'Gastronomía',
    'available',
    'Disponible',
    'turquoise',
    'Sistema integral de cartas digitales QR, recepción de pedidos en tiempo real para cocina/barra y control de stock instantáneo.',
    'Diseñado para restaurantes, bares, cafeterías y foodtrucks que buscan agilizar su atención sin pagar comisiones por venta. Incluye panel de pedidos en vivo para cocina, carta autogestionable con fotos y alergenos, y reportería de platos más rentables.',
    '14 días gratis • Luego $19.990 + IVA/mes',
    19990,
    '["Carta digital QR sin límite de visitas", "Panel de cocina y barra en tiempo real (KDS)", "Cero comisiones por comanda o venta", "Control de disponibilidad y stock de platos", "Métricas instantáneas de platos estrella", "Despliegue bajo tu propio subdominio"]',
    'https://restaurapp.studiopixel.cl/cliente?local=demo&mesa=4',
    1,
    1
),
(
    'app_sp_express',
    'sp-express',
    'Studio Pixel Express',
    'Comercio & IA',
    'in_development',
    'En Desarrollo',
    'amber',
    'Estudio fotográfico hiperrealista con IA. Transforma fotos tomadas con celular en catálogos comerciales de alta conversión.',
    'Permite a marcas y tiendas de e-commerce generar composiciones de estudio profesional con modelos sintéticos, fondos personalizados y consistente calidad 4K en segundos, reduciendo hasta un 85% los costos de producción publicitaria.',
    'Próximamente • Acceso Beta Exclusivo',
    29990,
    '["Eliminación y reemplazo de fondos por IA", "Generación de modelos y ambientes de estudio", "Exportación optimizada para MercadoLibre y Shopify", "Procesamiento por lotes de hasta 200 fotos", "Resolución comercial ultra nítida 4K"]',
    NULL,
    0,
    2
),
(
    'app_sp_link_close',
    'sp-link-to-close',
    'SP Link-to-Close',
    'Gestión & Cobros',
    'coming_soon',
    'Próximamente',
    'slate',
    'Cotizaciones ejecutivas interactivas con aceptación digital y pasarela de pago integrada en un solo enlace.',
    'Envía propuestas comerciales en un enlace personalizado donde el cliente puede seleccionar variantes de servicios, firmar digitalmente y pagar el anticipo al instante con Webpay, tarjeta o transferencia con conciliación automática.',
    'Próximamente • Lista de Espera Abierta',
    24990,
    '["Propuestas dinámicas con cálculo en tiempo real", "Aceptación y firma electrónica simple con validez legal", "Pasarela de pago Webpay / Stripe integrada", "Notificaciones de lectura y tiempo de visualización", "Exportación automática a PDF corporativo"]',
    NULL,
    0,
    3
),
(
    'app_sp_core',
    'sp-core',
    'Ecosistemas a Medida (SP CORE)',
    'Corporativo',
    'enterprise',
    '100% Propiedad IP',
    'blue',
    '¿Tu empresa requiere una plataforma exclusiva, sin suscripciones perpetuas y con código fuente propio?',
    'Desarrollamos ecosistemas de software a medida bajo metodología Serverless y arquitectura Edge Cloudflare. El código fuente, la infraestructura y los derechos de propiedad intelectual se transfieren 100% a tu empresa.',
    'Cotización por Proyecto • Propiedad Definitiva',
    0,
    '["Arquitectura Cloudflare Edge & Serverless de alta escala", "Código fuente y derechos transferidos 100% a tu empresa", "Sin pagos recurrentes obligatorios de licencias", "Integración con ERPs (SAP, Defontana, Softland, etc.)", "SLA y soporte de nivel corporativo prioritario"]',
    'https://studiopixel.cl',
    1,
    4
);

-- Organización y usuario de muestra para pruebas locales
INSERT OR IGNORE INTO organizations (id, name, slug, rut, contact_email, contact_phone, industry)
VALUES (
    'org_demo_001',
    'Bistró La Terraza SpA',
    'bistro-la-terraza',
    '76.543.210-9',
    'gerencia@laterraza.cl',
    '+56 9 8765 4321',
    'Gastronomía y Eventos'
);

INSERT OR IGNORE INTO users (id, org_id, email, password_hash, full_name, role)
VALUES (
    'usr_demo_001',
    'org_demo_001',
    'gerencia@laterraza.cl',
    'sha256_mock_hash_sp_2026',
    'Martín Silva Cruz',
    'admin'
);

-- Suscripción activa de muestra en Restaurapp Lite
INSERT OR IGNORE INTO subscriptions (
    id, org_id, app_id, status, subdomain_assigned, 
    trial_starts_at, trial_ends_at, current_period_start, current_period_end
) VALUES (
    'sub_demo_001',
    'org_demo_001',
    'app_restaurapp_lite',
    'trial',
    'laterraza.restaurapp.cl',
    CURRENT_TIMESTAMP,
    DATETIME('now', '+14 days'),
    CURRENT_TIMESTAMP,
    DATETIME('now', '+30 days')
);
