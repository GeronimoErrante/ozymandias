document.addEventListener('DOMContentLoaded', () => {
    // ===== ANIMATED YERBA MATE LEAVES =====
    const leavesContainer = document.getElementById('leaves-container');
    const heroSection = document.getElementById('hero');
    const isDesktop = window.innerWidth >= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const leafCount = isDesktop ? 30 : 15; // 30 leaves on desktop, 15 on mobile

    /**
     * Create an SVG leaf element representing a yerba mate leaf
     * @returns {SVGElement} SVG leaf shape
     */
    function createLeafSVG() {
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');

        // Create leaf path - simple elongated shape with pointed top
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M50,5 Q30,20 25,45 Q20,70 50,95 Q80,70 75,45 Q70,20 50,5 Z');
        path.setAttribute('fill', 'currentColor');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '0.5');
        // Higher opacity and more vibrant green
        path.style.color = 'rgba(118, 189, 134, 0.85)';

        svg.appendChild(path);
        return svg;
    }

    /**
     * Generate all leaves at once and set them to infinite loop
     */
    function initializeLeaves() {
        for (let i = 0; i < leafCount; i++) {
            const leaf = document.createElement('div');
            leaf.classList.add('leaf');
            leaf.dataset.leafIndex = i;

            // Random horizontal start position
            const startX = Math.random() * 100;
            leaf.style.left = startX + '%';

            // Random size between 25px and 70px (larger for more visibility)
            const size = 25 + Math.random() * 45;
            leaf.style.width = size + 'px';
            leaf.style.height = size + 'px';

            // Random duration (between 12s and 20s for slower falling)
            const duration = 12 + Math.random() * 8;
            leaf.style.setProperty('--duration', duration + 's');

            // Negative delay so leaves start at different positions in their fall cycle
            // This makes some leaves appear mid-screen already falling when page loads
            const negativeDelay = -(Math.random() * duration);
            leaf.style.setProperty('--delay', negativeDelay + 's');

            // Add drift class for horizontal movement
            const driftClass = Math.random() < 0.5 ? 'drift-left' : 'drift-right';
            leaf.classList.add(driftClass);

            // Add SVG leaf shape
            leaf.appendChild(createLeafSVG());

            leavesContainer.appendChild(leaf);
        }
    }

    if (!prefersReducedMotion) {
        initializeLeaves();
    }

    // ===== MOUSE INTERACTION WITH LEAVES =====
    if (isDesktop && !prefersReducedMotion) {
        const leaves = document.querySelectorAll('.leaf');

        document.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();

            // Only apply interaction if mouse is over hero section
            if (e.clientY > rect.top && e.clientY < rect.bottom) {
                const mouseX = e.clientX;
                const mouseY = e.clientY;

                leaves.forEach((leaf) => {
                    const leafRect = leaf.getBoundingClientRect();
                    const leafCenterX = leafRect.left + leafRect.width / 2;
                    const leafCenterY = leafRect.top + leafRect.height / 2;

                    // Distance from mouse to leaf
                    const distance = Math.sqrt(
                        Math.pow(mouseX - leafCenterX, 2) +
                        Math.pow(mouseY - leafCenterY, 2)
                    );

                    const interactionRadius = 100; // pixels

                    if (distance < interactionRadius) {
                        // Leaf is near mouse - push it away slightly but keep falling
                        const angle = Math.atan2(leafCenterY - mouseY, leafCenterX - mouseX);
                        // Subtle push - small displacement (15-20px max)
                        const pushDistance = (1 - distance / interactionRadius) * 20;

                        const pushX = Math.cos(angle) * pushDistance;
                        const pushY = Math.sin(angle) * pushDistance;

                        // Apply smooth transform while keeping animation
                        leaf.style.transform = `translate(${pushX}px, ${pushY}px)`;
                        leaf.classList.add('leaf-active');
                    } else {
                        // Far from mouse - smooth reset
                        leaf.style.transform = 'translate(0px, 0px)';
                        leaf.classList.remove('leaf-active');
                    }
                });
            }
        });

        // Reset on mouse leave
        heroSection.addEventListener('mouseleave', () => {
            leaves.forEach((leaf) => {
                leaf.style.transform = 'translate(0px, 0px)';
                leaf.classList.remove('leaf-active');
            });
        });
    }

    // ===== HEADER: transparent over the hero, solid once scrolled =====
    const header = document.getElementById('main-header');

    function syncHeader() {
        header.classList.toggle('scrolled', window.scrollY > 40);
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    // ===== MOBILE NAV =====
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');

    function setNav(open) {
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        mainNav.classList.toggle('is-open', open);
        header.classList.toggle('nav-open', open);
        document.body.classList.toggle('nav-locked', open);
    }

    navToggle.addEventListener('click', () => {
        setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close the panel after picking a destination
    mainNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setNav(false));
    });

    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // ===== CATALOG =====
    const productGrid = document.getElementById('product-grid');
    const categoryChips = document.getElementById('category-chips');
    const priceSort = document.getElementById('price-sort');
    const searchBox = document.getElementById('search-box');
    const searchInput = document.getElementById('product-search');
    const searchClear = document.getElementById('search-clear');
    const resultsCount = document.getElementById('results-count');

    // Readable names for the raw category values stored in products.json
    const CATEGORY_LABELS = {
        uruguaya: 'Sin palo',
        barbacua: 'Barbacuá',
        tradicional: 'Tradicional',
        argentina: 'Con palo'
    };

    const currency = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    });

    // Make products accessible for the global modal function
    let products = [];
    window.products = []; // Expose globally just in case, though closure works if openModal is defined inside.

    let activeCategory = 'all';
    let searchTerm = '';

    // Reveal cards as they enter the viewport
    const revealObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 })
        : null;

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);
    }

    // Fold accents so "pindare" matches "Pindaré"
    function normalize(value) {
        return String(value)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');
    }

    function whatsappLink(productName) {
        return `https://wa.me/542346698477?text=Hola!%20Me%20interesa%20${encodeURIComponent(productName)}`;
    }

    // Fetch products
    fetch('products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            products = data;
            window.products = data; // Keep global sync
            console.log('Productos cargados:', products.length);
            applyFilters();
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = '<p class="error">Error al cargar los productos. Por favor recarga la página.</p>';
        });

    // Render products function
    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';

        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p class="no-results">No se encontraron productos.</p>';
            return;
        }

        productsToRender.forEach((product, index) => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            const formattedPrice = currency.format(product.price);
            const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

            let promoHtml = '';
            if (product.promo_price) {
                promoHtml = `<div class="promo-badge">Kilo x ${currency.format(product.promo_price)}</div>`;
            }

            const outOfStock = Boolean(product.out_of_stock);
            card.classList.toggle('is-out-of-stock', outOfStock);
            const ribbonHtml = outOfStock ? '<div class="stock-ribbon">Sin Stock</div>' : '';

            card.innerHTML = `
                <div class="card-image">
                    <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
                    ${promoHtml}
                    ${ribbonHtml}
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="category-tag">${escapeHtml(categoryLabel)}</span>
                        <span class="product-weight">${escapeHtml(product.weight)}</span>
                    </div>
                    <h3 class="product-title">${escapeHtml(product.name)}</h3>
                    <p class="product-desc">${escapeHtml(product.description)}</p>
                    <div class="card-footer">
                        <span class="price">${formattedPrice}</span>
                        <a href="${whatsappLink(product.name)}" target="_blank" rel="noopener noreferrer" class="btn-add">Pedir</a>
                    </div>
                </div>
            `;

            card.querySelector('.card-image').addEventListener('click', () => window.openModal(product.id));

            if (revealObserver) {
                // Stagger so the grid fills in rather than popping at once
                card.style.transitionDelay = `${Math.min(index, 8) * 60}ms`;
                revealObserver.observe(card);
            } else {
                card.classList.add('is-visible');
            }

            productGrid.appendChild(card);
        });
    }

    // Filter + search + sort
    function applyFilters() {
        const term = normalize(searchTerm.trim());

        let filtered = products.filter(product => {
            const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
            if (!matchesCategory) return false;
            if (!term) return true;
            return normalize(product.name).includes(term) ||
                normalize(product.description).includes(term) ||
                normalize(CATEGORY_LABELS[product.category] || product.category).includes(term);
        });

        const sortValue = priceSort.value;
        if (sortValue === 'asc') {
            filtered = [...filtered].sort((a, b) => a.price - b.price);
        } else if (sortValue === 'desc') {
            filtered = [...filtered].sort((a, b) => b.price - a.price);
        }
        // 'default' keeps original order (by id usually, or how they came in JSON)

        resultsCount.textContent = filtered.length === 1
            ? '1 producto'
            : `${filtered.length} productos`;

        renderProducts(filtered);
    }

    // Category chips
    categoryChips.addEventListener('click', (event) => {
        const chip = event.target.closest('.chip');
        if (!chip) return;

        activeCategory = chip.dataset.category;

        categoryChips.querySelectorAll('.chip').forEach((item) => {
            const isActive = item === chip;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-pressed', String(isActive));
        });

        // On mobile the chips scroll horizontally; keep the picked one in view
        chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        applyFilters();
    });

    // Search
    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value;
        searchBox.classList.toggle('has-value', searchTerm.length > 0);
        applyFilters();
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        searchBox.classList.remove('has-value');
        applyFilters();
        searchInput.focus();
    });

    priceSort.addEventListener('change', applyFilters);

    // ===== MODAL =====
    const modal = document.getElementById('product-modal');
    const modalImage = document.querySelector('.modal-image');
    const modalStock = document.getElementById('modal-stock');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalWeight = document.getElementById('modal-weight');
    const modalDesc = document.getElementById('modal-desc');
    const modalPrice = document.getElementById('modal-price');
    const modalBtn = document.getElementById('modal-btn');
    const closeModalBtn = document.querySelector('.close-modal');

    // Open Modal Function
    window.openModal = function (id) {
        const product = products.find(p => p.id === id);
        if (!product) return;

        modalImg.src = product.image;
        modalImg.alt = product.name;
        modalImage.classList.toggle('is-out-of-stock', Boolean(product.out_of_stock));
        modalStock.hidden = !product.out_of_stock;
        modalTitle.textContent = product.name;
        modalCategory.textContent = CATEGORY_LABELS[product.category] || product.category;
        modalWeight.textContent = product.weight;
        modalDesc.textContent = product.description;

        // Show promo price in modal if available
        let priceDisplay = escapeHtml(currency.format(product.price));
        if (product.promo_price) {
            priceDisplay += `<span class="modal-promo">Promoción: Kilo x ${escapeHtml(currency.format(product.promo_price))}</span>`;
        }

        modalPrice.innerHTML = priceDisplay;
        modalBtn.href = whatsappLink(product.name);

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Disable scroll
        closeModalBtn.focus();
    };

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Enable scroll
    }

    closeModalBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            closeModal();
        }
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (modal.style.display === 'block') closeModal();
        if (navToggle.getAttribute('aria-expanded') === 'true') setNav(false);
    });
});
