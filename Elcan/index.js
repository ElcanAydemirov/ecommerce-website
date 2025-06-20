import { products,categories } from "./data.js";

// Global variables
let cart = []
let wishlist = []
let currentSlide = 0
let filteredProducts = []

// DOM elements
const productsGrid = document.getElementById("productsGrid")
const cartSidebar = document.getElementById("cartSidebar")
const wishlistSidebar = document.getElementById("wishlistSidebar")
const cartItems = document.getElementById("cartItems")
const wishlistItems = document.getElementById("wishlistItems")
const cartBadge = document.getElementById("cartBadge")
const wishlistBadge = document.getElementById("wishlistBadge")
const cartTotal = document.getElementById("cartTotal")
const searchInput = document.getElementById("searchInput")
const notification = document.getElementById("notification")
const notificationText = document.getElementById("notificationText")

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage()
  filteredProducts = [...products] // filter edilən listi də doldur
  renderProducts(filteredProducts)
  setupEventListeners()
  startSlider()
})


// Event listeners
function setupEventListeners() {
  // Search functionality
  searchInput.addEventListener("input", handleSearch)

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", handleFilter)
  })

  // Form submissions
  document.getElementById("loginForm").addEventListener("submit", handleLogin)
  document.getElementById("registerForm").addEventListener("submit", handleRegister)

  // Close modals on outside click
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideAllModals()
      }
    })
  })

  // Close sidebars on outside click
  document.addEventListener("click", (e) => {
    if (!cartSidebar.contains(e.target) && !e.target.closest(".cart-btn")) {
      cartSidebar.classList.remove("open")
    }
    if (!wishlistSidebar.contains(e.target) && !e.target.closest(".wishlist-btn")) {
      wishlistSidebar.classList.remove("open")
    }
  })
}

// Slider functionality
function startSlider() {
  setInterval(() => {
    changeSlide(1)
  }, 5000)
}

function changeSlide(direction) {
  const slides = document.querySelectorAll(".slide")
  const dots = document.querySelectorAll(".dot")

  slides[currentSlide].classList.remove("active")
  dots[currentSlide].classList.remove("active")

  currentSlide += direction

  if (currentSlide >= slides.length) currentSlide = 0
  if (currentSlide < 0) currentSlide = slides.length - 1

  slides[currentSlide].classList.add("active")
  dots[currentSlide].classList.add("active")
}

function goToSlide(index) {
  const slides = document.querySelectorAll(".slide")
  const dots = document.querySelectorAll(".dot")

  slides[currentSlide].classList.remove("active")
  dots[currentSlide].classList.remove("active")

  currentSlide = index

  slides[currentSlide].classList.add("active")
  dots[currentSlide].classList.add("active")
}

// Products rendering
function renderProducts(productsToRender = products) {
  productsGrid.innerHTML = ""

  productsToRender.forEach((product) => {
    const productCard = document.createElement("div")
    productCard.className = "product-card"
    productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-actions">
                    <button class="product-action-btn ${wishlist.some((item) => item.id === product.id) ? "active" : ""}" 
                            onclick="toggleWishlist(${product.id})" title="Bəyənilənlərə əlavə et">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${categories[product.category]}</div>
                <div class="product-title">${product.name}</div>
                <div class="product-price">${product.price}₼</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i>
                    Səbətə əlavə et
                </button>
            </div>
        `
    productsGrid.appendChild(productCard)
  })
}

// Search functionality
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase()
  filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm),
  )
  renderProducts(filteredProducts)
}

// Filter functionality
function handleFilter(e) {
  const filterValue = e.target.dataset.filter

  // Update active filter button
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  e.target.classList.add("active")

  // Filter products
  if (filterValue === "all") {
    filteredProducts = [...products]
  } else {
    filteredProducts = products.filter((product) => product.category === filterValue)
  }

  renderProducts(filteredProducts)
}

// Cart functionality
function addToCart(productId) {
  const product = products.find((p) => p.id === productId)
  const existingItem = cart.find((item) => item.id === productId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({ ...product, quantity: 1 })
  }

  updateCartUI()
  saveToStorage()
  showNotification("Məhsul səbətə əlavə edildi!", "success")
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId)
  updateCartUI()
  saveToStorage()
  showNotification("Məhsul səbətdən silindi!", "info")
}

function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId)
  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      removeFromCart(productId)
    } else {
      updateCartUI()
      saveToStorage()
    }
  }
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  cartBadge.textContent = totalItems
  cartTotal.textContent = totalPrice + "₼"

  console.log(cartItems);
  

  if (cart.length === 0) {
    cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Səbətiniz boşdur</p>
            </div>
        `
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${item.price}₼</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
      )
      .join("")
  }
}

