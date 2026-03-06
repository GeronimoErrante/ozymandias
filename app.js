document.addEventListener('DOMContentLoaded', () => {
    // ===== ANIMATED YERBA MATE LEAVES =====
    const leavesContainer = document.getElementById('leaves-container');
    const heroSection = document.getElementById('hero');
    const isDesktop = window.innerWidth >= 768;
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

    // Initialize all leaves once
    initializeLeaves();

    // ===== MOUSE INTERACTION WITH LEAVES =====
    if (isDesktop) {
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

    // ===== EXISTING CODE =====
    const productGrid = document.getElementById('product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const priceSort = document.getElementById('price-sort');

    // Theme Toggle
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

    // Make products accessible for the global modal function
    let products = [];
    window.products = []; // Expose globally just in case, though closure works if openModal is defined inside.


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
            renderProducts(products);
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

        productsToRender.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            // Format price to ARS currency
            const formattedPrice = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0
            }).format(product.price);

            let promoHtml = '';
            if (product.promo_price) {
                const formattedPromo = new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 0
                }).format(product.promo_price);
                promoHtml = `<div class="promo-badge">2 x ${formattedPromo}</div>`;
            }

            // Using onclick with global function for robustness as requested
            card.innerHTML = `
                <div class="card-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onclick="window.openModal(${product.id})">
                    ${promoHtml}
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="category-tag">${product.category}</span>
                        <span class="product-weight">${product.weight}</span>
                    </div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="card-footer">
                        <span class="price">${formattedPrice}</span>
                        <a href="https://wa.me/542346698477?text=Hola!%20Me%20interesa%20${encodeURIComponent(product.name)}" target="_blank" class="btn-add">Pedir</a>
                    </div>
                </div>
            `;

            productGrid.appendChild(card);
        });
    }

    // Filter products
    function filterProducts() {
        const selectedCategory = categoryFilter.value;
        const sortValue = priceSort.value;

        console.log('Filtrando por:', selectedCategory, 'Orden:', sortValue);

        // 1. Filter
        let filtered = products.filter(product => {
            if (selectedCategory === 'all') return true;
            return product.category === selectedCategory;
        });

        console.log('Productos errontrados:', filtered.length);

        // 2. Sort
        if (sortValue === 'asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'desc') {
            filtered.sort((a, b) => b.price - a.price);
        }
        // 'default' keeps original order (by id usually, or how they came in JSON)

        renderProducts(filtered);
    }

    // Modal Elements
    const modal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalWeight = document.getElementById('modal-weight');
    const modalDesc = document.getElementById('modal-desc');
    const modalPrice = document.getElementById('modal-price');
    const modalBtn = document.getElementById('modal-btn');
    const closeModalSpan = document.getElementsByClassName('close-modal')[0];

    // Open Modal Function
    window.openModal = function (id) {
        const product = products.find(p => p.id === id);
        if (!product) return;

        modalImg.src = product.image;
        modalImg.alt = product.name;
        modalTitle.textContent = product.name;
        modalCategory.textContent = product.category;
        modalWeight.textContent = product.weight;
        modalDesc.textContent = product.description;

        const formattedPrice = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(product.price);

        // Show promo price in modal if available
        let priceDisplay = formattedPrice;
        if (product.promo_price) {
            const formattedPromo = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0
            }).format(product.promo_price);
            priceDisplay = `${formattedPrice}<br><span class="modal-promo">Promoción: 2 x ${formattedPromo}</span>`;
        }

        modalPrice.innerHTML = priceDisplay;
        modalBtn.href = `https://wa.me/542346698477?text=Hola!%20Me%20interesa%20${encodeURIComponent(product.name)}`;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Disable scroll
    }

    // Close Modal Logic
    closeModalSpan.onclick = function () {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scroll
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Enable scroll
        }
    }

    // Event Listeners
    categoryFilter.addEventListener('change', filterProducts);
    priceSort.addEventListener('change', filterProducts);
});
