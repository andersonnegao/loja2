// Application Data
const appData = {
  produtos: [
    {
      id: 1,
      nome: "Smartphone Samsung Galaxy",
      preco: 1299.99,
      categoria: "Eletrônicos",
      imagem: "https://via.placeholder.com/300x300/2563eb/ffffff?text=Samsung",
      descricao: "Smartphone com tela de 6.5 polegadas e câmera de 64MP",
      estoque: 25,
      rating: 4.5
    },
    {
      id: 2,
      nome: "Notebook Dell Inspiron",
      preco: 2499.99,
      categoria: "Eletrônicos",
      imagem: "https://via.placeholder.com/300x300/16a34a/ffffff?text=Dell",
      descricao: "Notebook com Intel i5, 8GB RAM e SSD 256GB",
      estoque: 10,
      rating: 4.2
    },
    {
      id: 3,
      nome: "Tênis Nike Air Max",
      preco: 399.99,
      categoria: "Calçados",
      imagem: "https://via.placeholder.com/300x300/dc2626/ffffff?text=Nike",
      descricao: "Tênis esportivo com tecnologia Air Max",
      estoque: 50,
      rating: 4.8
    },
    {
      id: 4,
      nome: "Camiseta Premium",
      preco: 89.99,
      categoria: "Roupas",
      imagem: "https://via.placeholder.com/300x300/7c3aed/ffffff?text=Camiseta",
      descricao: "Camiseta 100% algodão com corte moderno",
      estoque: 100,
      rating: 4.3
    },
    {
      id: 5,
      nome: "Fone Bluetooth JBL",
      preco: 299.99,
      categoria: "Eletrônicos",
      imagem: "https://via.placeholder.com/300x300/ea580c/ffffff?text=JBL",
      descricao: "Fone de ouvido sem fio com cancelamento de ruído",
      estoque: 30,
      rating: 4.6
    },
    {
      id: 6,
      nome: "Relógio Smartwatch",
      preco: 599.99,
      categoria: "Acessórios",
      imagem: "https://via.placeholder.com/300x300/0891b2/ffffff?text=Watch",
      descricao: "Smartwatch com monitoramento de saúde",
      estoque: 20,
      rating: 4.4
    }
  ],
  categorias: ["Eletrônicos", "Roupas", "Calçados", "Acessórios"],
  usuarios: {
    cliente: {
      email: "cliente@email.com",
      nome: "João Silva",
      tipo: "cliente"
    },
    vendedor: {
      email: "vendedor@email.com",
      nome: "Maria Santos",
      tipo: "vendedor"
    }
  }
};

// Application State
let currentUser = null;
let currentPage = 'home';
let cart = [];
let filteredProducts = [...appData.produtos];
let searchQuery = '';

// DOM Elements - Will be initialized after DOM is ready
let elements = {};

// Utility Functions
function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }
  
  if (hasHalfStar) {
    stars += '☆';
  }
  
  return stars;
}

function showLoading() {
  if (elements.loading) {
    elements.loading.classList.remove('hidden');
  }
}

function hideLoading() {
  if (elements.loading) {
    elements.loading.classList.add('hidden');
  }
}

function showMessage(message, type = 'info') {
  const messageEl = document.createElement('div');
  messageEl.className = `message message--${type} fade-in`;
  messageEl.textContent = message;
  
  document.body.insertBefore(messageEl, document.body.firstChild);
  
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.remove();
    }
  }, 4000);
}

