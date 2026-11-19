// ==============================================================================
// Studio Pixel SpA - Cloudflare Functions API
// Endpoint: /api/catalog
// Catálogo de aplicaciones SaaS y Ecosistemas Digitales
// ==============================================================================

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const categoryFilter = url.searchParams.get('category');
  const slugFilter = url.searchParams.get('slug');

  // Headers de respuesta estándar con soporte CORS
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'public, max-age=60, s-maxage=300'
  };

  try {
    // 1. Intentar consultar Cloudflare D1 si el binding 'sp_hub_db' está configurado
    if (env && env.sp_hub_db) {
      let query = 'SELECT * FROM apps_catalog';
      const params = [];

      if (slugFilter) {
        query += ' WHERE slug = ?';
        params.push(slugFilter);
      } else if (categoryFilter && categoryFilter !== 'Todas') {
        query += ' WHERE category = ?';
        params.push(categoryFilter);
      }

      query += ' ORDER BY sort_order ASC';

      const stmt = env.sp_hub_db.prepare(query);
      const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

      if (results && results.length > 0) {
        // Parsear features_json
        const formatted = results.map(app => {
          let features = [];
          try {
            features = typeof app.features_json === 'string' ? JSON.parse(app.features_json) : app.features_json;
          } catch (e) {
            features = [];
          }
          return {
            ...app,
            features
          };
        });

        return new Response(JSON.stringify({
          success: true,
          source: 'd1_database',
          count: formatted.length,
          data: formatted
        }), { status: 200, headers });
      }
    }
  } catch (dbError) {
    console.warn('[SP-HUB] Error al consultar D1, usando fallback integrado:', dbError.message);
  }

  // 2. Fallback JSON nativo de alta disponibilidad (Garantiza funcionamiento sin D1 local o en modo preview)
  const defaultCatalog = [
    {
      id: 'app_restaurapp_lite',
      slug: 'restaurapp-lite',
      name: 'Restaurapp Lite',
      category: 'Gastronomía',
      status: 'available',
      status_label: 'Disponible',
      status_color: 'turquoise',
      short_desc: 'Sistema integral de cartas digitales QR, recepción de pedidos en tiempo real para cocina/barra y control de stock instantáneo.',
      full_desc: 'Diseñado para restaurantes, bares, cafeterías y foodtrucks que buscan agilizar su atención sin pagar comisiones por venta. Incluye panel de pedidos en vivo para cocina, carta autogestionable con fotos y alergenos, y reportería de platos más rentables.',
      pricing_ref: '14 días gratis • Luego $19.990 + IVA/mes',
      monthly_price_clp: 19990,
      features: [
        'Carta digital QR sin límite de visitas',
        'Panel de cocina y barra en tiempo real (KDS)',
        'Cero comisiones por comanda o venta',
        'Control de disponibilidad y stock de platos',
        'Métricas instantáneas de platos estrella',
        'Despliegue bajo tu propio subdominio'
      ],
      demo_url: 'https://restaurapp.studiopixel.cl/cliente.html?local=demo&mesa=4',
      app_url: 'https://restaurapp.studiopixel.cl',
      onboarding_url: 'https://restaurapp.studiopixel.cl/onboarding.html',
      is_featured: 1,
      sort_order: 1
    },
    {
      id: 'app_sp_express',
      slug: 'sp-express',
      name: 'Studio Pixel Express',
      category: 'Comercio & IA',
      status: 'in_development',
      status_label: 'En Desarrollo',
      status_color: 'amber',
      short_desc: 'Estudio fotográfico hiperrealista con IA. Transforma fotos tomadas con celular en catálogos comerciales de alta conversión.',
      full_desc: 'Permite a marcas y tiendas de e-commerce generar composiciones de estudio profesional con modelos sintéticos, fondos personalizados y consistente calidad 4K en segundos, reduciendo hasta un 85% los costos de producción publicitaria.',
      pricing_ref: 'Próximamente • Acceso Beta Exclusivo',
      monthly_price_clp: 29990,
      features: [
        'Eliminación y reemplazo de fondos por IA',
        'Generación de modelos y ambientes de estudio',
        'Exportación optimizada para MercadoLibre y Shopify',
        'Procesamiento por lotes de hasta 200 fotos',
        'Resolución comercial ultra nítida 4K'
      ],
      demo_url: null,
      is_featured: 0,
      sort_order: 2
    },
    {
      id: 'app_sp_link_close',
      slug: 'sp-link-to-close',
      name: 'SP Link-to-Close',
      category: 'Gestión & Cobros',
      status: 'coming_soon',
      status_label: 'Próximamente',
      status_color: 'slate',
      short_desc: 'Cotizaciones ejecutivas interactivas con aceptación digital y pasarela de pago integrada en un solo enlace.',
      full_desc: 'Envía propuestas comerciales en un enlace personalizado donde el cliente puede seleccionar variantes de servicios, firmar digitalmente y pagar el anticipo al instante con Webpay, tarjeta o transferencia con conciliación automática.',
      pricing_ref: 'Próximamente • Lista de Espera Abierta',
      monthly_price_clp: 24990,
      features: [
        'Propuestas dinámicas con cálculo en tiempo real',
        'Aceptación y firma electrónica simple con validez legal',
        'Pasarela de pago Webpay / Stripe integrada',
        'Notificaciones de lectura y tiempo de visualización',
        'Exportación automática a PDF corporativo'
      ],
      demo_url: null,
      is_featured: 0,
      sort_order: 3
    },
    {
      id: 'app_sp_core',
      slug: 'sp-core',
      name: 'Ecosistemas a Medida (SP CORE)',
      category: 'Corporativo',
      status: 'enterprise',
      status_label: '100% Propiedad IP',
      status_color: 'blue',
      short_desc: '¿Tu empresa requiere una plataforma exclusiva, sin suscripciones perpetuas y con código fuente propio?',
      full_desc: 'Desarrollamos ecosistemas de software a medida bajo metodología Serverless y arquitectura Edge Cloudflare. El código fuente, la infraestructura y los derechos de propiedad intelectual se transfieren 100% a tu empresa.',
      pricing_ref: 'Cotización por Proyecto • Propiedad Definitiva',
      monthly_price_clp: 0,
      features: [
        'Arquitectura Cloudflare Edge & Serverless de alta escala',
        'Código fuente y derechos transferidos 100% a tu empresa',
        'Sin pagos recurrentes obligatorios de licencias',
        'Integración con ERPs (SAP, Defontana, Softland, etc.)',
        'SLA y soporte de nivel corporativo prioritario'
      ],
      demo_url: 'https://studiopixel.cl',
      is_featured: 1,
      sort_order: 4
    }
  ];

  let filtered = defaultCatalog;
  if (slugFilter) {
    filtered = defaultCatalog.filter(app => app.slug === slugFilter);
  } else if (categoryFilter && categoryFilter !== 'Todas') {
    filtered = defaultCatalog.filter(app => app.category.toLowerCase() === categoryFilter.toLowerCase());
  }

  return new Response(JSON.stringify({
    success: true,
    source: 'fallback_native_json',
    count: filtered.length,
    data: filtered
  }), { status: 200, headers });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
