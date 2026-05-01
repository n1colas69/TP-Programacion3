/* =========================================================
   ONLY ZS — main.js
   Versión con galería protegida por contraseña de admin
========================================================= */

/* =========================================================
   CONFIGURACIÓN ADMIN — CAMBIÁ ESTA CONTRASEÑA
   Abrí este archivo, buscá ADMIN_PASSWORD y cambiá el valor
========================================================= */
const ADMIN_PASSWORD = "ZS@admin2026"; // ← CAMBIÁ ESTO POR TU CONTRASEÑA PERSONAL

/* =========================================================
   1. DATOS DE PRODUCTOS
========================================================= */
const productsData = [
    { id: 1, name: "Polo Ralph Lauren Hi Tech Long Sleeve", category: "Remeras", price: 89000, originalPrice: 119000, badge: "OFERTA", image: "https://placehold.co/400x400/eee/333?text=POLO+RL", isNew: false, inStock: true },
    { id: 2, name: "Carhartt Detroit Jacket J97", category: "Abrigos", price: 250000, originalPrice: null, badge: "NUEVO", image: "https://placehold.co/400x400/eee/333?text=CARHARTT", isNew: true, inStock: true },
    { id: 3, name: "Vintage Dickies 874 Original", category: "Pantalones", price: 65000, originalPrice: null, badge: null, image: "https://placehold.co/400x400/eee/333?text=DICKIES", isNew: false, inStock: true },
    { id: 4, name: "Jansport 90s Made in USA", category: "Accesorios", price: 45000, originalPrice: null, badge: "AGOTADO", image: "https://placehold.co/400x400/eee/333?text=JANSPORT", isNew: false, inStock: false },
    { id: 5, name: "Nautica Competition Fleece", category: "Abrigos", price: 95000, originalPrice: null, badge: null, image: "https://placehold.co/400x400/eee/333?text=NAUTICA", isNew: false, inStock: true },
    { id: 6, name: "Russell Athletic Hoodie Blank", category: "Abrigos", price: 75000, originalPrice: 90000, badge: "OFERTA", image: "https://placehold.co/400x400/eee/333?text=RUSSELL", isNew: false, inStock: true },
    { id: 7, name: "Real Tree Camo Cap Vintage", category: "Accesorios", price: 30000, originalPrice: null, badge: null, image: "https://placehold.co/400x400/eee/333?text=REAL+TREE", isNew: false, inStock: true },
    { id: 8, name: "Chaps Ralph Lauren Knit Sweater", category: "Remeras", price: 55000, originalPrice: null, badge: "NUEVO", image: "https://placehold.co/400x400/eee/333?text=CHAPS", isNew: true, inStock: true }
];

/* =========================================================
   2. ESTADO GLOBAL
========================================================= */
let cart = JSON.parse(localStorage.getItem('zs_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('zs_wishlist')) || [];
let currentDiscount = 0;

// Estado de sesión admin (solo dura mientras la pestaña esté abierta)
let isAdminAuthenticated = sessionStorage.getItem('zs_admin') === '1';

/* =========================================================
   3. INICIALIZACIÓN
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(productsData);
    updateCounters();
    renderCart();
    renderWishlist();
    setupObservers();
    setupSlider();
    setupGallery();
    setupAdminGallery();
    setupFooterLinks();

    // Botones de categorías
    document.querySelectorAll('.category-card').forEach(card => {
        const btn = card.querySelector('.btn');
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterByCategory(card.getAttribute('data-category'));
        });
        card.addEventListener('click', () => filterByCategory(card.getAttribute('data-category')));
    });
});

/* =========================================================
   4. ADMIN GALERÍA — SISTEMA DE CONTRASEÑA
========================================================= */
function setupAdminGallery() {
    const adminModalOverlay = document.getElementById('adminModalOverlay');
    const adminModalClose   = document.getElementById('adminModalClose');
    const openAdminModalBtn = document.getElementById('openAdminModalBtn');
    const adminPasswordInput  = document.getElementById('adminPasswordInput');
    const adminPasswordSubmit = document.getElementById('adminPasswordSubmit');
    const adminPasswordError  = document.getElementById('adminPasswordError');
    const adminLogoutBtn      = document.getElementById('adminLogoutBtn');

    // Si ya está autenticado en esta sesión, mostrar controles de admin
    updateAdminUI();

    // Abrir modal de contraseña
    if (openAdminModalBtn) {
        openAdminModalBtn.addEventListener('click', () => {
            if (isAdminAuthenticated) {
                // Si ya está logueado, ir directo al input de archivo
                document.getElementById('galleryUpload').click();
                return;
            }
            adminModalOverlay.classList.add('active');
            adminPasswordInput.focus();
        });
    }

    // Cerrar modal
    if (adminModalClose) {
        adminModalClose.addEventListener('click', () => {
            adminModalOverlay.classList.remove('active');
            adminPasswordInput.value = '';
            adminPasswordError.innerText = '';
        });
    }
    if (adminModalOverlay) {
        adminModalOverlay.addEventListener('click', (e) => {
            if (e.target === adminModalOverlay) {
                adminModalOverlay.classList.remove('active');
                adminPasswordInput.value = '';
                adminPasswordError.innerText = '';
            }
        });
    }

    // Verificar contraseña
    function checkPassword() {
        const inputVal = adminPasswordInput.value;
        if (inputVal === ADMIN_PASSWORD) {
            isAdminAuthenticated = true;
            sessionStorage.setItem('zs_admin', '1');
            adminModalOverlay.classList.remove('active');
            adminPasswordInput.value = '';
            adminPasswordError.innerText = '';
            updateAdminUI();
            showToast("✓ Sesión de administrador iniciada");
            // Abrir selector de archivo automáticamente
            setTimeout(() => document.getElementById('galleryUpload').click(), 300);
        } else {
            adminPasswordError.innerText = 'Contraseña incorrecta. Intentá de nuevo.';
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    }

    if (adminPasswordSubmit) adminPasswordSubmit.addEventListener('click', checkPassword);
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }

    // Cerrar sesión admin
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            isAdminAuthenticated = false;
            sessionStorage.removeItem('zs_admin');
            updateAdminUI();
            showToast("Sesión de administrador cerrada");
        });
    }
}

