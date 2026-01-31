
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById("history-container");
  const clearBtn = document.getElementById('clear-history');
  const viewBtn = document.getElementById('view-products-button');
  const headerTitle = document.getElementById('header-title');

 
  let mode = 'search';

  
  function loadSearches(){
    const raw = JSON.parse(localStorage.getItem("searchHistory") || '[]');
    return (Array.isArray(raw) ? raw : []).map(item => {
      if(!item) return null;
      if(typeof item === 'string') return { query: item, time: 0 };
      return { query: String(item.query || ''), time: Number(item.time) || 0 };
    }).filter(Boolean).sort((a,b) => b.time - a.time);
  }

  function loadViewed(){
    const raw = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    return (Array.isArray(raw) ? raw : []).map(item => {
      if(!item) return null;
      return { id: item.id, title: String(item.title || ''), thumb: item.thumb || '', time: Number(item.time) || 0 };
    }).filter(Boolean).sort((a,b) => b.time - a.time);
  }

  function renderSearches(){
    const normalized = loadSearches();
    container.innerHTML = '';
    if(normalized.length === 0){
      const p = document.createElement('p'); p.className='muted'; p.textContent='No recent searches.'; container.appendChild(p); return;
    }
    normalized.forEach(item => {
      const div = document.createElement('div'); div.className='history-item';
      const date = item.time ? new Date(item.time) : null; const formatted = date ? date.toLocaleString() : '—';
      div.innerHTML = `<strong class="term">${escapeHtml(item.query)}</strong><span class="time">${escapeHtml(formatted)}</span>`;
      div.addEventListener('click', () => { window.location.href = `search.html?search=${encodeURIComponent(item.query)}`; });
      container.appendChild(div);
    });
  }

  function renderViewed(){
    const viewed = loadViewed();
    container.innerHTML = '';
    if(viewed.length === 0){
      const p = document.createElement('p'); p.className='muted'; p.textContent='No viewed products yet.'; container.appendChild(p); return;
    }
    viewed.forEach(item => {
      const div = document.createElement('div'); div.className='history-item viewed-item';
      const date = item.time ? new Date(item.time) : null; const formatted = date ? date.toLocaleString() : '—';
      div.innerHTML = `
        <div style="display:flex;gap:10px;align-items:center;">
          <img src="${escapeHtml(item.thumb)}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:6px;" />
          <strong class="term">${escapeHtml(item.title)}</strong>
        </div>
        <span class="time">${escapeHtml(formatted)}</span>
      `;
      div.addEventListener('click', () => { window.location.href = `product-details.html?id=${encodeURIComponent(item.id)}`; });
      container.appendChild(div);
    });
  }

  
  function clearCurrent(){
    if(mode === 'search'){
      localStorage.removeItem('searchHistory');
    } else {
      localStorage.removeItem('viewedProducts');
    }
    renderCurrent();
  }

  function renderCurrent(){
    if(mode === 'search'){
      headerTitle.textContent = 'Recent searches';
      viewBtn.textContent = 'View Viewed Products';
      renderSearches();
    } else {
      headerTitle.textContent = 'Viewed products';
      viewBtn.textContent = 'View Searches';
      renderViewed();
    }
  }

  if(viewBtn){
    viewBtn.addEventListener('click', () => {
      mode = (mode === 'search') ? 'products' : 'search';
      renderCurrent();
    });
  }

  if(clearBtn){
    clearBtn.addEventListener('click', clearCurrent);
  }

  
  function escapeHtml(str){
    return String(str).replace(/[&<>\"']/g, (s)=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  
  renderCurrent();
});