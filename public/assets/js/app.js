/**
 * ==============================================================================
 * Studio Pixel SpA - Core Client Application
 * Subdominio: app.studiopixel.cl
 * Manejo de Catálogo, Modales, Autenticación y Simulador Demo
 * ==============================================================================
 */

// Estado global de la aplicación cliente
const AppState = {
  catalog: [],
  activeCategory: 'Todas',
  searchQuery: '',
  selectedAppForAction: null,
  currentUser: null
};

// Datos maestros de fallback para el catálogo (en caso de apertura estática local directa)
const LOCAL_FALLBACK_CATALOG = [
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
    demo_url: 'https://restaurapp.studiopixel.cl/cliente?local=demo&mesa=4',
    app_url: 'https://restaurapp.studiopixel.cl',
    onboarding_url: 'https://restaurapp.studiopixel.cl/onboarding',
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

// ==============================================================================
// INICIALIZACIÓN Y EVENT LISTENERS
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initSession();
  initCatalog();
  setupEventListeners();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// ==============================================================================
// GESTIÓN DE SESIÓN
// ==============================================================================
function initSession() {
  const storedUser = localStorage.getItem('sp_auth_user');
  if (storedUser) {
    try {
      AppState.currentUser = JSON.parse(storedUser);
      updateNavbarSession(AppState.currentUser);
    } catch (e) {
      localStorage.removeItem('sp_auth_user');
    }
  }
}

function updateNavbarSession(user) {
  const authContainer = document.getElementById('navbar-auth-actions');
  if (!authContainer) return;

  if (user) {
    const orgName = (user.organization && user.organization.name) ? user.organization.name : 'Mi Empresa';
    authContainer.innerHTML = `
      <div class="flex items-center gap-3">
        <a href="dashboard" class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>${orgName}</span>
        </a>
        <a href="dashboard" class="btn-primary text-xs py-2 px-3.5">
          <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
          <span>Mi Consola</span>
        </a>
        <button onclick="handleLogout()" class="p-2 text-slate-400 hover:text-white transition-colors" title="Cerrar sesión">
          <i data-lucide="log-out" class="w-4 h-4"></i>
        </button>
      </div>
    `;
  } else {
    authContainer.innerHTML = `
      <button onclick="openAuthModal('login')" class="btn-secondary text-xs py-2 px-3.5">
        <i data-lucide="lock" class="w-3.5 h-3.5"></i>
        <span>Iniciar Sesión</span>
      </button>
      <button onclick="openAuthModal('register')" class="btn-primary text-xs py-2 px-4">
        <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
        <span>Crear Cuenta Gratis</span>
      </button>
    `;
  }
  if (window.lucide) window.lucide.createIcons();
}

function handleLogout() {
  localStorage.removeItem('sp_auth_user');
  localStorage.removeItem('sp_auth_token');
  AppState.currentUser = null;
  showToast('Has cerrado sesión correctamente.', 'info');
  updateNavbarSession(null);
  if (window.location.pathname.includes('dashboard')) {
    window.location.href = 'index.html';
  }
}

// ==============================================================================
// CARGA Y RENDERIZADO DEL CATÁLOGO
// ==============================================================================
async function initCatalog() {
  const gridContainer = document.getElementById('catalog-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = `
    <div class="col-span-full py-16 text-center text-slate-400">
      <div class="inline-block animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mb-3"></div>
      <p class="text-sm">Conectando con el catálogo de Studio Pixel...</p>
    </div>
  `;

  try {
    const res = await fetch('/api/catalog');
    if (res.ok) {
      const data = await res.json();
      AppState.catalog = data.data && data.data.length > 0 ? data.data : LOCAL_FALLBACK_CATALOG;
    } else {
      AppState.catalog = LOCAL_FALLBACK_CATALOG;
    }
  } catch (err) {
    // Modo estático offline o sin servidor Cloudflare Functions activo
    AppState.catalog = LOCAL_FALLBACK_CATALOG;
  }

  renderCatalog();
}

function renderCatalog() {
  const gridContainer = document.getElementById('catalog-grid');
  if (!gridContainer) return;

  const filtered = AppState.catalog.filter(app => {
    const normCategory = AppState.activeCategory.toLowerCase();
    const appCategory = app.category.toLowerCase();
    const matchesCategory = normCategory === 'todas' || 
      appCategory.includes(normCategory) || 
      normCategory.includes(appCategory);

    const matchesSearch = !AppState.searchQuery || 
      app.name.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      app.short_desc.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(AppState.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 bg-[#0D131F] rounded-xl border border-slate-800 p-8">
        <i data-lucide="search-x" class="w-10 h-10 mx-auto text-slate-600 mb-2.5"></i>
        <h4 class="text-white font-bold text-base mb-1">No se encontraron aplicaciones</h4>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">No hay resultados para tu criterio de búsqueda en la categoría "${AppState.activeCategory}". Intenta con otros términos.</p>
        <button onclick="resetFilters()" class="mt-4 btn-secondary text-xs py-1.5 px-3">Restablecer Filtros</button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  gridContainer.innerHTML = filtered.map(app => generateAppCardHTML(app)).join('');
  if (window.lucide) window.lucide.createIcons();
}

function generateAppCardHTML(app) {
  const isAvailable = app.status === 'available';
  const cardClass = isAvailable ? 'app-card card-available p-6' : 'app-card p-6';

  // Badge minimalista de estado
  let badgeHTML = '';
  if (isAvailable) {
    badgeHTML = `
      <span class="badge-clean badge-clean-available">
        <span class="status-dot-active"></span>
        <span>Disponible</span>
      </span>
    `;
  } else if (app.status === 'in_development') {
    badgeHTML = `
      <span class="badge-clean">
        <span class="status-dot-neutral"></span>
        <span>En Desarrollo</span>
      </span>
    `;
  } else if (app.status === 'coming_soon') {
    badgeHTML = `
      <span class="badge-clean">
        <span class="status-dot-neutral"></span>
        <span>Próximamente</span>
      </span>
    `;
  } else {
    badgeHTML = `
      <span class="badge-clean">
        <span class="status-dot-neutral"></span>
        <span>A Medida</span>
      </span>
    `;
  }

  // Icono según categoría
  let iconName = 'layout-grid';
  if (app.category.toLowerCase().includes('gastro')) iconName = 'utensils';
  else if (app.category.toLowerCase().includes('ia') || app.category.toLowerCase().includes('comercio')) iconName = 'camera';
  else if (app.category.toLowerCase().includes('cobro') || app.category.toLowerCase().includes('gesti')) iconName = 'file-check';
  else if (app.category.toLowerCase().includes('corporativo')) iconName = 'layers';

  // 2 Etiquetas clave discretas
  let keyTags = [];
  if (app.slug === 'restaurapp-lite') {
    keyTags = ['Carta QR Dinámica', 'Pedidos Tiempo Real'];
  } else if (app.slug === 'sp-express') {
    keyTags = ['Renderizado IA 4K', 'Catálogos E-commerce'];
  } else if (app.slug === 'sp-link-to-close') {
    keyTags = ['Cotizaciones Dinámicas', 'Firma + Pago Webpay'];
  } else if (app.slug === 'sp-core') {
    keyTags = ['Código Fuente Propio', 'Arquitectura Serverless'];
  } else if (app.features && app.features.length >= 2) {
    keyTags = [app.features[0], app.features[1]];
  }

  const tagsHTML = keyTags.map(tag => `<span class="feature-tag">${tag}</span>`).join('');

  // Precio a la izquierda del footer
  let priceHTML = '';
  if (isAvailable) {
    priceHTML = `
      <div class="flex flex-col">
        <div class="text-sm font-semibold text-white leading-tight">$19.990 <span class="text-xs font-normal text-slate-400">/mes</span></div>
        <div class="text-[11px] text-slate-500 leading-tight">14 días gratis</div>
      </div>
    `;
  } else if (app.status === 'enterprise') {
    priceHTML = `
      <div class="flex flex-col">
        <div class="text-sm font-medium text-slate-300 leading-tight">Propiedad definitiva</div>
        <div class="text-[11px] text-slate-500 leading-tight">Sin suscripción</div>
      </div>
    `;
  } else {
    priceHTML = `
      <div class="flex flex-col">
        <div class="text-sm font-medium text-slate-300 leading-tight">Próximo lanzamiento</div>
        <div class="text-[11px] text-slate-500 leading-tight">Acceso prioritario</div>
      </div>
    `;
  }

  // Botones a la derecha del footer
  let buttonsHTML = '';
  if (isAvailable) {
    if (app.slug === 'restaurapp-lite') {
      buttonsHTML = `
        <div class="flex items-center gap-1.5">
          <a href="https://restaurapp.studiopixel.cl/cliente?local=demo&mesa=4" target="_blank" rel="noopener noreferrer" class="btn-ghost" title="Ver carta demo en vivo">
            <span>Ver Demo</span>
            <i data-lucide="arrow-up-right" class="w-3 h-3 text-slate-500"></i>
          </a>
          <a href="https://restaurapp.studiopixel.cl/onboarding" target="_blank" rel="noopener noreferrer" class="btn-primary" title="Comenzar prueba gratis de 14 días">
            <span>Probar Gratis</span>
          </a>
        </div>
      `;
    } else {
      buttonsHTML = `
        <div class="flex items-center gap-1.5">
          <button onclick="openDemoPreview('${app.slug}')" class="btn-ghost">
            <span>Ver Demo</span>
          </button>
          <button onclick="handleStartTrial('${app.slug}', '${app.name}')" class="btn-primary">
            <span>Probar Gratis</span>
          </button>
        </div>
      `;
    }
  } else if (app.status === 'enterprise') {
    buttonsHTML = `
      <a href="https://studiopixel.cl" target="_blank" rel="noopener noreferrer" class="btn-secondary">
        <span>Cotizar Proyecto</span>
        <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 text-slate-400"></i>
      </a>
    `;
  } else {
    buttonsHTML = `
      <button onclick="openWaitlistModal('${app.slug}', '${app.name}')" class="btn-secondary">
        <span>Notificarme</span>
      </button>
    `;
  }

  return `
    <div class="${cardClass}">
      <div>
        <!-- Fila Superior: Icono a la izquierda + Badge a la derecha -->
        <div class="flex items-center justify-between mb-4">
          <div class="app-icon-box">
            <i data-lucide="${iconName}" class="w-4 h-4"></i>
          </div>
          ${badgeHTML}
        </div>

        <!-- Cuerpo: Título + Descripción completa de 2-3 líneas + 2 Tags -->
        <h3 class="text-xl font-bold text-white mb-2 leading-snug">
          ${app.name}
        </h3>

        <p class="text-sm text-slate-400 mb-4 leading-relaxed">
          ${app.short_desc}
        </p>

        <div class="flex items-center gap-2 mb-6">
          ${tagsHTML}
        </div>
      </div>

      <!-- Footer de Tarjeta: Precio izquierda + Botones derecha -->
      <div class="pt-4 mt-auto border-t border-slate-800/80 flex items-center justify-between gap-3">
        ${priceHTML}
        ${buttonsHTML}
      </div>
    </div>
  `;
}

// ==============================================================================
// FILTROS Y EVENTOS DE BÚSQUEDA
// ==============================================================================
function setupEventListeners() {
  // Filtros de categoría
  const categoryChips = document.querySelectorAll('.filter-chip');
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      AppState.activeCategory = chip.getAttribute('data-category') || 'Todas';
      renderCatalog();
    });
  });

  // Búsqueda instantánea
  const searchInput = document.getElementById('search-apps-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.trim();
      renderCatalog();
    });
  }

  // Cerrar modales con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Listener para backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeAllModals();
      }
    });
  });
}

function resetFilters() {
  AppState.activeCategory = 'Todas';
  AppState.searchQuery = '';
  const searchInput = document.getElementById('search-apps-input');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.filter-chip').forEach(c => {
    if (c.getAttribute('data-category') === 'Todas') c.classList.add('active');
    else c.classList.remove('active');
  });
  renderCatalog();
}

// ==============================================================================
// GESTIÓN DE MODALES (Studio Pixel ID, Demo y Waitlist)
// ==============================================================================
function openAuthModal(mode = 'register', preselectedApp = null) {
  const modal = document.getElementById('modal-auth');
  if (!modal) return;

  AppState.selectedAppForAction = preselectedApp;

  // Cambiar pestaña activa
  switchAuthTab(mode);

  // Mostrar mensaje de contexto si viene desde una app
  const contextBadge = document.getElementById('auth-modal-app-badge');
  if (contextBadge) {
    if (preselectedApp) {
      contextBadge.classList.remove('hidden');
      contextBadge.innerHTML = `
        <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
        <span>Activando: <strong>${preselectedApp}</strong> (14 días gratis)</span>
      `;
    } else {
      contextBadge.classList.add('hidden');
    }
  }

  modal.classList.add('active');
  if (window.lucide) window.lucide.createIcons();
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const tabLoginBtn = document.getElementById('tab-btn-login');
  const tabRegisterBtn = document.getElementById('tab-btn-register');

  if (tab === 'login') {
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (tabLoginBtn) {
      tabLoginBtn.classList.add('text-emerald-400', 'border-b-2', 'border-emerald-400');
      tabLoginBtn.classList.remove('text-slate-400');
    }
    if (tabRegisterBtn) {
      tabRegisterBtn.classList.remove('text-emerald-400', 'border-b-2', 'border-emerald-400');
      tabRegisterBtn.classList.add('text-slate-400');
    }
  } else {
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
    if (tabRegisterBtn) {
      tabRegisterBtn.classList.add('text-emerald-400', 'border-b-2', 'border-emerald-400');
      tabRegisterBtn.classList.remove('text-slate-400');
    }
    if (tabLoginBtn) {
      tabLoginBtn.classList.remove('text-emerald-400', 'border-b-2', 'border-emerald-400');
      tabLoginBtn.classList.add('text-slate-400');
    }
  }
}

function handleStartTrial(slug, name) {
  if (slug === 'restaurapp-lite') {
    window.location.href = 'https://restaurapp.studiopixel.cl/onboarding';
    return;
  }
  // Si ya tiene sesión, redirigir directo al dashboard para activar o mostrar
  if (AppState.currentUser) {
    showToast(`Iniciando activación de ${name}...`, 'info');
    setTimeout(() => {
      window.location.href = `dashboard?activate=${slug}`;
    }, 600);
    return;
  }
  openAuthModal('register', name);
}

function openWaitlistModal(slug, name) {
  const modal = document.getElementById('modal-waitlist');
  if (!modal) return;

  const titleEl = document.getElementById('waitlist-app-title');
  const slugInput = document.getElementById('waitlist-app-slug');

  if (titleEl) titleEl.innerText = name;
  if (slugInput) slugInput.value = slug;

  modal.classList.add('active');
  if (window.lucide) window.lucide.createIcons();
}

function openDemoPreview(slug) {
  if (slug === 'restaurapp-lite') {
    window.open('https://restaurapp.studiopixel.cl/cliente?local=demo&mesa=4', '_blank');
    return;
  }
  const modal = document.getElementById('modal-demo-preview');
  if (!modal) return;

  // Cargar simulador según app
  renderRestaurappDemoSimulator();
  modal.classList.add('active');
  if (window.lucide) window.lucide.createIcons();
}

function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.classList.remove('active');
  });
}

// ==============================================================================
// FORMULARIO DE AUTENTICACIÓN (LOGIN / REGISTRO)
// ==============================================================================
async function handleLoginFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!email || !password) {
    showToast('Por favor ingresa tu email y contraseña.', 'error');
    return;
  }

  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="inline-block animate-spin w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full"></span>
    <span>Verificando...</span>
  `;

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('sp_auth_user', JSON.stringify(data.user));
      if (data.token) localStorage.setItem('sp_auth_token', data.token);
      if (data.subscriptions) localStorage.setItem('sp_auth_subs', JSON.stringify(data.subscriptions));

      AppState.currentUser = data.user;
      showToast('¡Bienvenido a Studio Pixel ID!', 'success');
      closeAllModals();
      updateNavbarSession(data.user);

      setTimeout(() => {
        window.location.href = 'dashboard';
      }, 700);
    } else {
      showToast(data.error || 'Credenciales inválidas.', 'error');
    }
  } catch (err) {
    // Modo simulación local si el backend no está disponible
    const mockUser = {
      id: 'usr_demo_direct',
      email,
      fullName: email.split('@')[0].toUpperCase(),
      role: 'admin',
      organization: {
        id: 'org_demo_local',
        name: 'Mi Empresa SpA',
        slug: 'mi-empresa',
        rut: '76.999.888-1'
      }
    };
    localStorage.setItem('sp_auth_user', JSON.stringify(mockUser));
    AppState.currentUser = mockUser;
    showToast('Sesión iniciada (Modo Local).', 'success');
    closeAllModals();
    setTimeout(() => {
      window.location.href = 'dashboard';
    }, 600);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

async function handleRegisterFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const fullName = form.fullName.value.trim();
  const companyName = form.companyName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const rut = form.rut ? form.rut.value.trim() : '';
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!fullName || !companyName || !email || !password) {
    showToast('Por favor completa todos los campos requeridos.', 'error');
    return;
  }

  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="inline-block animate-spin w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full"></span>
    <span>Aprovisionando ecosistema...</span>
  `;

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        fullName,
        companyName,
        email,
        password,
        rut,
        selectedAppSlug: 'restaurapp-lite'
      })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('sp_auth_user', JSON.stringify(data.user));
      if (data.token) localStorage.setItem('sp_auth_token', data.token);
      if (data.subscriptions) localStorage.setItem('sp_auth_subs', JSON.stringify(data.subscriptions));

      AppState.currentUser = data.user;
      showToast('¡Cuenta creada! Redirigiendo a tu consola...', 'success');
      closeAllModals();

      setTimeout(() => {
        window.location.href = 'dashboard?new=1';
      }, 800);
    } else {
      showToast(data.error || 'Error al registrar.', 'error');
    }
  } catch (err) {
    // Fallback simulación local
    const mockUser = {
      id: 'usr_new_reg',
      email,
      fullName,
      role: 'admin',
      organization: {
        id: 'org_' + Date.now(),
        name: companyName,
        slug: companyName.toLowerCase().replace(/\s+/g, '-'),
        rut: rut || '77.123.456-K'
      }
    };
    const mockSubs = [
      {
        id: 'sub_' + Date.now(),
        app_name: 'Restaurapp Lite',
        app_slug: 'restaurapp-lite',
        category: 'Gastronomía',
        status: 'trial',
        subdomain_assigned: `${companyName.toLowerCase().replace(/\s+/g, '')}.restaurapp.cl`,
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        pricing_ref: '14 días gratis • Luego $19.990 + IVA/mes'
      }
    ];

    localStorage.setItem('sp_auth_user', JSON.stringify(mockUser));
    localStorage.setItem('sp_auth_subs', JSON.stringify(mockSubs));
    AppState.currentUser = mockUser;

    showToast('Ecosistema aprovisionado con éxito.', 'success');
    closeAllModals();
    setTimeout(() => {
      window.location.href = 'dashboard?new=1';
    }, 700);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// Iniciar sesión con cuenta demo rápida
function loginAsDemoUser() {
  const demoUser = {
    id: 'usr_demo_001',
    email: 'gerencia@laterraza.cl',
    fullName: 'Martín Silva Cruz',
    role: 'admin',
    organization: {
      id: 'org_demo_001',
      name: 'Bistró La Terraza SpA',
      slug: 'bistro-la-terraza',
      rut: '76.543.210-9'
    }
  };
  const demoSubs = [
    {
      id: 'sub_demo_001',
      app_name: 'Restaurapp Lite',
      app_slug: 'restaurapp-lite',
      category: 'Gastronomía',
      status: 'trial',
      subdomain_assigned: 'laterraza.restaurapp.cl',
      trial_ends_at: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      pricing_ref: '14 días gratis • Luego $19.990 + IVA/mes'
    }
  ];

  localStorage.setItem('sp_auth_user', JSON.stringify(demoUser));
  localStorage.setItem('sp_auth_subs', JSON.stringify(demoSubs));
  AppState.currentUser = demoUser;
  showToast('Accediendo como Bistró La Terraza SpA...', 'success');
  closeAllModals();
  setTimeout(() => {
    window.location.href = 'dashboard';
  }, 500);
}

// Enviar formulario de lista de espera
async function handleWaitlistSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const fullName = form.fullName ? form.fullName.value.trim() : '';
  const companyName = form.companyName ? form.companyName.value.trim() : '';
  const appSlug = form.appSlug.value;

  try {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'waitlist', email, fullName, companyName, appSlug })
    });
  } catch (e) {
    // silencioso para modo estático
  }

  showToast(`¡Listo! Te avisaremos prioritariamente al lanzar este ecosistema.`, 'success');
  form.reset();
  closeAllModals();
}

// ==============================================================================
// SIMULADOR INTERACTIVO RESTAURAPP LITE (DEMO MODAL)
// ==============================================================================
function renderRestaurappDemoSimulator() {
  const container = document.getElementById('demo-simulator-container');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-slate-950 rounded-xl border border-slate-800 p-4 mb-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="text-xs font-bold text-white uppercase tracking-wider">Restaurapp KDS • Cocina y Barra en Vivo</span>
        </div>
        <span class="text-[11px] text-slate-400 font-mono">restaurapp.studiopixel.cl</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Ticket 1 -->
        <div class="kds-ticket p-3 bg-slate-900/90 rounded-lg border-l-4 border-emerald-400">
          <div class="flex justify-between items-center text-xs font-bold text-white mb-1">
            <span>Mesa 04 (Salón Principal)</span>
            <span class="text-emerald-400 font-mono">Hace 2m</span>
          </div>
          <p class="text-[11px] text-slate-400 mb-2">Pedido #108 • Camarero: QR Autoservicio</p>
          <div class="space-y-1 text-xs text-slate-200">
            <div class="flex justify-between">
              <span>1x Hamburguesa Trufa Smash</span>
              <span class="text-slate-400">Término 3/4</span>
            </div>
            <div class="flex justify-between">
              <span>1x Papas Rústicas con Romero</span>
              <span class="text-emerald-400 text-[10px]">Sin sal extra</span>
            </div>
            <div class="flex justify-between">
              <span>1x Cerveza Artesanal IPA 500cc</span>
              <span class="text-slate-400">Bien fría</span>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
            <span class="text-[10px] text-amber-400 font-semibold">● En Preparación</span>
            <button onclick="markTicketReady(this)" class="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-semibold rounded border border-emerald-500/30">
              Despachar Platos
            </button>
          </div>
        </div>

        <!-- Ticket 2 -->
        <div class="kds-ticket p-3 bg-slate-900/90 rounded-lg border-l-4 border-amber-400">
          <div class="flex justify-between items-center text-xs font-bold text-white mb-1">
            <span>Mesa 12 (Terraza)</span>
            <span class="text-amber-400 font-mono">Hace 6m</span>
          </div>
          <p class="text-[11px] text-slate-400 mb-2">Pedido #107 • Camarero: Rodrigo M.</p>
          <div class="space-y-1 text-xs text-slate-200">
            <div class="flex justify-between">
              <span>2x Risotto de Hongos Silvestres</span>
              <span class="text-slate-400">Estándar</span>
            </div>
            <div class="flex justify-between">
              <span>1x Botella Carménère Reserva</span>
              <span class="text-slate-400">Descorche listo</span>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
            <span class="text-[10px] text-emerald-400 font-semibold">✓ Listo para Servir</span>
            <button class="px-2 py-1 bg-slate-800 text-slate-400 text-[11px] font-semibold rounded cursor-default">
              Completado
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 class="text-white font-bold text-sm mb-0.5">¿Quieres implementar Restaurapp Lite en tu local?</h4>
        <p class="text-xs text-slate-400">Despliegue inmediato en menos de 5 minutos con subdominio propio.</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <a href="https://restaurapp.studiopixel.cl/cliente?local=demo&mesa=4" target="_blank" rel="noopener noreferrer" class="btn-secondary text-xs py-2 px-3">
          <i data-lucide="qr-code" class="w-3.5 h-3.5 text-sp-turquoise"></i>
          <span>Ver Demo en Vivo</span>
        </a>
        <a href="https://restaurapp.studiopixel.cl/onboarding" target="_blank" rel="noopener noreferrer" class="btn-primary text-xs py-2 px-3.5">
          <i data-lucide="zap" class="w-3.5 h-3.5"></i>
          <span>Comenzar Prueba Gratis</span>
        </a>
      </div>
    </div>
  `;
}