function updateAdminUI() {
    const uploadArea   = document.getElementById('galleryUploadArea');
    const triggerArea  = document.getElementById('galleryAdminTriggerArea');
    if (!uploadArea || !triggerArea) return;

    if (isAdminAuthenticated) {
        uploadArea.style.display  = 'flex';
        triggerArea.style.display = 'none';
    } else {
        uploadArea.style.display  = 'none';
        triggerArea.style.display = 'flex';
    }
}

/* =========================================================
   5. UTILIDADES
========================================================= */
function filterByCategory(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === category) btn.classList.add('active');
    });
    const filtered = productsData.filter(p => p.category === category);
    const grid = document.getElementById('productsGrid');
    grid.style.opacity = 0;
    setTimeout(() => { renderProducts(filtered); grid.style.opacity = 1; }, 300);
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

const formatMoney = (amount) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

/* =========================================================
   6. RENDERIZAR PRODUCTOS
========================================================= */
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    if (products.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#aaa;padding:40px 0;">No se encontraron productos.</p>';
        return;
    }
    products.forEach(prod => {
        const isWishlisted = wishlist.includes(prod.id);
        const badgeHTML = prod.badge
            ? `<span class="product-badge badge-${prod.badge.toLowerCase()}">${prod.badge}</span>` : '';
        const priceHTML = prod.originalPrice
            ? `<span class="price-current">${formatMoney(prod.price)}</span> <span class="price-old">${formatMoney(prod.originalPrice)}</span>`
            : `<span class="price-current">${formatMoney(prod.price)}</span>`;
        const btnHTML = prod.inStock
            ? `<button class="add-to-cart" onclick="addToCart(${prod.id})">Agregar al Carrito</button>`
            : `<button class="add-to-cart" style="background:#777;" disabled>Agotado</button>`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div style="position:relative;">
                ${badgeHTML}
                <img src="${prod.image}" alt="${prod.name}" class="product-image" loading="lazy">
                <button class="wishlist-icon ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${prod.id}, this)">
                    <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <p class="product-category">${prod.category}</p>
                <h3 class="product-title">${prod.name}</h3>
                <div class="product-prices">${priceHTML}</div>
                ${btnHTML}
            </div>
        `;
        grid.appendChild(card);
    });
}

/* =========================================================
   7. CARRITO
========================================================= */
function addToCart(id) {
    const product = productsData.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ ...product, qty: 1 });
    saveCart();
    bounceIcon('cartCount');
    showToast(`✓ ${product.name} agregado al carrito`);
    renderCart();
}

function updateQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        saveCart();
        renderCart();
    }
}

function renderCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-message"><i class="fas fa-shopping-cart" style="font-size:2rem;display:block;margin-bottom:10px;color:#ccc;"></i>Tu carrito está vacío.</p>';
    } else {
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            container.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <p class="cart-item-title">${item.name}</p>
                        <p class="cart-item-price">${formatMoney(item.price)}</p>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="updateQty(${item.id}, -${item.qty})">Eliminar</button>
                    </div>
                </div>
            `;
        });
    }

    const totalNode    = document.getElementById('cartTotal');
    const subtotalNode = document.getElementById('cartSubtotal');
    const originalRow  = document.getElementById('originalTotalRow');

    if (currentDiscount > 0) {
        const finalTotal = subtotal - (subtotal * currentDiscount);
        subtotalNode.innerText = formatMoney(subtotal);
        totalNode.innerText    = formatMoney(finalTotal);
        originalRow.style.display = 'flex';
        totalNode.style.background = 'var(--color-dark)';
        totalNode.style.color      = 'var(--color-accent)';
    } else {
        totalNode.innerText = formatMoney(subtotal);
        originalRow.style.display = 'none';
        totalNode.style.background = 'transparent';
        totalNode.style.color      = 'var(--color-dark)';
    }
}

