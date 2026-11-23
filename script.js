
const books = [
  {
    id: 1,
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    category: "Clássicos",
    price: 29.90,
    tag: "Queridinho",
    image: "https://covers.openlibrary.org/b/id/8231856-L.jpg"
  },
  {
    id: 2,
    title: "O Hobbit",
    author: "J. R. R. Tolkien",
    category: "Fantasia",
    price: 44.90,
    tag: "Aventura",
    image: "https://covers.openlibrary.org/b/id/6979861-L.jpg"
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    category: "Ficção",
    price: 34.90,
    tag: "Clássico",
    image: "https://covers.openlibrary.org/b/id/7222246-L.jpg"
  },
  {
    id: 4,
    title: "Coraline",
    author: "Neil Gaiman",
    category: "Fantasia",
    price: 39.90,
    tag: "Fantasia",
    image: "https://covers.openlibrary.org/b/id/8739161-L.jpg"
  },
  {
    id: 5,
    title: "O Médico e o Monstro",
    author: "Robert Louis Stevenson",
    category: "Mistério",
    price: 24.90,
    tag: "Suspense",
    image: "https://covers.openlibrary.org/b/id/8235116-L.jpg"
  },
  {
    id: 6,
    title: "Noites Brancas",
    author: "Fiódor Dostoiévski",
    category: "Clássicos",
    price: 27.90,
    tag: "Literatura",
    image: "https://covers.openlibrary.org/b/id/8231851-L.jpg"
  },
  {
    id: 7,
    title: "O Alquimista",
    author: "Paulo Coelho",
    category: "Ficção",
    price: 32.90,
    tag: "Descoberta",
    image: "https://covers.openlibrary.org/b/id/8231990-L.jpg"
  },
  {
    id: 8,
    title: "Hábitos Atômicos",
    author: "James Clear",
    category: "Desenvolvimento",
    price: 49.90,
    tag: "Ideias",
    image: "https://covers.openlibrary.org/b/id/9259251-L.jpg"
  }
];

// CONFIGURAÇÕES PIX

const PIX_RECEIVER_KEY = "caldasathur@gmail.com";
const PIX_MERCHANT_NAME = "LIVRARIA BOOKLAND";
const PIX_MERCHANT_CITY = "ZE DOCA";

// Carrinho

let cart = [];
let activeCategory = "Todos";

const money = value =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

const grid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");

// ELEMENTOS DO CARRINHO

const drawer = document.getElementById("cart-drawer");
const overlay = document.getElementById("overlay");

const checkoutModal = document.getElementById("checkout-modal");
const checkoutForm = document.getElementById("checkout-form");
const pixResult = document.getElementById("pix-result");

// MOSTRAR LIVROS

function renderBooks() {
  const term = searchInput.value
    .trim()
    .toLocaleLowerCase("pt-BR");

  const filtered = books.filter(book =>
    (
      activeCategory === "Todos" ||
      book.category === activeCategory
    ) &&
    (
      book.title.toLocaleLowerCase("pt-BR").includes(term) ||
      book.author.toLocaleLowerCase("pt-BR").includes(term)
    )
  );

  grid.innerHTML = filtered.map(book => `
    <article class="product-card">

      <div class="book-cover">
        <span class="book-tag">${book.tag}</span>

        <img
          src="${book.image}"
          alt="Capa do livro ${book.title}"
          loading="lazy"
          onerror="this.src='https://placehold.co/300x430/e8dfce/59432f?text=Livro'"
        >
      </div>

      <div class="product-info">

        <span class="product-category">
          ${book.category}
        </span>

        <h3>${book.title}</h3>

        <p class="author">${book.author}</p>

        <div class="product-bottom">

          <span class="price">
            ${money(book.price)}
          </span>

          <button
            class="add-button"
            data-add="${book.id}"
          >
            + Adicionar
          </button>

        </div>
      </div>
    </article>
  `).join("");

  document.getElementById("empty-state").hidden =
    filtered.length !== 0;
}

