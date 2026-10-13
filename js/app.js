
"use strict";

/* ==========================================
   MILK TEA & BEVERAGE SHOP POS
   STEP 3 - CORE FUNCTIONALITY
========================================== */

// Prices are stored as integer centavos.
const products = [
  {
    id: "classic",
    name: "Classic Milk Tea (Regular)",
    price: 5900
  },
  {
    id: "wintermelon",
    name: "Wintermelon Milk Tea (Regular)",
    price: 6500
  },
  {
    id: "taro",
    name: "Taro Milk Tea (Regular)",
    price: 6500
  },
  {
    id: "lychee",
    name: "Fruit Tea — Lychee (Regular)",
    price: 5500
  },
  {
    id: "brown-sugar",
    name: "Brown Sugar Milk Tea (Regular)",
    price: 6900
  },
  {
    id: "water",
    name: "Bottled Water",
    price: 2000
  }
];

// Application state
let cart = [];
let completedTransaction = null;
let transactionCounter = 0;

// HTML elements
const productGrid = document.getElementById("product-grid");
const cartItemsElement = document.getElementById("cart-items");
const cartItemTemplate = document.getElementById("cart-item-template");
const emptyCartElement = document.getElementById("empty-cart");

const itemCountElement = document.getElementById("item-count");
const subtotalDisplay = document.getElementById("subtotal-display");
const totalDisplay = document.getElementById("total-display");
const cartFeedback = document.getElementById("cart-feedback");

const paymentForm = document.getElementById("payment-form");
const cashInput = document.getElementById("cash-input");
const paymentError = document.getElementById("payment-error");
const changeDisplay = document.getElementById("change-display");
const confirmPaymentButton =
  document.getElementById("confirm-payment");

const successModal = document.getElementById("success-modal");
const successTotal = document.getElementById("success-total");
const successCash = document.getElementById("success-cash");
const successChange = document.getElementById("success-change");
const viewReceiptButton =
  document.getElementById("view-receipt-button");

const receiptModal = document.getElementById("receipt-modal");
const receiptReference = document.getElementById("receipt-reference");
const receiptDate = document.getElementById("receipt-date");
const receiptItems = document.getElementById("receipt-items");
const receiptTotal = document.getElementById("receipt-total");
const receiptCash = document.getElementById("receipt-cash");
const receiptChange = document.getElementById("receipt-change");
const newTransactionButton =
  document.getElementById("new-transaction-button");


/* ==========================================
   1. FORMAT MONEY
========================================== */

function formatCurrency(amountInCentavos) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountInCentavos / 100);
}


/* ==========================================
   2. FIND PRODUCT
========================================== */

function findProduct(productId) {
  return products.find(product => product.id === productId);
}


/* ==========================================
   3. RENDER PRODUCTS
========================================== */

// Product cards already exist in index.html.
// Attach the Add button actions to those cards.

function renderProducts() {
  const addButtons = productGrid.querySelectorAll(".add-button");

  addButtons.forEach(button => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.productId);
    });
  });
}


/* ==========================================
   4. ADD PRODUCT TO CART
========================================== */

function addToCart(productId) {
  if (completedTransaction !== null) {
    return;
  }

  const product = findProduct(productId);

  if (!product) {
    showCartFeedback("Product not found.", true);
    return;
  }

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    if (existingItem.quantity >= 999) {
      showCartFeedback("Maximum quantity is 999.", true);
      return;
    }

    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      quantity: 1
    });
  }

  showCartFeedback(product.name + " added to cart.");
  renderCart();
}


/* ==========================================
   5. UPDATE QUANTITY
========================================== */

function updateQuantity(productId, change) {
  if (completedTransaction !== null) {
    return;
  }

  const item = cart.find(cartItem => cartItem.id === productId);

  if (!item) {
    return;
  }

  const newQuantity = item.quantity + change;

  // A product must have at least one unit.
  if (newQuantity < 1) {
    showCartFeedback(
      "Minimum quantity is 1. Use Remove to delete this item.",
      true
    );
    return;
  }

  if (newQuantity > 999) {
    showCartFeedback("Maximum quantity is 999.", true);
    return;
  }

  item.quantity = newQuantity;

  hideCartFeedback();
  renderCart();
}


/* ==========================================
   6. REMOVE PRODUCT
========================================== */

function removeFromCart(productId) {
  if (completedTransaction !== null) {
    return;
  }

  cart = cart.filter(item => item.id !== productId);

  showCartFeedback("Item removed from cart.");
  renderCart();
}


/* ==========================================
   7. CALCULATE ITEM SUBTOTAL
========================================== */

function calculateItemSubtotal(item) {
  const product = findProduct(item.id);

  if (!product) {
    return 0;
  }

  return product.price * item.quantity;
}


/* ==========================================
   8. CALCULATE TOTAL
========================================== */

function calculateTotal() {
  return cart.reduce((total, item) => {
    return total + calculateItemSubtotal(item);
  }, 0);
}


/* ==========================================
   9. COUNT CART ITEMS
========================================== */

function getCartItemCount() {
  return cart.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
}