function saveCart() {
    localStorage.setItem('zs_cart', JSON.stringify(cart));
    updateCounters();
}

document.getElementById('applyCouponBtn').addEventListener('click', () => {
    const code = document.getElementById('couponInput').value.toUpperCase().trim();
    if (code === 'ZS2026') {
        currentDiscount = 0.15;
        showToast("✓ Cupón ZS2026 aplicado — 15% OFF");
    } else {
        currentDiscount = 0;
        showToast("Código inválido. Intentá con ZS2026");
    }
    renderCart();
});

document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) { showToast("Tu carrito está vacío"); return; }
    showToast("¡Redirigiendo a pasarela de pago...");
});

/* =========================================================
   8. WISHLIST
========================================================= */
function toggleWishlist(id, btnElement) {
    const index = wishlist.indexOf(id);
    const icon  = btnElement.querySelector('i');
    if (index > -1) {
        wishlist.splice(index, 1);
        icon.classList.replace('fas', 'far');
        btnElement.classList.remove('active');
        showToast("Removido de favoritos");
    } else {
        wishlist.push(id);
        icon.classList.replace('far', 'fas');
        btnElement.classList.add('active');
        showToast("✓ Agregado a favoritos");
        bounceIcon('wishlistCount');
    }
    localStorage.setItem('zs_wishlist', JSON.stringify(wishlist));
    updateCounters();
    renderWishlist();
}

