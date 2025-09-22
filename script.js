let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Update cart count in header
function updateCartCount() {
  let el = document.getElementById("cart-count");
  if (el) {
    el.innerText = cart.reduce((a, b) => a + b.quantity, 0);
  }
}
updateCartCount();

// Increase/Decrease qty before adding
function increaseQty(btn) {
  let span = btn.previousElementSibling;
  span.innerText = parseInt(span.innerText) + 1;
}
function decreaseQty(btn) {
  let span = btn.nextElementSibling;
  let value = parseInt(span.innerText);
  if (value > 0) span.innerText = value - 1;
}

// Add item to cart with chosen quantity
function addToCart(name, price, image, btn) {
  let card = btn.closest(".product-card");
  let qtySpan = card.querySelector(".qty-controls span");
  let qty = parseInt(qtySpan.innerText);

  if (qty <= 0) {
    alert("Please select at least 1 quantity!");
    return;
  }

  let item = cart.find(p => p.name === name);
  if (item) {
    item.quantity += qty;
  } else {
    cart.push({ name, price, image, quantity: qty });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  // Show "Go to Cart" link
  let gotoCart = document.querySelector(".goto-cart");
  if (gotoCart) gotoCart.style.display = "block";

  // reset qty to 0
  qtySpan.innerText = "0";
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