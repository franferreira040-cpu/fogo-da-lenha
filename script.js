const BUSINESS_WHATSAPP = "556191417800";

const menu = {
    "calabresa da casa": { name: "Calabresa da Casa", price: 49 },
    "margherita fresca": { name: "Margherita Fresca", price: 46 },
    "quatro queijos": { name: "Quatro Queijos", price: 52 },
    "portuguesa": { name: "Portuguesa", price: 54 },
    "frango com catupiry": { name: "Frango com Catupiry", price: 53 },
    "pepperoni": { name: "Pepperoni", price: 55 },
    "refrigerante lata": { name: "Refrigerante lata", price: 7 },
    "suco": { name: "Suco", price: 9 },
    "agua mineral": { name: "Água mineral", price: 5 },
    "refrigerante 2 l": { name: "Refrigerante 2 L", price: 14 }
};

const launcher = document.querySelector(".chat-launcher");
const panel = document.querySelector(".chat-panel");
const closeButton = document.querySelector(".chat-close");
const chatForm = document.querySelector(".chat-form");
const chatInput = document.querySelector("#chat-input");
const messages = document.querySelector(".chat-messages");
const quickReplies = document.querySelector(".quick-replies");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const cart = new Map();

function normalize(text) {
    return text.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function setChatOpen(isOpen) {
    panel.classList.toggle("is-open", isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
    launcher.setAttribute("aria-expanded", String(isOpen));
    launcher.setAttribute("aria-label", isOpen ? "Fechar assistente de pedidos" : "Abrir assistente de pedidos");
    if (isOpen) chatInput.focus();
}

function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = `message ${sender}-message`;
    const body = document.createElement("p");
    body.textContent = text;
    const time = document.createElement("time");
    time.textContent = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    message.append(body, time);
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
}

function orderSummary() {
    return [...cart.values()].map(({ name, price, quantity }) => `${quantity}x ${name} — R$ ${(price * quantity).toFixed(2).replace(".", ",")}`).join("\n");
}

function openWhatsApp() {
    if (!BUSINESS_WHATSAPP) {
        addMessage("A demonstração está funcionando, mas o WhatsApp da empresa ainda não foi configurado. Defina BUSINESS_WHATSAPP no início do arquivo script.js com o DDI, DDD e número (somente dígitos) para receber pedidos.", "bot");
        return;
    }

    const summary = orderSummary();
    const text = summary
        ? `Olá! Quero fazer este pedido:\n${summary}\n\nPode confirmar, por favor?`
        : "Olá! Vim pelo site da Fogo da Lenha e gostaria de fazer um pedido.";
    const url = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

function addToCart(productName) {
    const product = menu[normalize(productName)];
    if (!product) return;
    const current = cart.get(product.name);
    cart.set(product.name, { ...product, quantity: current ? current.quantity + 1 : 1 });
    setChatOpen(true);
    addMessage(`${product.name} — R$ ${product.price.toFixed(2).replace(".", ",")}`, "user");
    const productType = product.name.toLocaleLowerCase("pt-BR").includes("refrigerante")
        || product.name.toLocaleLowerCase("pt-BR").includes("suco")
        || product.name.toLocaleLowerCase("pt-BR").includes("água")
        ? "bebida"
        : "pizza";
    addMessage(`Boa escolha! ${productType === "bebida" ? "🥤" : "🍕"} Adicionei ${product.name} ao seu pedido. Quer escolher mais alguma coisa ou prefere finalizar pelo WhatsApp?`, "bot");
}

function getReply(text) {
    const normalized = normalize(text);
    const selectedProduct = Object.keys(menu).sort((a, b) => b.length - a.length).find((product) => normalized.includes(product));

    if (selectedProduct) {
        addToCart(menu[selectedProduct].name);
        return null;
    }
    if (/\b(finalizar|fechar pedido|fazer pedido|pedir|comprar)\b/.test(normalized)) {
        if (cart.size) openWhatsApp();
        else return "Claro! Escolha uma pizza no cardápio ou me diga qual sabor você quer. Aí eu preparo seu pedido para o WhatsApp. 😊";
        return null;
    }
    if (/\b(cardapio|sabores|pizza|preco|precos|valor|valores|quanto custa)\b/.test(normalized)) {
        return "Temos Calabresa da Casa (R$ 49), Margherita Fresca (R$ 46), Quatro Queijos (R$ 52), Portuguesa (R$ 54), Frango com Catupiry (R$ 53) e Pepperoni (R$ 55). Os preços são ilustrativos. Qual sabor você quer?";
    }
    if (/\b(bebida|bebidas|refrigerante|suco|agua)\b/.test(normalized)) {
        return "Temos refrigerante lata (R$ 7), suco (R$ 9), água mineral (R$ 5) e refrigerante 2 L (R$ 14). Os preços são ilustrativos. Qual bebida você quer?";
    }
    if (/\b(contato|atendimento|falar com|whatsapp)\b/.test(normalized)) {
        return "Claro! Você pode falar com a gente pelo WhatsApp para confirmar sabores, preços e entrega. 😊";
    }
    if (/\b(recomenda|recomendacao|sugestao|mais pedida|favorita)\b/.test(normalized)) {
        return "Que tal a Calabresa da Casa? 🌟 Vai com calabresa artesanal, cebola roxa e muçarela. Quer que eu adicione uma ao seu pedido?";
    }
    if (/\b(entrega|demora|tempo|chega|frete)\b/.test(normalized)) {
        return "O prazo e a taxa de entrega dependem do seu endereço. 🛵 Continue pelo WhatsApp para confirmar a disponibilidade na sua região.";
    }
    if (/\b(vegetariana|vegetariano|sem carne)\b/.test(normalized)) {
        return "A Margherita Fresca é uma delícia sem carne: tomate italiano, muçarela e manjericão fresco. Custa R$ 46. 🍃";
    }
    if (/\b(oi|ola|bom dia|boa tarde|boa noite|ajuda)\b/.test(normalized)) {
        return "Oi! 😊 Posso te mostrar as pizzas e bebidas, recomendar um sabor ou explicar como funciona a entrega. O que você prefere?";
    }
    return "Posso ajudar com pizzas, bebidas, recomendações, prazo de entrega ou preparar seu pedido. Se preferir, escolha uma das opções aqui em cima. 😊";
}

function sendMessage(text) {
    const value = text.trim();
    if (!value) return;
    addMessage(value, "user");
    const reply = getReply(value);
    if (reply) window.setTimeout(() => addMessage(reply, "bot"), 250);
}

launcher.addEventListener("click", () => setChatOpen(!panel.classList.contains("is-open")));
document.querySelectorAll(".open-chat").forEach((button) => button.addEventListener("click", () => setChatOpen(true)));
closeButton.addEventListener("click", () => setChatOpen(false));

document.querySelectorAll(".add-pizza").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.product));
});

quickReplies.addEventListener("click", (event) => {
    const button = event.target.closest("[data-message]");
    if (button) sendMessage(button.dataset.message);
});

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(chatInput.value);
    chatInput.value = "";
});

menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menu");
    });
});
