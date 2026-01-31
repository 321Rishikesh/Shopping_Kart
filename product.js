let params = new URLSearchParams(window.location.search);
let productId = params.get("id");

console.log("Product ID: ", productId);


if(!productId){
  const titleEl = document.getElementById('product-title');
  if(titleEl) titleEl.textContent = 'Product not specified';
} else {
  fetch(`https://dummyjson.com/products/${productId}`)
  .then(res => {
    if(!res.ok) throw new Error('Network response was not ok');
    return res.json();
  })
  .then(product => {
    console.log("Product data: ", product);


    const titleEl = document.getElementById("product-title");
    const imgEl = document.getElementById("product-image");
    const descEl = document.getElementById("product-description");
    const priceEl = document.getElementById("product-price");

    if(titleEl) titleEl.textContent = product.title;
    if(imgEl){
      imgEl.src = (product.thumbnail || (product.images && product.images[0])) || '';
      imgEl.alt = product.title;
    }
    if(descEl) descEl.textContent = product.description;
    if(priceEl) priceEl.textContent = `Price: $${product.price}`;

 
    let detailsList = document.getElementById("product-details-list");
    if(detailsList){
      detailsList.innerHTML = `
        <li>Brand: ${product.brand}</li>
        <li>Category: ${product.category}</li>
        <li>Rating: ${product.rating}</li>
        <li>Stock: ${product.stock}</li>
      `;
    }


    const addBtn = document.getElementById('add-to-cart-detail');
    if(addBtn){
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const item = { id: product.id, title: product.title, price: product.price };
        const raw = JSON.parse(localStorage.getItem('cart') || '[]');
        const cart = Array.isArray(raw) ? raw : [];
        const exists = cart.find(ci => ci.id === item.id);
        if(exists){ exists.qty = (exists.qty || 1) + 1; } else { cart.push({ ...item, qty: 1 }); }
        localStorage.setItem('cart', JSON.stringify(cart));

        
        const badge = document.getElementById('cart-count');
        if(badge){ badge.textContent = cart.reduce((s,it) => s + (it.qty||0), 0); badge.style.display = cart.length ? 'inline-block' : 'none'; }

        const prevText = addBtn.textContent;
        addBtn.textContent = 'Added';
        setTimeout(()=>{ addBtn.textContent = prevText; }, 1200);
      });
    }
  })
  .catch(err => {
    console.error('Failed to load product:', err);
    const titleEl = document.getElementById('product-title');
    if(titleEl) titleEl.textContent = 'Failed to load product.';
  });
}