function markTicketReady(btn) {
  const container = btn.closest('.kds-ticket');
  if (container) {
    btn.innerText = '✓ Despachado';
    btn.disabled = true;
    btn.className = 'px-2 py-1 bg-slate-800 text-slate-400 text-[11px] font-semibold rounded cursor-default';
    showToast('Pedido despachado a salón.', 'success');
  }
}

// ==============================================================================
// TOAST NOTIFICATIONS
// ==============================================================================
function showToast(message, type = 'success') {
  let toast = document.getElementById('sp-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sp-toast';
    document.body.appendChild(toast);
  }

  let iconName = 'check-circle';
  let borderClass = 'border-emerald-500/40 text-emerald-300';
  let bgClass = 'bg-slate-900/95';

  if (type === 'error') {
    iconName = 'alert-triangle';
    borderClass = 'border-rose-500/40 text-rose-300';
  } else if (type === 'info') {
    iconName = 'info';
    borderClass = 'border-cyan-500/40 text-cyan-300';
  }

  toast.innerHTML = `
    <div class="flex items-center gap-3 px-4 py-3 rounded-xl ${bgClass} border ${borderClass} shadow-2xl backdrop-blur-md">
      <i data-lucide="${iconName}" class="w-5 h-5 shrink-0"></i>
      <span class="text-xs font-medium text-slate-100">${message}</span>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}
