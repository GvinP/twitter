// --- Telegram WebApp bootstrap -------------------------------------------
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
const insideTelegram = !!(tg && tg.initData);

if (tg) {
  tg.ready();
  tg.expand();
  applyThemeFromTelegram();
  tg.onEvent && tg.onEvent("themeChanged", applyThemeFromTelegram);
}

document.getElementById("tgBanner").hidden = insideTelegram;

function applyThemeFromTelegram() {
  const p = tg.themeParams || {};
  const root = document.documentElement.style;
  if (p.bg_color) root.setProperty("--bg", p.bg_color);
  if (p.text_color) root.setProperty("--text", p.text_color);
  if (p.hint_color) root.setProperty("--text-hint", p.hint_color);
  if (p.secondary_bg_color) root.setProperty("--card", p.secondary_bg_color);
  if (p.button_color) root.setProperty("--accent", p.button_color);
}

const user = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
document.getElementById("hello").textContent = user && user.first_name
  ? `Привет, ${user.first_name}! 👋`
  : "Привет! 👋";

// --- Menu data --------------------------------------------------------------
const CATEGORIES = [
  { id: "burgers", name: "Бургеры" },
  { id: "combo", name: "Комбо" },
  { id: "sides", name: "Гарниры" },
  { id: "drinks", name: "Напитки" },
];

const PRODUCTS = [
  { id: "classic", cat: "burgers", emoji: "🍔", name: "Классик Смок", desc: "Говядина, чеддер, соус смок", price: 349 },
  { id: "double", cat: "burgers", emoji: "🍔🔥", name: "Дабл Флейм", desc: "Двойная котлета, бекон, барбекю", price: 469 },
  { id: "chicken", cat: "burgers", emoji: "🐔", name: "Кранч Чикен", desc: "Хрустящая курица, слав, майо", price: 329 },
  { id: "veggie", cat: "burgers", emoji: "🥬", name: "Вегги Грин", desc: "Растительная котлета, авокадо", price: 359 },
  { id: "combo1", cat: "combo", emoji: "🍔🍟", name: "Комбо Классик", desc: "Классик Смок + картошка + напиток", price: 549 },
  { id: "combo2", cat: "combo", emoji: "🍔🍟🥤", name: "Комбо Дабл", desc: "Дабл Флейм + картошка + напиток", price: 649 },
  { id: "fries", cat: "sides", emoji: "🍟", name: "Картофель фри", desc: "С соусом на выбор", price: 149 },
  { id: "rings", cat: "sides", emoji: "🧅", name: "Луковые кольца", desc: "Хрустящая панировка", price: 179 },
  { id: "nuggets", cat: "sides", emoji: "🍗", name: "Наггетсы", desc: "8 штук, соус в подарок", price: 219 },
  { id: "cola", cat: "drinks", emoji: "🥤", name: "Кола", desc: "0.4 л", price: 99 },
  { id: "lemonade", cat: "drinks", emoji: "🍋", name: "Лимонад", desc: "Домашний, 0.4 л", price: 129 },
  { id: "shake", cat: "drinks", emoji: "🥛", name: "Милкшейк", desc: "Ваниль или шоколад", price: 189 },
];

// --- State --------------------------------------------------------------
const cart = {}; // id -> qty
let activeCat = "burgers";

const grid = document.getElementById("productGrid");
const tabsEl = document.getElementById("tabs");
const cartBadge = document.getElementById("cartBadge");
const cartBtn = document.getElementById("cartBtn");
const cartSheet = document.getElementById("cartSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const fallbackBar = document.getElementById("fallbackBar");
const fallbackCount = document.getElementById("fallbackCount");
const fallbackSum = document.getElementById("fallbackSum");

function money(n) {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

function renderTabs() {
  tabsEl.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "tab" + (cat.id === activeCat ? " active" : "");
    btn.textContent = cat.name;
    btn.addEventListener("click", () => {
      activeCat = cat.id;
      renderTabs();
      renderGrid();
    });
    tabsEl.appendChild(btn);
  });
}

