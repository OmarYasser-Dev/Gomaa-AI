/*
  إعدادات الربط مع n8n
  غيّر قيمة N8N_WEBHOOK_URL فقط إلى رابط الـ Webhook الخاص بالـ workflow.
*/
const CONFIG = {
  N8N_WEBHOOK_URL: "https://brooklyn-base-fame-played.trycloudflare.com/webhook/7eda8b2f-0950-4839-afe7-3d77534030d5/chat",
  // الحقل الرئيسي الذي يقرأه n8n من Body
  MESSAGE_FIELD: "chatInput"
};

const state = {
  sessionId: getSessionId(),
  isSending: false
};

const chatCard = document.getElementById("chatCard");
const chatLauncher = document.getElementById("chatLauncher");
const closeChatBtn = document.getElementById("closeChatBtn");
const newChatBtn = document.getElementById("newChatBtn");
const welcomeScreen = document.getElementById("welcomeScreen");
const messages = document.getElementById("messages");
const chatBody = document.getElementById("chatBody");
const composer = document.getElementById("composer");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let welcomeVisible = true;

function getSessionId() {
  const key = "gomaa_ai_session_id";
  let id = localStorage.getItem(key);

  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    localStorage.setItem(key, id);
  }

  return id;
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setLauncherState(isOpen) {
  chatLauncher.classList.toggle("is-open", isOpen);
  chatLauncher.setAttribute("aria-expanded", String(isOpen));
  chatLauncher.setAttribute("aria-label", isOpen ? "إغلاق المساعد" : "فتح المساعد");
  chatCard.setAttribute("aria-hidden", String(!isOpen));
}

function isChatOpen() {
  return chatCard.classList.contains("is-open") && !chatCard.classList.contains("is-closing");
}

function finishChatAnimation(event) {
  if (event.target !== chatCard) return;
  if (event.animationName !== "chatReveal" && event.animationName !== "chatConceal") return;

  if (event.animationName === "chatReveal") {
    chatCard.classList.remove("is-opening");
    return;
  }

  chatCard.classList.remove("is-open", "is-closing");
  chatCard.classList.add("is-hidden");
}

function openChat() {
  if (isChatOpen() || chatCard.classList.contains("is-opening")) return;

  chatCard.classList.remove("is-hidden", "is-closing");
  void chatCard.offsetWidth;
  chatCard.classList.add("is-open", "is-opening");
  setLauncherState(true);

  if (prefersReducedMotion) {
    chatCard.classList.remove("is-opening");
  }

  setTimeout(() => messageInput.focus(), prefersReducedMotion ? 0 : 280);
}

function closeChat() {
  if (!isChatOpen() && !chatCard.classList.contains("is-opening")) return;

  chatCard.classList.remove("is-opening");
  chatCard.classList.add("is-closing");
  setLauncherState(false);
  chatLauncher.focus();

  if (prefersReducedMotion) {
    chatCard.classList.remove("is-open", "is-closing");
    chatCard.classList.add("is-hidden");
  }
}

function handleOutsidePointer(event) {
  if (!isChatOpen() && !chatCard.classList.contains("is-opening")) return;
  if (chatCard.contains(event.target) || chatLauncher.contains(event.target)) return;
  closeChat();
}

function toggleChat() {
  if (isChatOpen() || chatCard.classList.contains("is-opening")) {
    closeChat();
    return;
  }

  openChat();
}

function resetChat() {
  state.sessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  localStorage.setItem("gomaa_ai_session_id", state.sessionId);

  messages.innerHTML = "";
  welcomeScreen.style.display = "flex";
  welcomeVisible = true;
  messageInput.value = "";
  autoResize();

  openChat();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addMessage(text, role = "bot", extraClass = "") {
  const bubble = document.createElement("div");
  bubble.className = `message ${role} ${extraClass}`.trim();
  bubble.textContent = text;
  messages.appendChild(bubble);
  scrollToBottom();
  return bubble;
}

function addTyping() {
  const bubble = document.createElement("div");
  bubble.className = "message bot typing-bubble";
  bubble.innerHTML = `
    <span class="typing" aria-label="جاري الكتابة">
      <span></span><span></span><span></span>
    </span>
  `;
  messages.appendChild(bubble);
  scrollToBottom();
  return bubble;
}

function hideWelcome() {
  if (!welcomeVisible) return;
  welcomeVisible = false;
  welcomeScreen.style.display = "none";
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: "smooth"
    });
  });
}

function autoResize() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 132)}px`;
}

function getResponseText(data) {
  // يدعم أشهر الصيغ التي يمكن أن يرجعها n8n أو الـ workflow.
  if (typeof data === "string") return data.trim();

  if (!data || typeof data !== "object") return "";

  const candidates = [
    data.output,
    data.text,
    data.response,
    data.answer,
    data.message,
    data.reply,
    data.data?.output,
    data.data?.text,
    data.data?.response,
    data.result?.output,
    data.result?.text,
    data.body?.output,
    data.body?.text,
    data.body?.response
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  // بعض إعدادات n8n قد تعيد مصفوفة عناصر.
  if (Array.isArray(data)) {
    for (const item of data) {
      const nested = getResponseText(item);
      if (nested) return nested;
    }
  }

  return "";
}

async function sendToN8n(userText) {
  if (!CONFIG.N8N_WEBHOOK_URL || CONFIG.N8N_WEBHOOK_URL.includes("ضع_رابط")) {
    throw new Error("لم يتم وضع رابط n8n بعد.");
  }

  const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      [CONFIG.MESSAGE_FIELD]: userText,
      sessionId: state.sessionId,
      source: "gomaa-ai-frontend"
    })
  });

  const raw = await response.text();

  let data = raw;
  try {
    data = JSON.parse(raw);
  } catch (_) {
    // الرد نص عادي
  }

  if (!response.ok) {
    const message = getResponseText(data);
    throw new Error(message || `حدث خطأ أثناء الاتصال (${response.status}).`);
  }

  const answer = getResponseText(data);

  if (!answer) {
    throw new Error("وصل الرد من n8n لكن لم أجد نص الإجابة داخله.");
  }

  return answer;
}

async function handleSubmit(event) {
  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text || state.isSending) return;

  hideWelcome();
  addMessage(text, "user");

  messageInput.value = "";
  autoResize();

  state.isSending = true;
  sendBtn.disabled = true;

  const typingBubble = addTyping();

  try {
    const answer = await sendToN8n(text);
    typingBubble.remove();
    addMessage(answer, "bot");
  } catch (error) {
    typingBubble.remove();

    let friendlyMessage = "حصلت مشكلة وأنا بحاول أوصل للمساعد.";

    if (error?.message) {
      friendlyMessage = error.message;
    }

    addMessage(friendlyMessage, "bot", "error");
  } finally {
    state.isSending = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

messageInput.addEventListener("input", autoResize);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

composer.addEventListener("submit", handleSubmit);
chatLauncher.addEventListener("click", toggleChat);
closeChatBtn.addEventListener("click", closeChat);
newChatBtn.addEventListener("click", resetChat);
chatCard.addEventListener("animationend", finishChatAnimation);

document.addEventListener("pointerdown", handleOutsidePointer);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !chatCard.classList.contains("is-hidden")) {
    closeChat();
  }
});

setLauncherState(false);
autoResize();