// ADICIONAR AO CARRINHO

function addToCart(id) {
  const item = cart.find(entry => entry.id === id);

  if (item) {
    item.quantity++;
  } else {
    cart.push({
      id: id,
      quantity: 1
    });
  }

  renderCart();
  showToast("Livro adicionado à sua sacola!");
}

// ALTERAR QUANTIDADE

function changeQuantity(id, delta) {
  const item = cart.find(entry => entry.id === id);

  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry.id !== id);
  }

  renderCart();
}

// CALCULAR TOTAL

function getCartTotal() {
  return cart.reduce((total, item) => {
    const book = books.find(entry => entry.id === item.id);

    return total + book.price * item.quantity;
  }, 0);
}

// ATUALIZAR CARRINHO

function renderCart() {
  const count = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = getCartTotal();

  document.getElementById("cart-count").textContent = count;

  document.getElementById("cart-total").textContent =
    money(total);

  const container = document.getElementById("cart-items");

  if (cart.length === 0) {
    container.innerHTML = `
      <p class="cart-empty">
        Sua sacola ainda está vazia.<br>
        Que tal encontrar uma nova história?
      </p>
    `;

    return;
  }

  container.innerHTML = cart.map(item => {
    const book = books.find(entry => entry.id === item.id);

    return `
      <div class="cart-row">

        <img src="${book.image}" alt="${book.title}">

        <div>
          <h4>${book.title}</h4>

          <small>${money(book.price)}</small>

          <div class="quantity">

            <button
              data-change="${book.id}"
              data-delta="-1"
            >−</button>

            <span>${item.quantity}</span>

            <button
              data-change="${book.id}"
              data-delta="1"
            >+</button>

          </div>
        </div>

        <div>
          <strong>
            ${money(book.price * item.quantity)}
          </strong>

          <br>

          <button
            class="remove-button"
            data-remove="${book.id}"
          >
            Remover
          </button>
        </div>

      </div>
    `;
  }).join("");
}

// ABRIR E FECHAR CARRINHO

function openCart() {
  drawer.classList.add("open");
  overlay.classList.add("visible");

  drawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  drawer.classList.remove("open");
  overlay.classList.remove("visible");

  drawer.setAttribute("aria-hidden", "true");
}

// NOTIFICAÇÕES

let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// EVENTOS DOS LIVROS

grid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");

  if (button) {
    addToCart(Number(button.dataset.add));
  }
});

// FILTROS

document.getElementById("filters").addEventListener(
  "click",
  event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    activeCategory = button.dataset.category;

    document.querySelectorAll(".filter").forEach(filter => {
      filter.classList.toggle("active", filter === button);
    });

    renderBooks();
  }
);

// PESQUISA

searchInput.addEventListener("input", renderBooks);

// EVENTOS DO CARRINHO

document.getElementById("cart-items").addEventListener(
  "click",
  event => {

    const change = event.target.closest("[data-change]");
    const remove = event.target.closest("[data-remove]");

    if (change) {
      changeQuantity(
        Number(change.dataset.change),
        Number(change.dataset.delta)
      );
    }

    if (remove) {
      cart = cart.filter(
        item => item.id !== Number(remove.dataset.remove)
      );

      renderCart();
    }
  }
);

// BOTÕES DO CARRINHO

document.getElementById("cart-open")
  .addEventListener("click", openCart);

document.getElementById("cart-close")
  .addEventListener("click", closeCart);

overlay.addEventListener("click", closeCart);

// CHECKOUT

function openCheckout() {
  if (cart.length === 0) {
    showToast("Adicione pelo menos um livro à sacola.");
    return;
  }

  closeCart();

  checkoutForm.hidden = false;
  pixResult.hidden = true;

  document.getElementById("checkout-total").textContent =
    money(getCartTotal());

  checkoutModal.classList.add("visible");
}

function closeCheckout() {
  checkoutModal.classList.remove("visible");
}

