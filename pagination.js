let currentPage = 1;
const itemsPerPage = 8;
let allProducts = [];

let container = document.getElementById('product-list');
let prevBtn = document.getElementById('pagination-prev');
let nextBtn = document.getElementById('pagination-next');
let pageIndicator = document.getElementById('pagination-indicator');


console.log('pagination.js loaded — initial check', { containerExists: !!container, prevBtnExists: !!prevBtn, nextBtnExists: !!nextBtn, pageIndicatorExists: !!pageIndicator });
if(!container){
  console.warn('Pagination: #product-list not found at parse time — will retry when rendering.');
}


function fetchProducts(){
  
  container = document.getElementById('product-list') || container;
  if(container) container.innerHTML = '<p class="muted">Loading products...</p>';

  fetch("https://dummyjson.com/products")
  .then(res => {
    if(!res.ok) throw new Error('Network response not ok: ' + res.status);
    return res.json();
  })
  .then(({ products }) => {
    allProducts = products || [];
    if(!container) container = document.getElementById('product-list');

    if (allProducts.length === 0) {
      if(container) container.innerHTML = "<p>No products available.</p>";
      if(prevBtn) prevBtn.disabled = true;
      if(nextBtn) nextBtn.disabled = true;
      if(pageIndicator) pageIndicator.textContent = "Page 0 of 0";
      return;
    }
    renderPage(currentPage);
  })
  .catch(err => {
    console.error('Failed to fetch products:', err);
    if(!container){
      document.body.insertAdjacentHTML('afterbegin', '<div style="background:#fee;padding:12px;color:#611;">Pagination error: <strong>Could not load products</strong>. Check network or console for details.</div>');
    } else {
      container.innerHTML = `<div style="padding:12px;background:#fff;border-radius:8px;border:1px solid #fee;">Failed to load products. <button id="pagination-retry">Retry</button></div>`;
      const retry = document.getElementById('pagination-retry');
      if(retry) retry.addEventListener('click', fetchProducts);
    }
  });
}


fetchProducts();



function escapeHtml(str){ return String(str).replace(/[&<>"']/g, (s)=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }


function localAddToCart(item){
  if(typeof window.addToCart === 'function') { window.addToCart(item); return; }
  const raw = JSON.parse(localStorage.getItem('cart') || '[]');
  const cart = Array.isArray(raw) ? raw : [];
  const existing = cart.find(ci => ci.id === item.id);
  if(existing){ existing.qty = (existing.qty || 1) + 1; }
  else { cart.push({ id: item.id, title: item.title, price: item.price, qty: 1 }); }
  localStorage.setItem('cart', JSON.stringify(cart));
  if(typeof window.updateCartBadge === 'function') window.updateCartBadge();
}


function renderPage(page){
  
  if(!container) container = document.getElementById('product-list');
  if(!container){
    console.error('Cannot render page: #product-list not found.');
    return;
  }

  const totalPages = Math.max(1, Math.ceil(allProducts.length / itemsPerPage));
  currentPage = Math.min(Math.max(1, page), totalPages);

  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = allProducts.slice(start, start + itemsPerPage);


  container.innerHTML = pageItems.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img src="${escapeHtml(p.thumbnail || (p.images && p.images[0]) || '')}" alt="${escapeHtml(p.title)}" />
      <h3>${escapeHtml(p.title)}</h3>
      <p>Price: $${p.price}</p>
      <div class="product-actions"><button class="add-to-cart" data-id="${p.id}">Add to cart</button></div>
    </div>
  `).join('');

  console.log(`Rendered page ${currentPage} with ${pageItems.length} items (total products: ${allProducts.length})`);
 
  prevBtn = document.getElementById('pagination-prev') || prevBtn;
  nextBtn = document.getElementById('pagination-next') || nextBtn;
  pageIndicator = document.getElementById('pagination-indicator') || pageIndicator;

  
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
        const el = document.createElement('span'); el.className = 'page-ellipsis'; el.textContent = '…';
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

 
  Array.from(container.querySelectorAll('.add-to-cart')).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const prod = allProducts.find(x => x.id === id);
      if(prod){
        localAddToCart({ id: prod.id, title: prod.title, price: prod.price });
        const prev = btn.textContent;
        btn.textContent = 'Added';
        setTimeout(()=> btn.textContent = prev, 1000);
      }
    });
  });

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


  Array.from(container.querySelectorAll('.product-card')).forEach((card, idx) => {
    card.addEventListener('click', () => {
      const p = pageItems[idx];
      try{
        const raw = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
        const viewed = Array.isArray(raw) ? raw : [];
        const filtered = viewed.filter(v => v.id !== p.id);
        filtered.unshift({ id: p.id, title: p.title, thumb: p.thumbnail || (p.images && p.images[0] || ''), time: Date.now() });
        localStorage.setItem('viewedProducts', JSON.stringify(filtered.slice(0,50)));
      }catch(e){ console.warn('view record failed', e); }
      window.location.href = `product-details.html?id=${p.id}`;
    });
  });
}

