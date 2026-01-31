
const productSection = document.getElementById("product-section");

const form = document.getElementById("search-form");
const searchbar = document.getElementById("search-bar");
const suggestionsList = document.getElementById("suggestions-list");

let currentPage = 1;
const itemsPerPage = 8;
let allProducts = [];

const prevBtn = document.getElementById("pagination-prev");
const nextBtn = document.getElementById("pagination-next");
const pageIndicator = document.getElementById("pagination-indicator");


fetch("https://dummyjson.com/products")
 
  .then(res => res.json())

  .then(({ products }) => {
    allProducts = products || [];
    renderPage(currentPage);
  })
 
  .catch(err => console.error("Fetch failed:", err));


function renderPage(page) {
  if (allProducts.length === 0) {
    productSection.innerHTML = "<p>No products available.</p>";
    if(prevBtn) prevBtn.disabled = true;
    if(nextBtn) nextBtn.disabled = true;
    if(pageIndicator) pageIndicator.textContent = "Page 0 of 0";
    return;
  }

  const totalPages = Math.max(1, Math.ceil(allProducts.length / itemsPerPage));
  currentPage = Math.min(Math.max(1, page), totalPages);

  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = allProducts.slice(start, start + itemsPerPage);

 
  productSection.innerHTML = "";


  pageItems.forEach(item => {
    const product = document.createElement("div"); 
    product.className = "product"; 

    
    product.innerHTML = `
      <img src="${item.thumbnail}" class="product-img" alt="${item.title}">
      <h3 class="product-title">${item.title}</h3>
      <p class="product-price">Price: $${item.price}</p>
      <div class="product-actions">
        <button class="add-to-cart" data-id="${item.id}">Add to cart</button>
      </div>
    `;

   
    productSection.appendChild(product);

    product.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart')) return; 
      try{
        const raw = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
        const viewed = Array.isArray(raw) ? raw : [];
       
        const filtered = viewed.filter(v => v.id !== item.id);
        filtered.unshift({ id: item.id, title: item.title, thumb: item.thumbnail || (item.images && item.images[0] || ''), time: Date.now() });
        const latest = filtered.slice(0, 50);
        localStorage.setItem('viewedProducts', JSON.stringify(latest));
      }catch(err){ console.warn('Could not record viewed product', err); }
      window.location.href = `product-details.html?id=${item.id}`;
    });

    
    const addBtn = product.querySelector('.add-to-cart');
    if(addBtn){
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
       
        addToCart({ id: item.id, title: item.title, price: item.price });
        
        const prev = addBtn.textContent;
        addBtn.textContent = 'Added';
        setTimeout(() => addBtn.textContent = prev, 1200);
      });
    }
  });

  
  if(pageIndicator) pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  if(prevBtn) prevBtn.disabled = currentPage <= 1;
  if(nextBtn) nextBtn.disabled = currentPage >= totalPages;

 
  if(prevBtn) prevBtn.onclick = () => { if(currentPage > 1) renderPage(currentPage - 1); };
  if(nextBtn) nextBtn.onclick = () => { if(currentPage < totalPages) renderPage(currentPage + 1); };


  const pagesContainer = document.getElementById('pagination-pages');
  if(pagesContainer){
    pagesContainer.innerHTML = '';
    const pages = getPageButtons(currentPage, totalPages, 7); 
    pages.forEach(p => {
      if(p === '...'){
        const el = document.createElement('span');
        el.className = 'page-ellipsis';
        el.textContent = '…';
        pagesContainer.appendChild(el);
      } else {
        const btn = document.createElement('button');
        btn.className = 'page-number' + (p === currentPage ? ' active' : '');
        btn.textContent = p;
        btn.addEventListener('click', () => renderPage(p));
        pagesContainer.appendChild(btn);
      }
    });
  }
}


function getPageButtons(current, total, maxSlots){
  if(total <= maxSlots) return Array.from({length: total}, (_,i)=>i+1);
  const res = [];
  const side = Math.floor((maxSlots - 3)/2);
  let start = Math.max(2, current - side);
  let end = Math.min(total - 1, current + side);

  if(current - 1 <= side){ start = 2; end = Math.max(2, 2 + 2*side); }
  if(total - current <= side){ end = total - 1; start = Math.min(total - 1 - 2*side, total - 1 - 2*side); }

  res.push(1);
  if(start > 2) res.push('...');
  for(let i = start; i <= end; i++) res.push(i);
  if(end < total - 1) res.push('...');
  res.push(total);
  return res;
}


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const query = searchbar.value.trim(); 
  if (!query) return; 
  
  console.log("Query: ",query); 


  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  console.log("History: ",history); 

  history = history.map(h => (typeof h === 'string') ? { query: h, time: 0 } : h);
  history = history.filter(h => h.query.toLowerCase() !== query.toLowerCase());

  history.unshift({ query: query, time: Date.now() });
  history = history.slice(0, 20);

  localStorage.setItem("searchHistory",JSON.stringify(history));

  window.location.href = `search.html?search=${encodeURIComponent(query)}`;
});

const viewHistoryBtn = document.getElementById('view-history-button');
if(viewHistoryBtn){
  viewHistoryBtn.addEventListener('click', () => {
    window.location.href = 'history.html';
  });
}

function addToCart(item){
  const raw = JSON.parse(localStorage.getItem('cart') || '[]');
  const cart = Array.isArray(raw) ? raw : [];
  const existing = cart.find(ci => ci.id === item.id);
  if(existing){
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ id: item.id, title: item.title, price: item.price, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  console.log('Cart updated', cart);
 
  updateCartBadge();
}


function getCartTotalQty(){
  const raw = JSON.parse(localStorage.getItem('cart') || '[]');
  const cart = Array.isArray(raw) ? raw : [];
  return cart.reduce((s, it) => s + (Number(it.qty) || 0), 0);
}


function updateCartBadge(){
  const badge = document.getElementById('cart-count');
  if(!badge) return;
  const total = getCartTotalQty();
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-block' : 'none';
}


const cartButton = document.getElementById('cart-button');
if(cartButton){
  cartButton.addEventListener('click', () => {
    
    const raw = JSON.parse(localStorage.getItem('cart') || '[]');
    if(raw.length === 0){
      alert('Your cart is empty');
    } else {
      const summary = raw.map(it => `${it.title} x${it.qty}`).join('\n');
      alert('Cart:\n' + summary);
    }
  });
}

updateCartBadge();