document.getElementById("checkout-button")
  .addEventListener("click", openCheckout);

document.getElementById("checkout-close")
  .addEventListener("click", closeCheckout);

checkoutModal.addEventListener("click", event => {
  if (event.target === checkoutModal) {
    closeCheckout();
  }
});

// FORMATAÇÃO DOS CAMPOS PIX

function pixField(id, value) {
  const text = String(value);

  return id + String(text.length).padStart(2, "0") + text;
}

// CRC16 DO PIX

function crc16(payload) {
  let crc = 0xFFFF;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }

      crc &= 0xFFFF;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// GERAR CÓDIGO PIX

function generatePix(amount) {
  const formattedAmount = amount.toFixed(2);

  // Identificador único da compra
  const txid = "LBA" + Date.now().toString().slice(-10);

  const merchantAccount =
    pixField("00", "br.gov.bcb.pix") +
    pixField("01", PIX_RECEIVER_KEY);

  const additionalData = pixField("05", txid);

  let payload =
    "000201" +
    "010211" +
    pixField("26", merchantAccount) +
    "52040000" +
    "5303986" +
    pixField("54", formattedAmount) +
    "5802BR" +
    pixField("59", PIX_MERCHANT_NAME) +
    pixField("60", PIX_MERCHANT_CITY) +
    pixField("62", additionalData) +
    "6304";

  payload += crc16(payload);

  return payload;
}

// FINALIZAR FORMULÁRIO

checkoutForm.addEventListener("submit", event => {
  event.preventDefault();

  if (cart.length === 0) {
    showToast("Sua sacola está vazia.");
    closeCheckout();
    return;
  }

  if (typeof QRCode === "undefined") {
    showToast("Não foi possível carregar o gerador de QR Code.");
    return;
  }

  // Dados preenchidos pelo cliente
  const formData = new FormData(checkoutForm);

  const customer = Object.fromEntries(formData.entries());

  // Total da compra
  const total = getCartTotal();

  // Gerar código PIX
  const pixCode = generatePix(total);

  // Exibir pagamento
  checkoutForm.hidden = true;
  pixResult.hidden = false;

  document.getElementById("pix-total").textContent =
    money(total);

  document.getElementById("pix-code").value = pixCode;

  // Criar QR Code
  const qrContainer = document.getElementById("pix-qrcode");

  qrContainer.innerHTML = "";

  new QRCode(qrContainer, {
    text: pixCode,
    width: 220,
    height: 220,
    colorDark: "#29251f",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });

  // Resumo demonstrativo do pedido
  console.log("PEDIDO — LIVRARIA BOOKLAND");
  console.log("Cliente:", customer);
  console.log("Produtos:", cart);
  console.log("Total:", money(total));
  console.log("Código PIX:", pixCode);
});

// COPIAR CÓDIGO PIX

document.getElementById("copy-pix")
  .addEventListener("click", async () => {

    const pixCode = document.getElementById("pix-code");

    try {
      await navigator.clipboard.writeText(pixCode.value);

      showToast("Código PIX copiado!");

    } catch (error) {
      pixCode.select();
      pixCode.setSelectionRange(0, 99999);

      document.execCommand("copy");

      showToast("Código PIX copiado!");
    }
  });

// VOLTAR À LOJA

document.getElementById("back-to-store")
  .addEventListener("click", () => {
    closeCheckout();
    closeCart();
  });

// BOTÃO DE PESQUISA

document.getElementById("search-toggle")
  .addEventListener("click", () => {

    document.getElementById("search-box")
      .scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    searchInput.focus();
  });

// MENU MOBILE

document.getElementById("menu-toggle")
  .addEventListener("click", () => {

    document.querySelector(".main-nav")
      .classList.toggle("open");
  });

document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelector(".main-nav")
      .classList.remove("open");
  });
});

// TECLA ESC

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeCheckout();
  }
});

// INICIALIZAÇÃO

renderBooks();
renderCart();
