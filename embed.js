(function () {
  // 1. تحديد المسار الرئيسي التلقائي لملفات الشات من رابط هذا السكربت
  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  const scriptUrl = new URL(currentScript.src, window.location.href);
  const baseUrl = scriptUrl.href.substring(0, scriptUrl.href.lastIndexOf("/"));

  // 2. تحميل ملف التنسيقات style.css تلقائيًا
  if (!document.querySelector(`link[href="${baseUrl}/style.css"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${baseUrl}/style.css`;
    document.head.appendChild(link);
  }

  // 3. بناء وتضمين عناصر HTML للنافذة في الصفحة الرئيسية
  function initChatWidget() {
    if (document.getElementById("gomaa-ai-widget-root")) return;

    const widgetContainer = document.createElement("div");
    widgetContainer.id = "gomaa-ai-widget-root";

    // حقن هيكل الـ HTML بنفس العناصر والأقسام
    widgetContainer.innerHTML = `
      <div class="page-shell">
        <section class="hero-glow" aria-hidden="true"></section>

        <!-- زر فتح/إغلاق الشات -->
        <button
          class="chat-launcher"
          id="chatLauncher"
          type="button"
          aria-label="فتح المساعد"
          aria-expanded="false"
          aria-controls="chatCard"
        >
          <img src="${baseUrl}/images/logo.png" alt="" width="72" height="72">
          <span class="launcher-ai" aria-hidden="true">AI</span>
        </button>

        <!-- نافذة الشات -->
        <section class="chat-card is-hidden" id="chatCard" aria-label="محادثة Gomaa AI" aria-hidden="true">
          <header class="chat-header">
            <div class="brand-wrap">
              <div class="brand-logo">
                <img src="${baseUrl}/images/logo.png" alt="شعار المنصة">
              </div>
              <div class="brand-text">
                <h1>Gomaa AI</h1>
                <span><i></i>معاك طول اليوم</span>
              </div>
            </div>

            <div class="header-actions">
              <button class="icon-btn" id="newChatBtn" type="button" aria-label="بدء محادثة جديدة" title="محادثة جديدة">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 11a8 8 0 0 0-14.9-4M4 5V9h4M4 13a8 8 0 0 0 14.9 4M20 19v-4h-4"/>
                </svg>
              </button>
              <button class="icon-btn close-btn" id="closeChatBtn" type="button" aria-label="إغلاق المحادثة" title="إغلاق">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18"/>
                </svg>
              </button>
            </div>
          </header>

          <div class="chat-body" id="chatBody">
            <div class="welcome" id="welcomeScreen">
              <div class="welcome-logo-wrap">
                <div class="logo-halo"></div>
                <img src="${baseUrl}/images/logo.png" alt="شعار المنصة" class="welcome-logo">
              </div>

              <h2>تعالى أجاوبك عاللي فبالك!</h2>
            </div>

            <div class="messages" id="messages" aria-live="polite"></div>
          </div>

          <form class="composer" id="composer">
            <div class="input-wrap">
              <textarea
                id="messageInput"
                rows="1"
                maxlength="4000"
                autocomplete="off"
                placeholder="اكتب سؤالك هنا..."
                aria-label="اكتب سؤالك"
              ></textarea>
            </div>

            <button class="send-btn" id="sendBtn" type="submit" aria-label="إرسال">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 4l16 8-16 8 3-8-3-8zM7 12h10"/>
              </svg>
            </button>
          </form>
        </section>
      </div>
    `;

    document.body.appendChild(widgetContainer);

    // 4. تشغيل ملف السكربت الرئيسي script.js بعد تجهيز الـ DOM
    const script = document.createElement("script");
    script.src = `${baseUrl}/script.js`;
    document.body.appendChild(script);
  }

  // التأكد من أن الصفحة اكتمل تحميلها قبل حقن العناصر
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();