// Navigation Functions
function navigateTo(page) {
  currentPage = page;
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(pageEl => {
    pageEl.classList.remove('active');
  });
  
  // Show target page
  const targetPage = document.getElementById(`${page}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
    targetPage.classList.add('fade-in');
  }
  
  // Handle special page logic
  if (page === 'seller' && (!currentUser || currentUser.tipo !== 'vendedor')) {
    navigateTo('login');
    showMessage('Acesso restrito para vendedores', 'error');
    return;
  }
  
  if (page === 'checkout' && cart.length === 0) {
    navigateTo('home');
    showMessage('Carrinho vazio', 'error');
    return;
  }

  if (page === 'checkout') {
    renderCheckoutSummary();
  }

  if (page === 'seller') {
    initSellerDashboard();
  }
}

// Authentication Functions
function initAuth() {
  const loginForm = document.getElementById('login-form');
  const userTypeBtns = document.querySelectorAll('.user-type-btn');
  let selectedUserType = 'cliente';
  
  if (!loginForm || !userTypeBtns.length) return;
  
  // User type selector
  userTypeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      userTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedUserType = btn.dataset.type;
    });
  });
  
  // Login form
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    const validCredentials = {
      cliente: { email: 'cliente@email.com', password: 'cliente123' },
      vendedor: { email: 'vendedor@email.com', password: 'vendedor123' }
    };
    
    const userCreds = validCredentials[selectedUserType];
    
    if (email === userCreds.email && password === userCreds.password) {
      currentUser = appData.usuarios[selectedUserType];
      updateUserUI();
      
      if (selectedUserType === 'vendedor') {
        navigateTo('seller');
      } else {
        navigateTo('home');
      }
      
      showMessage(`Bem-vindo, ${currentUser.nome}!`, 'success');
      loginForm.reset();
    } else {
      showMessage('Credenciais inválidas', 'error');
    }
  });
}

function updateUserUI() {
  if (currentUser) {
    elements.userName.textContent = currentUser.nome;
  } else {
    elements.userName.textContent = 'Login';
  }
}

function logout() {
  currentUser = null;
  updateUserUI();
  navigateTo('home');
  showMessage('Logout realizado com sucesso', 'success');
}

// Products Functions
function renderProducts(products = filteredProducts) {
  if (!elements.productsGrid) return;
  
  elements.productsGrid.innerHTML = '';
  
  if (products.length === 0) {
    elements.productsGrid.innerHTML = '<div class="empty-state">Nenhum produto encontrado</div>';
    return;
  }
  
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card fade-in';
    
    productCard.innerHTML = `
      <img src="${product.imagem}" alt="${product.nome}" class="product-image" onerror="this.style.backgroundColor='var(--color-bg-${(product.id % 8) + 1})'">
      <div class="product-info">
        <h3 class="product-name">${product.nome}</h3>
        <p class="product-description">${product.descricao}</p>
        <div class="product-details">
          <span class="product-price">${formatPrice(product.preco)}</span>
          <div class="product-rating">
            <span class="rating-stars">${generateStars(product.rating)}</span>
            <span>${product.rating}</span>
          </div>
        </div>
        <button class="add-to-cart-btn" ${product.estoque === 0 ? 'disabled' : ''} onclick="addToCart(${product.id})">
          ${product.estoque === 0 ? 'Fora de estoque' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    `;
    
    elements.productsGrid.appendChild(productCard);
  });
}

function initFilters() {
  if (!elements.categoryFilter || !elements.sortFilter) return;
  
  // Populate category filter
  elements.categoryFilter.innerHTML = '<option value="">Todas as categorias</option>';
  appData.categorias.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria;
    option.textContent = categoria;
    elements.categoryFilter.appendChild(option);
  });
  
  // Category filter event
  elements.categoryFilter.addEventListener('change', applyFilters);
  
  // Sort filter event
  elements.sortFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
  let filtered = [...appData.produtos];
  
  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter(product => 
      product.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descricao.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Apply category filter
  const selectedCategory = elements.categoryFilter ? elements.categoryFilter.value : '';
  if (selectedCategory) {
    filtered = filtered.filter(product => product.categoria === selectedCategory);
  }
  
  // Apply sort filter
  const sortBy = elements.sortFilter ? elements.sortFilter.value : '';
  switch (sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.preco - b.preco);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.preco - a.preco);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'name':
      filtered.sort((a, b) => a.nome.localeCompare(b.nome));
      break;
  }
  
  filteredProducts = filtered;
  renderProducts(filteredProducts);
}

// Search Functions
function initSearch() {
  if (!elements.searchInput || !elements.searchBtn) return;
  
  elements.searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    applyFilters();
  });
  
  elements.searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchQuery = elements.searchInput.value;
    applyFilters();
  });
  
  elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchQuery = elements.searchInput.value;
      applyFilters();
    }
  });
}

// Cart Functions
function addToCart(productId) {
  if (!currentUser) {
    navigateTo('login');
    showMessage('Faça login para adicionar produtos ao carrinho', 'info');
    return;
  }
  
  const product = appData.produtos.find(p => p.id === productId);
  if (!product || product.estoque === 0) {
    showMessage('Produto indisponível', 'error');
    return;
  }
  
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    if (existingItem.quantity < product.estoque) {
      existingItem.quantity++;
      showMessage('Quantidade atualizada no carrinho', 'success');
    } else {
      showMessage('Quantidade máxima atingida', 'error');
      return;
    }
  } else {
    cart.push({ ...product, quantity: 1 });
    showMessage('Produto adicionado ao carrinho', 'success');
  }
  
  updateCartUI();
  saveCartToStorage();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
  renderCartItems();
  saveCartToStorage();
  showMessage('Produto removido do carrinho', 'success');
}

function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  
  const newQuantity = item.quantity + change;
  
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  const product = appData.produtos.find(p => p.id === productId);
  if (newQuantity > product.estoque) {
    showMessage('Quantidade máxima atingida', 'error');
    return;
  }
  
  item.quantity = newQuantity;
  updateCartUI();
  renderCartItems();
  saveCartToStorage();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
  
  if (elements.cartCount) {
    elements.cartCount.textContent = totalItems;
  }
  if (elements.cartTotal) {
    elements.cartTotal.textContent = formatPrice(total);
  }
}

function renderCartItems() {
  if (!elements.cartItems) return;
  
  if (cart.length === 0) {
    elements.cartItems.innerHTML = '<div class="cart-empty">Seu carrinho está vazio</div>';
    return;
  }
  
  elements.cartItems.innerHTML = '';
  
  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item fade-in';
    
    cartItem.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}" class="cart-item-image" onerror="this.style.backgroundColor='var(--color-bg-${(item.id % 8) + 1})'">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.nome}</div>
        <div class="cart-item-price">${formatPrice(item.preco)}</div>
        <div class="cart-item-controls">
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
          <button class="remove-item" onclick="removeFromCart(${item.id})">🗑️</button>
        </div>
      </div>
    `;
    
    elements.cartItems.appendChild(cartItem);
  });
}

