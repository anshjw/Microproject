let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Update cart count in header
function updateCartCount() {
  let el = document.getElementById("cart-count");
  if (el) {
    el.innerText = cart.reduce((a, b) => a + b.quantity, 0);
  }
}
updateCartCount();


function addToCart(name, price, image, btn) {
let card = btn.closest(".product-card, .product-box");


let existing = cart.find(item => item.name === name);
if (existing) {
existing.quantity += 1; // default to +1 every click
} else {
cart.push({ name, price, image, quantity: 1 });
}


localStorage.setItem("cart", JSON.stringify(cart));
updateCartCount();


let gotoCart = card.querySelector(".goto-cart");
if (gotoCart) gotoCart.style.display = "block";
 
  // ✅ Show confirmation message
  let msg = document.createElement("span");
  msg.innerText = "✔ Added to Cart";
  msg.style.color = "green";
  msg.style.fontSize = "14px";
  msg.style.marginLeft = "10px";

  // If already exists, remove old message
  let oldMsg = card.querySelector(".added-msg");
  if (oldMsg) oldMsg.remove();

  msg.classList.add("added-msg");
  btn.insertAdjacentElement("afterend", msg);

  // Auto-hide after 2 seconds
  setTimeout(() => {
    if (msg) msg.remove();
  }, 2000);

}

// Render cart page
function renderCart() {
  const cartContainer = document.getElementById("cart-items");
  const totalPriceEl = document.getElementById("total-price");
  if (!cartContainer) return;

  cartContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    cartContainer.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="info">
          <h3>${item.name}</h3>
          <p>Price: ₹${item.price}</p>
          <div class="qty">
            <button onclick="decreaseItem(${index})">-</button>
            <span>${item.quantity}</span>
            <button onclick="increaseItem(${index})">+</button>
          </div>
        </div>
        <button class="remove" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  totalPriceEl.innerText = "₹" + total;
}

// Cart item functions
function increaseItem(index) {
  cart[index].quantity++;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}
function decreaseItem(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}
// Demo product data
const products = [
  { name: "Compound Microscope", price: "₹65,000" },
  { name: "Analytical Balance", price: "₹45,000" },
  { name: "pH Meter", price: "₹12,000" },
  { name: "Glass Beaker Set", price: "₹2,400" }
];

const grid = document.getElementById("productGrid");
if (grid) {
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>Price: ${p.price}</p>
      <button>Add to Cart</button>
    `;
    grid.appendChild(card);
  });
}