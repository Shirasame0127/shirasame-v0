document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  
  if (path.endsWith('recipes.html')) {
    loadRecipes();
  } else if (path.endsWith('items.html')) {
    loadProductDetail();
  } else {
    loadProducts();
  }
});

function getApiBase() {
  const explicit = typeof window !== 'undefined' && window.__API_BASE__;
  if (explicit && typeof explicit === 'string' && explicit.length > 0) return explicit.replace(/\/$/, '');
  const origin = window.location.origin.replace(/\/$/, '');
  return origin;
}

async function safeFetchJson(cacheKey, url, opts) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), json }));
    } catch {}
    return json;
  } catch (err) {
    console.error('safeFetchJson error:', err);
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const { json } = JSON.parse(raw);
        return json;
      }
    } catch {}
    throw err;
  }
}

async function loadProductDetail() {
  const container = document.getElementById('product-detail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = '<div class="loading">Product ID not found.</div>';
    return;
  }

  try {
    const api = getApiBase();
    const json = await safeFetchJson(
      `cache:product:${id}`,
      `${api}/api/products?id=${encodeURIComponent(id)}`
    );
    const products = json.data || [];
    const product = products[0];

    if (!product) {
      container.innerHTML = '<div class="loading">Product not found.</div>';
      return;
    }

    document.title = `${product.title} - Shirasame Store`;

    const mainImage = product.images && product.images.length > 0 
      ? product.images[0].url 
      : 'https://placehold.co/600x600?text=No+Image';
    
    const price = product.price ? `¥${product.price.toLocaleString()}` : '';
    const description = product.body || product.shortDescription || '';

    container.innerHTML = `
      <div class="detail-images">
        <div class="main-image">
          <img src="${mainImage}" alt="${product.title}">
        </div>
      </div>
      <div class="detail-info">
        <h1>${product.title}</h1>
        <div class="detail-price">${price}</div>
        <div class="detail-description">${description}</div>
      </div>
    `;

  } catch (error) {
    console.error('Error loading product detail:', error);
    container.innerHTML = '<div class="loading">Failed to load product details.</div>';
  }
}

async function loadProducts() {
  const container = document.getElementById('product-list');
  if (!container) return;

  try {
    const api = getApiBase();
    const json = await safeFetchJson(
      'cache:products:shallow',
      `${api}/api/products?published=true&shallow=true`
    );
    const products = json.data || [];

    if (products.length === 0) {
      container.innerHTML = '<div class="loading">No products found.</div>';
      return;
    }

    container.innerHTML = products.map(product => {
      const imageUrl = product.image?.url || 'https://placehold.co/400x400?text=No+Image';
      const price = product.price ? `¥${product.price.toLocaleString()}` : '';
      
      return `
        <a href="/items.html?id=${product.id}" class="product-card">
          <div class="product-image">
            <img src="${imageUrl}" alt="${product.title}" loading="lazy">
          </div>
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">${price}</div>
        </a>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading products:', error);
    container.innerHTML = '<div class="loading">Failed to load products. Please try again later.</div>';
  }
}

async function loadRecipes() {
  const container = document.getElementById('recipe-list');
  if (!container) return;

  try {
    const api = getApiBase();
    const json = await safeFetchJson(
      'cache:recipes',
      `${api}/api/recipes`
    );
    const recipes = json.data || [];

    if (recipes.length === 0) {
      container.innerHTML = '<div class="loading">No recipes found.</div>';
      return;
    }

    container.innerHTML = recipes.map(recipe => {
      const imageUrl = recipe.imageDataUrl || 'https://placehold.co/400x400?text=No+Image';
      
      return `
        <div class="product-card">
          <div class="product-image">
            <img src="${imageUrl}" alt="${recipe.title}" loading="lazy">
          </div>
          <h3 class="product-title">${recipe.title}</h3>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading recipes:', error);
    container.innerHTML = '<div class="loading">Failed to load recipes.</div>';
  }
}