/* ==========================================
   10. RENDER CART
========================================== */

function renderCart() {
  cartItemsElement.replaceChildren();

  // Display the empty cart message when necessary.
  emptyCartElement.hidden = cart.length > 0;

  cart.forEach(item => {
    const product = findProduct(item.id);

    if (!product) {
      return;
    }

    const fragment = cartItemTemplate.content.cloneNode(true);

    const cartItemName =
      fragment.querySelector(".cart-item-name");
    const cartItemPrice =
      fragment.querySelector(".cart-item-price");
    const quantityValue =
      fragment.querySelector(".quantity-value");
    const cartItemSubtotal =
      fragment.querySelector(".cart-item-subtotal");

    const increaseButton =
      fragment.querySelector(".increase-button");
    const decreaseButton =
      fragment.querySelector(".decrease-button");
    const removeButton =
      fragment.querySelector(".remove-button");

    cartItemName.textContent = product.name;
    cartItemPrice.textContent =
      formatCurrency(product.price) + " each";

    quantityValue.textContent = item.quantity;

    cartItemSubtotal.textContent =
      formatCurrency(calculateItemSubtotal(item));

    increaseButton.setAttribute(
      "aria-label",
      "Increase " + product.name + " quantity"
    );

    decreaseButton.setAttribute(
      "aria-label",
      "Decrease " + product.name + " quantity"
    );

    removeButton.setAttribute(
      "aria-label",
      "Remove " + product.name
    );

    increaseButton.addEventListener("click", () => {
      updateQuantity(item.id, 1);
    });

    decreaseButton.addEventListener("click", () => {
      updateQuantity(item.id, -1);
    });

    removeButton.addEventListener("click", () => {
      removeFromCart(item.id);
    });

    cartItemsElement.appendChild(fragment);
  });

  const total = calculateTotal();
  const itemCount = getCartItemCount();

  itemCountElement.textContent =
    itemCount + (itemCount === 1 ? " Item" : " Items");

  subtotalDisplay.textContent = formatCurrency(total);
  totalDisplay.textContent = formatCurrency(total);

  // Recalculate the change when quantities change.
  updateChangePreview();

  confirmPaymentButton.disabled =
    cart.length === 0 || completedTransaction !== null;
}


/* ==========================================
   11. CART FEEDBACK
========================================== */

function showCartFeedback(message, isError = false) {
  cartFeedback.textContent = message;
  cartFeedback.hidden = false;
  cartFeedback.classList.toggle("is-error", isError);
}

function hideCartFeedback() {
  cartFeedback.textContent = "";
  cartFeedback.hidden = true;
  cartFeedback.classList.remove("is-error");
}


/* ==========================================
   12. PAYMENT ERRORS
========================================== */

function showPaymentError(message) {
  paymentError.textContent = message;
  paymentError.hidden = false;

  cashInput.setAttribute("aria-invalid", "true");

  cashInput.parentElement.classList.add("is-invalid");
}

function clearPaymentError() {
  paymentError.textContent = "";
  paymentError.hidden = true;

  cashInput.removeAttribute("aria-invalid");

  cashInput.parentElement.classList.remove("is-invalid");
}


/* ==========================================
   13. CONVERT CASH INPUT TO CENTAVOS
========================================== */

function parseCashAmount(value) {
  const amount = value.trim();

  // Accept non-negative amounts with up to 2 decimal places.
  // Examples: 250, 250.5, 250.50, .50
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(amount)) {
    return null;
  }

  const [pesosPart, centavosPart = ""] = amount.split(".");

  const pesos = Number(pesosPart || "0");
  const centavos = Number(centavosPart.padEnd(2, "0"));

  const totalCentavos = pesos * 100 + centavos;

  if (!Number.isSafeInteger(totalCentavos)) {
    return null;
  }

  return totalCentavos;
}


/* ==========================================
   14. VALIDATE PAYMENT
========================================== */

function validatePayment() {
  const total = calculateTotal();

  if (cart.length === 0 || total <= 0) {
    return {
      valid: false,
      message: "Please add at least one item to the cart."
    };
  }

  const amountPaid = parseCashAmount(cashInput.value);

  if (amountPaid === null) {
    return {
      valid: false,
      message: "Please enter a valid payment amount."
    };
  }

  if (amountPaid < total) {
    return {
      valid: false,
      message:
        "Insufficient payment. Please enter at least " +
        formatCurrency(total) + "."
    };
  }

  return {
    valid: true,
    amountPaid: amountPaid,
    total: total,
    change: amountPaid - total
  };
}


/* ==========================================
   15. LIVE CHANGE PREVIEW
========================================== */

function updateChangePreview() {
  if (completedTransaction !== null) {
    return;
  }

  const total = calculateTotal();
  const amountPaid = parseCashAmount(cashInput.value);

  // Never display a negative change.
  if (
    cart.length === 0 ||
    amountPaid === null ||
    amountPaid < total
  ) {
    changeDisplay.textContent = formatCurrency(0);
    return;
  }

  const change = amountPaid - total;

  changeDisplay.textContent = formatCurrency(change);
}