function toggleCart() {
  if (!elements.cartSidebar || !elements.cartOverlay) return;
  
  elements.cartSidebar.classList.toggle('open');
  elements.cartOverlay.classList.toggle('open');
  
  if (elements.cartSidebar.classList.contains('open')) {
    renderCartItems();
  }
}

function initCart() {
  loadCartFromStorage();
  
  if (elements.cartBtn) {
    elements.cartBtn.addEventListener('click', toggleCart);
  }
  
  if (elements.cartClose) {
    elements.cartClose.addEventListener('click', toggleCart);
  }
  
  if (elements.cartOverlay) {
    elements.cartOverlay.addEventListener('click', toggleCart);
  }
  
  if (elements.checkoutBtn) {
    elements.checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showMessage('Carrinho vazio', 'error');
        return;
      }
      
      if (!currentUser) {
        navigateTo('login');
        showMessage('Faça login para finalizar a compra', 'info');
        return;
      }
      
      toggleCart();
      navigateTo('checkout');
    });
  }
  
  updateCartUI();
}

function saveCartToStorage() {
  // Simulated storage for Netlify compatibility
  console.log('Cart saved:', cart);
}

function loadCartFromStorage() {
  // Simulated storage load
  console.log('Cart loaded');
}

// Checkout Functions
function renderCheckoutSummary() {
  const orderItems = document.getElementById('order-items');
  const orderSubtotal = document.getElementById('order-subtotal');
  const orderTotal = document.getElementById('order-total');
  
  if (!orderItems || !orderSubtotal || !orderTotal) return;
  
  orderItems.innerHTML = '';
  
  cart.forEach(item => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    
    orderItem.innerHTML = `
      <span>${item.nome} x${item.quantity}</span>
      <span>${formatPrice(item.preco * item.quantity)}</span>
    `;
    
    orderItems.appendChild(orderItem);
  });
  
  const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
  const shipping = 15.00;
  const total = subtotal + shipping;
  
  orderSubtotal.textContent = formatPrice(subtotal);
  orderTotal.textContent = formatPrice(total);
}