function renderWishlist() {
    const container  = document.getElementById('wishlistItems');
    container.innerHTML = '';
    const wishlisted = productsData.filter(p => wishlist.includes(p.id));
    if (wishlisted.length === 0) {
        container.innerHTML = '<p class="empty-message"><i class="far fa-heart" style="font-size:2rem;display:block;margin-bottom:10px;color:#ccc;"></i>No tenés favoritos aún.</p>';
        return;
    }
    wishlisted.forEach(item => {
        container.innerHTML += `
            <div class="wishlist-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="wishlist-item-info">
                    <p class="wishlist-item-title">${item.name}</p>
                    <p class="wishlist-item-price">${formatMoney(item.price)}</p>
                    <div class="wishlist-item-actions">
                        ${item.inStock
                            ? `<button class="wishlist-add-btn" onclick="addToCartFromWishlist(${item.id})">+ AL CARRITO</button>`
                            : `<span style="font-size:0.75rem;color:#aaa;">Agotado</span>`}
                        <button class="wishlist-remove-btn" onclick="removeFromWishlist(${item.id})">Quitar</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function addToCartFromWishlist(id) {
    addToCart(id);
    document.getElementById('wishlistOverlay').classList.remove('active');
    document.getElementById('wishlistDrawer').classList.remove('active');
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartDrawer').classList.add('active');
}

function removeFromWishlist(id) {
    const idx = wishlist.indexOf(id);
    if (idx > -1) wishlist.splice(idx, 1);
    localStorage.setItem('zs_wishlist', JSON.stringify(wishlist));
    updateCounters();
    renderWishlist();
    const activeFilter = document.querySelector('.filter-btn.active');
    const cat = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
    renderProducts(cat === 'all' ? productsData : productsData.filter(p => p.category === cat));
    showToast("Removido de favoritos");
}

function updateCounters() {
    document.getElementById('cartCount').innerText = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('wishlistCount').innerText = wishlist.length;
}

function bounceIcon(id) {
    const badge = document.getElementById(id);
    badge.classList.add('bounce');
    setTimeout(() => badge.classList.remove('bounce'), 300);
}

/* =========================================================
   9. UI — DRAWERS Y BUSCADOR
========================================================= */
// Carrito
const cartOverlay = document.getElementById('cartOverlay');
const cartDrawer  = document.getElementById('cartDrawer');
document.getElementById('cartBtn').addEventListener('click', () => {
    cartOverlay.classList.add('active');
    cartDrawer.classList.add('active');
});
const closeCartUI = () => {
    cartOverlay.classList.remove('active');
    cartDrawer.classList.remove('active');
};
document.getElementById('closeCart').addEventListener('click', closeCartUI);
cartOverlay.addEventListener('click', closeCartUI);

// Wishlist
const wishlistOverlay = document.getElementById('wishlistOverlay');
const wishlistDrawer  = document.getElementById('wishlistDrawer');
document.getElementById('wishlistBtn').addEventListener('click', () => {
    wishlistOverlay.classList.add('active');
    wishlistDrawer.classList.add('active');
});
const closeWishlistUI = () => {
    wishlistOverlay.classList.remove('active');
    wishlistDrawer.classList.remove('active');
};
document.getElementById('closeWishlist').addEventListener('click', closeWishlistUI);
wishlistOverlay.addEventListener('click', closeWishlistUI);

// Buscador
const searchOverlay = document.getElementById('searchOverlay');
const searchInput   = document.getElementById('searchInput');
document.getElementById('searchBtn').addEventListener('click', () => {
    searchOverlay.classList.add('active');
    searchInput.focus();
});
const closeSearchUI = () => {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    renderProducts(productsData);
};
document.getElementById('closeSearch').addEventListener('click', closeSearchUI);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSearchUI(); closeCartUI(); closeWishlistUI(); }
});
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = productsData.filter(p =>
        p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
    );
    renderProducts(filtered);
    document.getElementById('products').scrollIntoView();
});

// Filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const cat = e.target.getAttribute('data-filter');
        const filtered = cat === 'all' ? productsData : productsData.filter(p => p.category === cat);
        const grid = document.getElementById('productsGrid');
        grid.style.opacity = 0;
        setTimeout(() => { renderProducts(filtered); grid.style.opacity = 1; }, 300);
    });
});

// Menú Mobile
document.getElementById('hamburgerBtn').addEventListener('click', () => {
    document.getElementById('mobileNav').classList.toggle('active');
});
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => document.getElementById('mobileNav').classList.remove('active'));
});

// Toasts
function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// Newsletter
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail');
    const msg   = document.getElementById('newsletterMsg');
    msg.innerText = `¡Gracias! Hemos enviado tu descuento a ${email.value}`;
    email.value = '';
    setTimeout(() => msg.innerText = '', 5000);
});

/* =========================================================
   10. SLIDER DE TESTIMONIOS
========================================================= */
let currentSlide = 0;
let sliderInterval;

function setupSlider() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('sliderDots');
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'dot-btn' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
    document.getElementById('sliderPrev').addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoPlay(); });
    document.getElementById('sliderNext').addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoPlay(); });
    startAutoPlay();
}

function goToSlide(index) {
    const slider = document.getElementById('testimonialSlider');
    const slides = document.querySelectorAll('.slide');
    const dots   = document.querySelectorAll('.dot-btn');
    if (!slider || slides.length === 0) return;
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    slider.style.transition = 'transform 0.5s ease';
    const slideWidth = slides[0].clientWidth + 30;
    slider.style.transform = `translateX(-${index * slideWidth}px)`;
    currentSlide = index;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

function startAutoPlay()  { sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 4000); }
function resetAutoPlay()  { clearInterval(sliderInterval); startAutoPlay(); }

/* =========================================================
   11. GALERÍA (subida solo para admin)
========================================================= */
function setupGallery() {
    const input = document.getElementById('galleryUpload');
    if (input) input.addEventListener('change', handleGalleryUpload);
    renderGallery();
}

function handleGalleryUpload(e) {
    // Doble verificación de seguridad
    if (!isAdminAuthenticated) {
        showToast("No tenés permisos para subir fotos.");
        e.target.value = '';
        return;
    }
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    let gallery = getGallery();
    if (gallery.length >= 20) {
        showToast("Máximo 20 fotos. Eliminá alguna para subir más.");
        e.target.value = '';
        return;
    }
    let processed = 0;
    const toProcess = Math.min(files.length, 20 - gallery.length);
    files.slice(0, toProcess).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            gallery.push({ id: Date.now() + Math.random(), src: ev.target.result });
            processed++;
            if (processed === toProcess) {
                saveGallery(gallery);
                renderGallery();
                showToast(`✓ ${toProcess} foto${toProcess > 1 ? 's' : ''} subida${toProcess > 1 ? 's' : ''}`);
            }
        };
        reader.readAsDataURL(file);
    });
    e.target.value = '';
}

function getGallery() {
    try { return JSON.parse(localStorage.getItem('zs_gallery')) || []; }
    catch { return []; }
}

function saveGallery(gallery) {
    try { localStorage.setItem('zs_gallery', JSON.stringify(gallery)); }
    catch { showToast("No hay espacio para más fotos. Eliminá algunas primero."); }
}

function deleteGalleryItem(id) {
    if (!isAdminAuthenticated) { showToast("No tenés permisos."); return; }
    let gallery = getGallery().filter(item => item.id !== id);
    saveGallery(gallery);
    renderGallery();
    showToast("Foto eliminada");
}

function renderGallery() {
    const grid     = document.getElementById('galleryGrid');
    const emptyMsg = document.getElementById('galleryEmptyMsg');
    const gallery  = getGallery();
    grid.innerHTML = '';
    if (gallery.length === 0) { emptyMsg.classList.add('visible'); return; }
    emptyMsg.classList.remove('visible');
    gallery.forEach(item => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        // Botón de eliminar solo visible para el admin
        const deleteBtn = isAdminAuthenticated
            ? `<div class="gallery-item-overlay">
                   <button class="gallery-delete-btn" onclick="deleteGalleryItem(${item.id})" title="Eliminar foto">
                       <i class="fas fa-trash"></i>
                   </button>
               </div>`
            : '';
        div.innerHTML = `
            <img src="${item.src}" alt="Foto de cliente ZS" loading="lazy">
            ${deleteBtn}
        `;
        grid.appendChild(div);
    });
}

/* =========================================================
   12. MODALES DEL FOOTER
========================================================= */
function setupFooterLinks() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose   = document.getElementById('modalClose');
    const infos = {
        linkEnvios: {
            title: 'ENVÍOS Y ENTREGAS',
            body: `
                <p>Realizamos envíos a todo el país a través de correo privado.</p>
                <p><strong>Tiempos estimados:</strong></p>
                <ul>
                    <li>Capital / GBA: 24-48hs hábiles</li>
                    <li>Interior: 3-7 días hábiles</li>
                </ul>
                <p>El costo de envío se calcula al momento del pago según tu ubicación.</p>
                <p><strong>¿Comprás más de $200.000?</strong> El envío es gratis automáticamente.</p>
            `
        },
        linkDevoluciones: {
            title: 'CAMBIOS Y DEVOLUCIONES',
            body: `
                <p>Tenés <strong>7 días corridos</strong> desde que recibís tu pedido para solicitar un cambio o devolución.</p>
                <p>La prenda debe estar en el mismo estado en que fue recibida: sin uso, sin lavar y con su etiqueta original.</p>
                <p>Para iniciar el proceso, contactanos por Instagram o WhatsApp con tu número de pedido.</p>
                <p>Los gastos de envío por cambio corren por cuenta del comprador.</p>
            `
        },
        linkFaq: {
            title: 'PREGUNTAS FRECUENTES',
            body: `
                <p><strong>¿Las prendas están lavadas?</strong><br>Sí, todas pasan por un proceso de lavado y desinfección antes de ser publicadas.</p>
                <p><strong>¿Puedo ver la prenda en persona?</strong><br>Podés coordinar un encuentro en La Rioja. Contactanos por WhatsApp.</p>
                <p><strong>¿Cómo pago?</strong><br>Aceptamos transferencia bancaria, MercadoPago, efectivo en persona, Visa y Mastercard.</p>
                <p><strong>¿Las prendas son originales?</strong><br>Sí. Cada pieza es cuidadosamente verificada antes de publicarse.</p>
            `
        }
    };
    Object.keys(infos).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('modalTitle').innerText = infos[id].title;
            document.getElementById('modalBody').innerHTML  = infos[id].body;
            modalOverlay.classList.add('active');
        });
    });
    const closeModal = () => modalOverlay.classList.remove('active');
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
}

/* =========================================================
   13. SCROLL, PARALLAX Y CURSOR
========================================================= */
let lastScrollY = window.scrollY;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
        navbar.classList.toggle('hidden', window.scrollY > lastScrollY);
    } else {
        navbar.classList.remove('scrolled', 'hidden');
    }
    lastScrollY = window.scrollY;
    const hero = document.getElementById('hero');
    if (hero && window.scrollY <= hero.offsetHeight) {
        hero.style.backgroundPositionY = `${window.scrollY * 0.5}px`;
    }
});

function setupObservers() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });
    reveals.forEach(reveal => observer.observe(reveal));
}

// Custom Cursor
const cursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
});
document.querySelectorAll('a, button, input, label').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%, -50%) scale(2)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%, -50%) scale(1)');
});
