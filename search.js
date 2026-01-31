const params = new URLSearchParams(window.location.search);
const query = params.get("search") || "";

const productSection = document.getElementById("product-section");
const form = document.getElementById("search-form");
const searchbar = document.getElementById("search-bar");

searchbar.value = query;


fetch("https://dummyjson.com/products")
 
  .then(res => res.json())
  
  .then(({ products }) => {
    const filtered = products.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase())
    );

    
    productSection.innerHTML = "";

    
    if (filtered.length === 0) {
      productSection.innerHTML = "<p>No products found.</p>";
      return;
    }

    
    filtered.forEach(item => {
      const product = document.createElement("div"); 
      product.className = "product";

      
      product.innerHTML = `
        <img src="${item.thumbnail}" class="product-img" alt="${item.title}">
        <h3 class="product-title">${item.title}</h3>
        <p class="product-price">Price: $${item.price}</p>
      `;

     
      productSection.appendChild(product);
    });
  })
  
  .catch(err => console.error("Product fetch failed:", err));


form.addEventListener("submit", (e) => {
  e.preventDefault(); 

  const value = searchbar.value.trim(); 
  if (!value) return; 

  
  window.location.href = `search.html?search=${encodeURIComponent(value)}`;
});