function initCheckout() {
  const checkoutForm = document.getElementById('checkout-form');
  if (!checkoutForm) return;
  
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    showLoading();
    
    // Simulate payment processing
    setTimeout(() => {
      hideLoading();
      
      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;
      
      if (success) {
        const orderNumber = Math.floor(Math.random() * 100000) + 10000;
        const orderTotal = cart.reduce((sum, item) => sum + (item.preco * item.quantity), 0) + 15;
        
        // Clear cart
        cart = [];
        updateCartUI();
        saveCartToStorage();
        
        // Show success page
        const orderDetails = document.getElementById('order-details');
        if (orderDetails) {
          orderDetails.innerHTML = `
            <p><strong>Número do Pedido:</strong> #${orderNumber}</p>
            <p><strong>Total:</strong> ${formatPrice(orderTotal)}</p>
            <p><strong>Entrega:</strong> Em até 5 dias úteis</p>
          `;
        }
        
        navigateTo('success');
        showMessage('Pedido realizado com sucesso!', 'success');
        
      } else {
        showMessage('Erro no processamento do pagamento. Tente novamente.', 'error');
      }
    }, 2000);
  });
}

// Seller Dashboard Functions
function initSellerDashboard() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetTab = document.getElementById(`${tabId}-tab`);
      if (targetTab) {
        targetTab.classList.add('active');
      }
    });
  });
  
  // Populate category options for add product form
  const productCategorySelect = document.getElementById('product-category');
  if (productCategorySelect) {
    productCategorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    appData.categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria;
      option.textContent = categoria;
      productCategorySelect.appendChild(option);
    });
  }
  
  // Add product form
  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newProduct = {
        id: appData.produtos.length + 1,
        nome: document.getElementById('product-name').value,
        preco: parseFloat(document.getElementById('product-price').value),
        categoria: document.getElementById('product-category').value,
        descricao: document.getElementById('product-description').value,
        estoque: parseInt(document.getElementById('product-stock').value),
        rating: 0,
        imagem: `https://via.placeholder.com/300x300/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${encodeURIComponent(document.getElementById('product-name').value.split(' ')[0])}`
      };
      
      appData.produtos.push(newProduct);
      renderProducts();
      renderSellerProducts();
      addProductForm.reset();
      
      showMessage('Produto adicionado com sucesso!', 'success');
      
      // Switch to products tab
      const productsTabBtn = document.querySelector('[data-tab="products"]');
      if (productsTabBtn) {
        productsTabBtn.click();
      }
    });
  }
  
  renderSellerProducts();
}

function renderSellerProducts() {
  const sellerProducts = document.getElementById('seller-products');
  if (!sellerProducts) return;
  
  sellerProducts.innerHTML = '';
  
  appData.produtos.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'seller-product-card fade-in';
    
    productCard.innerHTML = `
      <h4>${product.nome}</h4>
      <p><strong>Preço:</strong> ${formatPrice(product.preco)}</p>
      <p><strong>Categoria:</strong> ${product.categoria}</p>
      <p><strong>Estoque:</strong> ${product.estoque}</p>
      <p><strong>Avaliação:</strong> ${product.rating || 'N/A'}</p>
      <div class="product-actions">
        <button class="btn btn--sm btn--secondary" onclick="editProduct(${product.id})">Editar</button>
        <button class="btn btn--sm btn--outline" onclick="deleteProduct(${product.id})">Excluir</button>
      </div>
    `;
    
    sellerProducts.appendChild(productCard);
  });
}

function editProduct(productId) {
  const product = appData.produtos.find(p => p.id === productId);
  if (!product) return;
  
  showModal('Editar Produto', `
    <form id="edit-product-form">
      <div class="form-group">
        <label class="form-label">Nome do Produto</label>
        <input type="text" class="form-control" value="${product.nome}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Preço</label>
        <input type="number" class="form-control" value="${product.preco}" step="0.01" required>
      </div>
      <div class="form-group">
        <label class="form-label">Estoque</label>
        <input type="number" class="form-control" value="${product.estoque}" required>
      </div>
    </form>
  `, [
    { text: 'Cancelar', class: 'btn--outline', onclick: closeModal },
    { text: 'Salvar', class: 'btn--primary', onclick: () => saveProductChanges(productId) }
  ]);
}

