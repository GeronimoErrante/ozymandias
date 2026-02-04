document.addEventListener('DOMContentLoaded', () => {
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