function renderGrid() {
  grid.innerHTML = "";
  PRODUCTS.filter((p) => p.cat === activeCat).forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    const qty = cart[p.id] || 0;
    card.innerHTML = `
      <div class="card-emoji">${p.emoji}</div>
      <div class="card-name">${p.name}</div>
      <div class="card-desc">${p.desc}</div>
      <div class="card-bottom">
        <span class="card-price">${money(p.price)}</span>
      </div>
      <div class="card-action"></div>
    `;
    const actionSlot = card.querySelector(".card-action");
    actionSlot.appendChild(renderQtyControl(p, qty));
    grid.appendChild(card);
  });
}

function renderQtyControl(product, qty) {
  const wrap = document.createElement("div");
  if (qty > 0) {
    wrap.className = "stepper";
    wrap.innerHTML = `
      <button class="minus" aria-label="Убрать">−</button>
      <span class="qty">${qty}</span>
      <button class="plus" aria-label="Добавить">+</button>
    `;
    wrap.querySelector(".minus").addEventListener("click", () => changeQty(product.id, -1));
    wrap.querySelector(".plus").addEventListener("click", () => changeQty(product.id, 1));
  } else {
    const btn = document.createElement("button");
    btn.className = "add-btn";
    btn.textContent = "Добавить";
    btn.addEventListener("click", () => changeQty(product.id, 1));
    wrap.appendChild(btn);
  }
  return wrap;
}

function changeQty(id, delta) {
  const next = (cart[id] || 0) + delta;
  if (next <= 0) delete cart[id];
  else cart[id] = next;

  haptic("light");
  renderGrid();
  renderCart();
  updateOrderControl();
}

function cartEntries() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === id), qty }))
    .filter((e) => e.product);
}

function cartTotal() {
  return cartEntries().reduce((sum, e) => sum + e.product.price * e.qty, 0);
}

function cartCount() {
  return cartEntries().reduce((sum, e) => sum + e.qty, 0);
}

function renderCart() {
  const entries = cartEntries();
  const count = cartCount();

  cartBadge.hidden = count === 0;
  cartBadge.textContent = String(count);

  if (entries.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Пока пусто. Добавьте что-нибудь вкусное 👀</p>`;
  } else {
    cartItemsEl.innerHTML = entries
      .map(
        (e) => `
        <div class="cart-row">
          <div class="cart-row-name"><span class="e">${e.product.emoji}</span>${e.product.name} × ${e.qty}</div>
          <div class="cart-row-price">${money(e.product.price * e.qty)}</div>
        </div>`
      )
      .join("");
  }
  cartTotalEl.textContent = money(cartTotal());

  fallbackCount.textContent = String(count);
  fallbackSum.textContent = money(cartTotal());
}

function updateOrderControl() {
  const count = cartCount();
  if (tg) {
    if (count > 0) {
      tg.MainButton.setText(`Оформить · ${money(cartTotal())}`);
      tg.MainButton.show();
    } else {
      tg.MainButton.hide();
    }
    fallbackBar.hidden = true;
  } else {
    fallbackBar.hidden = count === 0;
  }
}

function submitOrder() {
  const entries = cartEntries();
  if (entries.length === 0) return;

  const payload = {
    items: entries.map((e) => ({ id: e.product.id, name: e.product.name, qty: e.qty, price: e.product.price })),
    total: cartTotal(),
  };

  if (tg) {
    haptic("medium");
    tg.sendData(JSON.stringify(payload));
  } else {
    alert(`Демо-заказ на ${money(cartTotal())} 🎉\n(в реальном боте это уйдёт в чат через tg.sendData)`);
  }
}

function haptic(style) {
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
}

// --- Cart sheet open/close -----------------------------------------------
function openSheet() {
  cartSheet.classList.add("open");
  sheetBackdrop.classList.add("open");
}
function closeSheet() {
  cartSheet.classList.remove("open");
  sheetBackdrop.classList.remove("open");
}

cartBtn.addEventListener("click", openSheet);
sheetBackdrop.addEventListener("click", closeSheet);
document.getElementById("sheetClose").addEventListener("click", closeSheet);
document.getElementById("fallbackOrder").addEventListener("click", submitOrder);

if (tg) {
  tg.MainButton.onClick(submitOrder);
}

// --- Init -----------------------------------------------------------------
renderTabs();
renderGrid();
renderCart();
updateOrderControl();