function saveProductChanges(productId) {
  const form = document.getElementById('edit-product-form');
  const product = appData.produtos.find(p => p.id === productId);
  
  if (product && form) {
    const inputs = form.querySelectorAll('input');
    product.nome = inputs[0].value;
    product.preco = parseFloat(inputs[1].value);
    product.estoque = parseInt(inputs[2].value);
    
    renderProducts();
    renderSellerProducts();
    closeModal();
    showMessage('Produto atualizado com sucesso!', 'success');
  }
}

function deleteProduct(productId) {
  showModal('Confirmar Exclusão', 'Tem certeza que deseja excluir este produto?', [
    { text: 'Cancelar', class: 'btn--outline', onclick: closeModal },
    { text: 'Excluir', class: 'btn--primary', onclick: () => confirmDeleteProduct(productId) }
  ]);
}

function confirmDeleteProduct(productId) {
  appData.produtos = appData.produtos.filter(p => p.id !== productId);
  renderProducts();
  renderSellerProducts();
  closeModal();
  showMessage('Produto excluído com sucesso!', 'success');
}

// Modal Functions
function showModal(title, body, buttons = []) {
  if (!elements.modal || !elements.modalOverlay) return;
  
  elements.modalTitle.textContent = title;
  elements.modalBody.innerHTML = body;
  elements.modalFooter.innerHTML = '';
  
  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.className = `btn ${btn.class}`;
    button.textContent = btn.text;
    button.onclick = btn.onclick;
    elements.modalFooter.appendChild(button);
  });
  
  elements.modal.classList.remove('hidden');
  elements.modalOverlay.classList.remove('hidden');
}

function closeModal() {
  if (!elements.modal || !elements.modalOverlay) return;
  
  elements.modal.classList.add('hidden');
  elements.modalOverlay.classList.add('hidden');
}

// Initialize DOM elements
function initElements() {
  elements = {
    loading: document.getElementById('loading'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    loginBtn: document.getElementById('login-btn'),
    userName: document.getElementById('user-name'),
    cartBtn: document.getElementById('cart-btn'),
    cartCount: document.getElementById('cart-count'),
    productsGrid: document.getElementById('products-grid'),
    categoryFilter: document.getElementById('category-filter'),
    sortFilter: document.getElementById('sort-filter'),
    cartSidebar: document.getElementById('cart-sidebar'),
    cartOverlay: document.getElementById('cart-overlay'),
    cartClose: document.getElementById('cart-close'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    checkoutBtn: document.getElementById('checkout-btn'),
    modal: document.getElementById('modal'),
    modalOverlay: document.getElementById('modal-overlay'),
    modalClose: document.getElementById('modal-close'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalFooter: document.getElementById('modal-footer')
  };
}

// Event Listeners
function initEventListeners() {
  // Login button
  if (elements.loginBtn) {
    elements.loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentUser) {
        logout();
      } else {
        navigateTo('login');
      }
    });
  }
  
  // Modal close events
  if (elements.modalClose) {
    elements.modalClose.addEventListener('click', closeModal);
  }
  
  if (elements.modalOverlay) {
    elements.modalOverlay.addEventListener('click', closeModal);
  }
  
  // Escape key to close modal and cart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (elements.cartSidebar && elements.cartSidebar.classList.contains('open')) {
        toggleCart();
      }
    }
  });
}

// Initialization
function init() {
  try {
    // Initialize DOM elements first
    initElements();
    
    // Ensure modal is hidden on load
    closeModal();
    
    // Hide loading
    hideLoading();
    
    // Initialize all components
    initAuth();
    initSearch();
    initFilters();
    initCart();
    initCheckout();
    initEventListeners();
    
    // Initial render
    renderProducts();
    updateUserUI();
    
    console.log('E-commerce app initialized successfully');
    console.log('Ready for Supabase and Stripe integration');
    
  } catch (error) {
    console.error('Error initializing app:', error);
    showMessage('Erro ao inicializar aplicação', 'error');
  }
}

// Global functions (needed for inline event handlers)
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.navigateTo = navigateTo;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.showModal = showModal;
window.closeModal = closeModal;

// Start the application
document.addEventListener('DOMContentLoaded', init);