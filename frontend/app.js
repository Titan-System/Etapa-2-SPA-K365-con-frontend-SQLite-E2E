const API_BASE = window.K365_API_BASE || "";
const FAVORITES_KEY = "k365-favorites";
const OFFER_PRODUCT_IDS = [1, 4];

const state = {
  products: [],
  selectedCategory: "Todos",
  search: "",
  favorites: loadFavorites(),
  cart: { items: [], total: 0, items_count: 0 },
  showEmptyCart: false,
};

const productsGrid = document.querySelector("#products-grid");
const layout = document.querySelector(".layout");
const cartPanel = document.querySelector("#carrito");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const cartBadge = document.querySelector("#cart-badge");
const heroCount = document.querySelector("#hero-count");
const checkoutButton = document.querySelector("#checkout-button");
const clearCartButton = document.querySelector("#clear-cart-button");
const cartToggleButton = document.querySelector("#cart-toggle-button");
const closeEmptyCartButton = document.querySelector("#close-empty-cart-button");
const toast = document.querySelector("#toast");
const searchInput = document.querySelector("#search-input");
const clearSearchButton = document.querySelector("#clear-search");
const catalogCount = document.querySelector("#catalog-count");

function loadFavorites() {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveFavorites() {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
}

function isFavorite(productId) {
  return Boolean(state.favorites[productId]);
}

function toggleFavorite(productId) {
  state.favorites[productId] = !state.favorites[productId];
  if (!state.favorites[productId]) {
    delete state.favorites[productId];
  }
  saveFavorites();
  renderProducts();
}

function formatCurrency(value) {
  return `$ ${Number(value).toLocaleString("es-AR")}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ocurrió un error inesperado");
  }

  return data;
}

function matchesCategory(product) {
  if (state.selectedCategory === "Todos") return true;
  if (state.selectedCategory === "Favoritos") return isFavorite(product.id);
  if (state.selectedCategory === "Ofertas") return OFFER_PRODUCT_IDS.includes(product.id);
  return product.category === state.selectedCategory;
}

function matchesSearch(product) {
  const term = state.search.trim().toLowerCase();
  if (!term) return true;

  const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
  return haystack.includes(term);
}

function getVisibleProducts() {
  return state.products.filter((product) => matchesCategory(product) && matchesSearch(product));
}

function renderProducts() {
  const filteredProducts = getVisibleProducts();
  catalogCount.textContent = `${filteredProducts.length} producto${filteredProducts.length === 1 ? "" : "s"}`;

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state">
        <p>No encontramos productos para ese filtro.</p>
        <small>Probá con otra categoría o una búsqueda más general.</small>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = filteredProducts.map((product) => {
    const favorite = isFavorite(product.id);
    const isOffer = OFFER_PRODUCT_IDS.includes(product.id);
    const previousPrice = isOffer ? Math.round(product.price * 1.1) : null;
    const cartItem = findCartItem(product.id);

    return `
      <article class="product-card" data-testid="product-card">
        <div class="product-card-top">
          <button
            class="favorite-button ${favorite ? "active" : ""}"
            data-product-id="${product.id}"
            type="button"
            aria-label="${favorite ? "Quitar de favoritos" : "Agregar a favoritos"}"
            title="${favorite ? "Quitar de favoritos" : "Agregar a favoritos"}"
          >❤</button>

          <div class="product-image-shell">
            <img class="product-image" src="${product.image_url}" alt="${product.name}" loading="lazy" />
            ${isOffer ? '<span class="offer-badge"><span>10%</span></span>' : ""}
          </div>

          <button
            class="add-circle-button ${cartItem ? "in-cart" : ""}"
            data-product-id="${product.id}"
            type="button"
            aria-label="Agregar"
            title="Agregar"
          >${cartItem ? cartItem.quantity : "+"}</button>
        </div>

        <div class="product-content">
          <strong class="product-price">${formatCurrency(product.price)}</strong>
          ${previousPrice ? `<span class="product-old-price">${formatCurrency(previousPrice)}</span>` : '<span class="product-old-price empty"></span>'}
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <span class="product-category">${product.category}</span>
        </div>
      </article>
    `;
  }).join("");
}

function findCartItem(productId) {
  return state.cart.items.find((item) => item.product.id === productId);
}

function updateCartVisibility(cart) {
  const isEmpty = cart.items_count === 0;
  const shouldHideCart = isEmpty && !state.showEmptyCart;

  cartPanel.classList.toggle("is-hidden", shouldHideCart);
  layout.classList.toggle("cart-hidden", shouldHideCart);
  cartToggleButton.classList.toggle("show", shouldHideCart);
  closeEmptyCartButton.classList.toggle("show", isEmpty && state.showEmptyCart);
}

function renderCart(cart) {
  state.cart = cart;

  if (cart.items_count > 0) {
    state.showEmptyCart = false;
  }

  cartBadge.textContent = cart.items_count;
  cartTotal.textContent = formatCurrency(cart.total);
  heroCount.textContent = `${Math.round(cart.total * 0.1)} ✨`;

  checkoutButton.disabled = cart.items_count === 0;
  clearCartButton.disabled = cart.items_count === 0;

  updateCartVisibility(cart);

  if (state.products.length > 0) {
    renderProducts();
  }

  if (cart.items.length === 0) {
    cartItems.innerHTML = `
      <p class="cart-empty">Todavía no agregaste productos.<br />Elegí algo del catálogo para empezar.</p>
    `;
    return;
  }

  cartItems.innerHTML = cart.items.map((item) => `
    <article class="cart-item" data-testid="cart-item">
      <img class="cart-item-image" src="${item.product.image_url}" alt="${item.product.name}" loading="lazy" />

      <div class="cart-item-main">
        <div class="cart-item-info">
          <strong class="cart-item-name">${item.product.name}</strong>
          <span class="cart-item-price">${formatCurrency(item.product.price)}</span>
        </div>

        <div class="cart-item-controls">
          <div class="qty-pill" aria-label="Cantidad del producto">
            <button class="qty-button decrement-button" data-product-id="${item.product.id}" type="button" aria-label="Disminuir cantidad">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-button increment-button" data-product-id="${item.product.id}" type="button" aria-label="Incrementar cantidad">+</button>
          </div>
          <button class="remove-button" data-product-id="${item.product.id}" type="button" aria-label="Eliminar" title="Eliminar">
            <span aria-hidden="true">🗑</span>
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

async function loadProducts() {
  const data = await fetchJson("/api/products");
  state.products = data.products;
  renderProducts();
}

async function loadCart() {
  const cart = await fetchJson("/api/cart");
  renderCart(cart);
}

async function addProduct(productId, quantity = 1) {
  const cart = await fetchJson("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  renderCart(cart);
}

async function removeProduct(productId) {
  const cart = await fetchJson(`/api/cart/items/${productId}`, { method: "DELETE" });
  renderCart(cart);
}

async function decrementProduct(productId) {
  const cartItem = findCartItem(productId);
  if (!cartItem) return;

  if (cartItem.quantity <= 1) {
    await removeProduct(productId);
    showToast("Producto eliminado del carrito");
    return;
  }

  await removeProduct(productId);
  await addProduct(productId, cartItem.quantity - 1);
  showToast("Cantidad actualizada");
}

async function incrementProduct(productId) {
  await addProduct(productId, 1);
  showToast("Producto agregado al carrito");
}

async function clearCart() {
  const cart = await fetchJson("/api/cart", { method: "DELETE" });
  state.showEmptyCart = false;
  renderCart(cart);
  showToast("Carrito vaciado");
}

async function checkout() {
  const data = await fetchJson("/api/cart/checkout", { method: "POST" });
  await loadCart();
  showToast(`Compra #${data.order.id} confirmada por ${formatCurrency(data.order.total)}`);
}

productsGrid.addEventListener("click", async (event) => {
  const addButton = event.target.closest(".add-circle-button");
  const favoriteButton = event.target.closest(".favorite-button");

  if (favoriteButton) {
    toggleFavorite(Number(favoriteButton.dataset.productId));
    showToast(isFavorite(Number(favoriteButton.dataset.productId)) ? "Producto agregado a favoritos" : "Producto quitado de favoritos");
    return;
  }

  if (!addButton) return;

  try {
    await addProduct(Number(addButton.dataset.productId));
    showToast("Producto agregado al carrito");
  } catch (error) {
    showToast(error.message);
  }
});

cartItems.addEventListener("click", async (event) => {
  const removeButton = event.target.closest(".remove-button");
  const decrementButton = event.target.closest(".decrement-button");
  const incrementButton = event.target.closest(".increment-button");

  try {
    if (removeButton) {
      await removeProduct(Number(removeButton.dataset.productId));
      showToast("Producto eliminado del carrito");
      return;
    }

    if (decrementButton) {
      await decrementProduct(Number(decrementButton.dataset.productId));
      return;
    }

    if (incrementButton) {
      await incrementProduct(Number(incrementButton.dataset.productId));
      return;
    }
  } catch (error) {
    showToast(error.message);
  }
});

document.querySelectorAll(".chip-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".chip-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.selectedCategory = button.dataset.category;
    renderProducts();
  });
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  state.search = "";
  renderProducts();
  searchInput.focus();
});

cartToggleButton.addEventListener("click", () => {
  state.showEmptyCart = true;
  renderCart(state.cart);
});

closeEmptyCartButton.addEventListener("click", () => {
  state.showEmptyCart = false;
  renderCart(state.cart);
});

clearCartButton.addEventListener("click", async () => {
  try {
    await clearCart();
  } catch (error) {
    showToast(error.message);
  }
});

checkoutButton.addEventListener("click", async () => {
  try {
    await checkout();
  } catch (error) {
    showToast(error.message);
  }
});

async function init() {
  try {
    await loadProducts();
    await loadCart();
  } catch (error) {
    productsGrid.innerHTML = `<p class="cart-empty">No se pudo conectar con la API. Revisá que el backend esté funcionando.</p>`;
    showToast(error.message);
  }
}

init();