function toggleCartView() {
  cartSidebar.classList.toggle("open")
  wishlistSidebar.classList.remove("open")
}

// Wishlist functionality
function toggleWishlist(productId) {
  const product = products.find((p) => p.id === productId)
  const existingIndex = wishlist.findIndex((item) => item.id === productId)

  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1)
    showNotification("Məhsul bəyənilənlərdən silindi!", "info")
  } else {
    wishlist.push(product)
    showNotification("Məhsul bəyənilənlərə əlavə edildi!", "success")
  }

  updateWishlistUI()
  renderProducts(filteredProducts)
  saveToStorage()
}

function updateWishlistUI() {
  wishlistBadge.textContent = wishlist.length

  if (wishlist.length === 0) {
    wishlistItems.innerHTML = `
            <div class="empty-wishlist">
                <i class="fas fa-heart"></i>
                <p>Bəyənilən məhsul yoxdur</p>
            </div>
        `
  } else {
    wishlistItems.innerHTML = wishlist
      .map(
        (item) => `
            <div class="wishlist-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${item.price}₼</div>
                </div>
                <button class="remove-btn" onclick="toggleWishlist(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
      )
      .join("")
  }
}

function toggleWishlistView() {
  wishlistSidebar.classList.toggle("open")
  cartSidebar.classList.remove("open")
}

// Modal functionality
function showLoginModal() {
  hideAllModals()
  document.getElementById("loginModal").classList.add("show")
}

function hideLoginModal() {
  document.getElementById("loginModal").classList.remove("show")
}

function showRegisterModal() {
  hideAllModals()
  document.getElementById("registerModal").classList.add("show")
}

function hideRegisterModal() {
  document.getElementById("registerModal").classList.remove("show")
}

function hideAllModals() {
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.classList.remove("show")
  })
}

// Form handling
function handleLogin(e) {
  e.preventDefault()
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  if (email && password) {
    showNotification("Giriş uğurlu oldu!", "success")
    hideLoginModal()
    // Here you would typically handle actual authentication
  } else {
    showNotification("Xahiş edirik bütün sahələri doldurun!", "error")
  }
}

function handleRegister(e) {
  e.preventDefault()
  const name = document.getElementById("registerName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value

  if (password !== confirmPassword) {
    showNotification("Şifrələr uyğun gəlmir!", "error")
    return
  }

  if (name && email && password) {
    showNotification("Qeydiyyat uğurlu oldu!", "success")
    hideRegisterModal()
    // Here you would typically handle actual registration
  } else {
    showNotification("Xahiş edirik bütün sahələri doldurun!", "error")
  }
}

// Notification system
function showNotification(message, type = "success") {
  notificationText.textContent = message

  // Set notification color based on type
  if (type === "success") {
    notification.style.background = "#27ae60"
  } else if (type === "error") {
    notification.style.background = "#e74c3c"
  } else if (type === "info") {
    notification.style.background = "#3498db"
  }

  notification.classList.add("show")

  setTimeout(() => {
    notification.classList.remove("show")
  }, 3000)
}

// Local storage
function saveToStorage() {
  localStorage.setItem("techstore_cart", JSON.stringify(cart))
  localStorage.setItem("techstore_wishlist", JSON.stringify(wishlist))
}

function loadFromStorage() {
  const savedCart = localStorage.getItem("techstore_cart")
  const savedWishlist = localStorage.getItem("techstore_wishlist")

  if (savedCart) {
    cart = JSON.parse(savedCart)
    updateCartUI()
  }

  if (savedWishlist) {
    wishlist = JSON.parse(savedWishlist)
    updateWishlistUI()
  }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

window.addToCart = addToCart
window.toggleWishlist = toggleWishlist
window.toggleCartView = toggleCartView
window.toggleWishlistView = toggleWishlistView
window.updateQuantity = updateQuantity
window.removeFromCart = removeFromCart
window.showLoginModal = showLoginModal
window.showRegisterModal = showRegisterModal
window.hideLoginModal = hideLoginModal
window.hideRegisterModal = hideRegisterModal
window.changeSlide = changeSlide
window.goToSlide = goToSlide