/* ==========================================
   16. GENERATE TRANSACTION REFERENCE
========================================== */

function generateTransactionReference() {
  transactionCounter += 1;

  const timestamp = Date.now().toString(36).toUpperCase();
  const sequence = transactionCounter.toString().padStart(3, "0");

  return "MT-" + timestamp + "-" + sequence;
}


/* ==========================================
   17. CONFIRM PAYMENT
========================================== */

function confirmPayment(event) {
  event.preventDefault();

  // Prevent the same transaction from being paid twice.
  if (completedTransaction !== null) {
    return;
  }

  clearPaymentError();

  const validation = validatePayment();

  if (!validation.valid) {
    showPaymentError(validation.message);
    return;
  }

  // Copy transaction details so receipt values stay fixed.
  const completedItems = cart.map(item => {
    const product = findProduct(item.id);

    return {
      id: product.id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      subtotal: product.price * item.quantity
    };
  });

  completedTransaction = {
    reference: generateTransactionReference(),
    date: new Date().toLocaleString("en-PH"),
    items: completedItems,
    total: validation.total,
    amountPaid: validation.amountPaid,
    change: validation.change
  };

  // Lock ordering controls after payment succeeds.
  productGrid.querySelectorAll(".add-button").forEach(button => {
    button.disabled = true;
  });

  cashInput.disabled = true;
  confirmPaymentButton.disabled = true;

  cartItemsElement.querySelectorAll("button").forEach(button => {
    button.disabled = true;
  });

  showPaymentSuccess();
}


/* ==========================================
   18. PAYMENT SUCCESS DIALOG
========================================== */

function showPaymentSuccess() {
  if (!completedTransaction) {
    return;
  }

  successTotal.textContent =
    formatCurrency(completedTransaction.total);

  successCash.textContent =
    formatCurrency(completedTransaction.amountPaid);

  successChange.textContent =
    formatCurrency(completedTransaction.change);

  successModal.hidden = false;

  viewReceiptButton.focus();
}


/* ==========================================
   19. GENERATE DIGITAL RECEIPT
========================================== */

function generateReceipt() {
  if (!completedTransaction) {
    return;
  }

  receiptReference.textContent =
    completedTransaction.reference;

  receiptDate.textContent =
    completedTransaction.date;

  receiptItems.replaceChildren();

  completedTransaction.items.forEach(item => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = item.name;

    const quantityCell = document.createElement("td");
    quantityCell.textContent = item.quantity;

    const priceCell = document.createElement("td");
    priceCell.textContent = formatCurrency(item.price);

    const subtotalCell = document.createElement("td");
    subtotalCell.textContent = formatCurrency(item.subtotal);

    row.append(
      nameCell,
      quantityCell,
      priceCell,
      subtotalCell
    );

    receiptItems.appendChild(row);
  });

  receiptTotal.textContent =
    formatCurrency(completedTransaction.total);

  receiptCash.textContent =
    formatCurrency(completedTransaction.amountPaid);

  receiptChange.textContent =
    formatCurrency(completedTransaction.change);
}


/* ==========================================
   20. SHOW DIGITAL RECEIPT
========================================== */

function showReceipt() {
  if (!completedTransaction) {
    return;
  }

  generateReceipt();

  successModal.hidden = true;
  receiptModal.hidden = false;

  newTransactionButton.focus();
}


/* ==========================================
   21. NEW TRANSACTION / RESET
========================================== */

function resetTransaction() {
  // Clear all previous transaction data.
  cart = [];
  completedTransaction = null;

  cashInput.value = "";
  cashInput.disabled = false;

  clearPaymentError();
  hideCartFeedback();

  changeDisplay.textContent = formatCurrency(0);

  successModal.hidden = true;
  receiptModal.hidden = true;

  // Remove previous receipt contents.
  receiptItems.replaceChildren();
  receiptReference.textContent = "—";
  receiptDate.textContent = "—";
  receiptTotal.textContent = formatCurrency(0);
  receiptCash.textContent = formatCurrency(0);
  receiptChange.textContent = formatCurrency(0);

  successTotal.textContent = formatCurrency(0);
  successCash.textContent = formatCurrency(0);
  successChange.textContent = formatCurrency(0);

  // Enable the product buttons for the next customer.
  productGrid.querySelectorAll(".add-button").forEach(button => {
    button.disabled = false;
  });

  renderCart();
}


/* ==========================================
   22. EVENT LISTENERS
========================================== */

paymentForm.addEventListener("submit", confirmPayment);

cashInput.addEventListener("input", () => {
  clearPaymentError();
  updateChangePreview();
});

viewReceiptButton.addEventListener("click", showReceipt);

newTransactionButton.addEventListener(
  "click",
  resetTransaction
);


/* ==========================================
   23. INITIALIZE APPLICATION
========================================== */

function initializeApp() {
  renderProducts();
  renderCart();

  clearPaymentError();
  hideCartFeedback();

  successModal.hidden = true;
  receiptModal.hidden = true;
}

// Start the application.
initializeApp();
