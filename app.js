const STORAGE_KEYS = {
  templates: "scamshield.templates",
  credits: "scamshield.credits",
  unlocked: "scamshield.unlocked",
};

const FREE_TEMPLATE_LIMIT = 5;
const DEMO_ADMIN_PASSWORD = "admin123";

const defaultTemplates = [
  {
    id: crypto.randomUUID(),
    title: "Fake Job Offer and Training Fee Scam",
    category: "Employment",
    isFree: true,
    cost: 0,
    summary: "Scammers offer remote jobs quickly, then ask for payment for training, kits, or registration.",
    content:
      "How the scam works:\n1. A scammer posts an attractive job with high pay and low entry requirements.\n2. They reply very fast and try to move the conversation to WhatsApp or Telegram.\n3. They say you have been selected and must pay for training, a work kit, background checks, or account activation.\n4. Once payment is made, they disappear or keep inventing new fees.\n\nWarning signs:\n- No formal interview process\n- Pressure to pay before starting work\n- Generic company email or no company domain\n- Poor grammar mixed with urgency\n\nHow to stay safe:\n- Never pay to get a job\n- Verify the company on its official website\n- Search the exact job message online for complaints\n- Ask for a written contract and recruiter contact on company email",
  },
  {
    id: crypto.randomUUID(),
    title: "Romance Scam with Emergency Money Request",
    category: "Social Media",
    isFree: true,
    cost: 0,
    summary: "A scammer builds emotional trust, then creates a crisis that requires urgent money.",
    content:
      "How the scam works:\n1. The scammer starts with heavy affection and constant attention.\n2. They avoid real-life meetings and often make excuses about travel, military duty, or offshore work.\n3. After trust grows, they create an emergency such as hospital bills, travel release fees, or customs problems.\n4. They ask for money, gift cards, or crypto transfers.\n\nWarning signs:\n- Fast emotional attachment\n- Refusal to video call clearly\n- Stories that change over time\n- Requests for secrecy or urgency\n\nHow to stay safe:\n- Slow down relationships that move too fast\n- Reverse image search profile photos\n- Never send money to someone you have not verified",
  },
  {
    id: crypto.randomUUID(),
    title: "Bank Account Verification Phishing Email",
    category: "Email",
    isFree: true,
    cost: 0,
    summary: "A fake email claims your bank account will be blocked unless you verify details immediately.",
    content:
      "How the scam works:\n1. A fake bank email claims suspicious activity or account suspension.\n2. It includes a link to a lookalike login page.\n3. The victim enters login details, PIN, or card data.\n4. The scammer uses the captured information to access the real account.\n\nWarning signs:\n- Suspicious sender address\n- Threats that force immediate action\n- Misspellings in the website URL\n- Requests for PIN, OTP, or full card details\n\nHow to stay safe:\n- Do not click links in urgent financial emails\n- Type your bank website manually\n- Call the bank using the number on your card or official website",
  },
  {
    id: crypto.randomUUID(),
    title: "Marketplace Overpayment Scam",
    category: "Marketplace",
    isFree: true,
    cost: 0,
    summary: "A fake buyer sends an overpayment story and asks the seller to refund part of it.",
    content:
      "How the scam works:\n1. The scammer pretends to buy an item and says they mistakenly paid too much.\n2. They pressure the seller to refund the extra amount quickly.\n3. The original payment is fake, reversed, or made with a stolen account.\n4. The seller loses the refunded money.\n\nWarning signs:\n- Strange payment screenshots instead of confirmed funds\n- Buyer wants to move outside the platform\n- Unnecessary urgency around refunding excess money\n\nHow to stay safe:\n- Confirm funds in your own account before taking action\n- Keep communication and payment inside the marketplace platform",
  },
  {
    id: crypto.randomUUID(),
    title: "Gift Card Support Scam",
    category: "Customer Support",
    isFree: true,
    cost: 0,
    summary: "A fake support agent says you can solve a problem only by paying with gift cards.",
    content:
      "How the scam works:\n1. The victim receives a call, popup, or message from fake support.\n2. The scammer claims there is fraud, malware, or an account issue.\n3. They demand gift card codes as the fastest solution.\n4. Once the codes are shared, the money is gone.\n\nWarning signs:\n- Real companies do not ask for gift cards as payment\n- Remote access requests from strangers\n- Threats that your account or device will break immediately\n\nHow to stay safe:\n- Close suspicious popups\n- Contact the company through official channels\n- Never share gift card numbers with support agents",
  },
  {
    id: crypto.randomUUID(),
    title: "Crypto Investment Signal Group Scam",
    category: "Investment",
    isFree: false,
    cost: 3,
    summary: "A private trading group promises guaranteed returns, then pushes victims to deposit into fake platforms.",
    content:
      "How the scam works:\n1. Scammers show screenshots of luxury lifestyles and trading wins.\n2. They invite people into a VIP signal group or mentorship channel.\n3. Victims are told to invest through a special website or wallet connection.\n4. Fake profits appear on a dashboard, but withdrawals are blocked by more fees.\n\nWarning signs:\n- Guaranteed returns\n- Secret platform that no one reputable mentions\n- Pressure to add more funds after seeing fake profits\n- Withdrawal blocked by taxes or unlocking fees\n\nHow to stay safe:\n- Use regulated, well-known platforms only\n- Treat guaranteed returns as a major red flag\n- Verify whether others have successfully withdrawn",
  },
  {
    id: crypto.randomUUID(),
    title: "Facebook Friend Impersonation Benefit Scam",
    category: "Impersonation",
    isFree: false,
    cost: 2,
    summary: "A cloned account pretends to be your friend and tells you about a grant or relief payment opportunity.",
    content:
      "How the scam works:\n1. A scammer clones a real friend or relative's profile.\n2. They send messages about grants, government benefits, or business payouts.\n3. They claim they received money and want to help you apply.\n4. The victim pays a processing fee or shares personal details.\n\nWarning signs:\n- A familiar person speaking in an unfamiliar way\n- Sudden talk about fast money or benefit offers\n- Requests for fees, BVN, card info, or identity documents\n\nHow to stay safe:\n- Confirm through a call or another verified account\n- Never trust benefit claims from direct messages alone",
  },
  {
    id: crypto.randomUUID(),
    title: "Advance Fee Loan Approval Scam",
    category: "Loans",
    isFree: false,
    cost: 2,
    summary: "The victim is told a loan has been approved but must first pay insurance, legal, or processing fees.",
    content:
      "How the scam works:\n1. The scammer advertises guaranteed loans with little documentation.\n2. They approve the application almost instantly.\n3. Before disbursement, they demand service charges or insurance payments.\n4. After payment, the loan never arrives.\n\nWarning signs:\n- Guaranteed approval regardless of credit history\n- Upfront fees before funds are released\n- No verifiable lender registration or office\n\nHow to stay safe:\n- Use registered lenders only\n- Read reviews and verify licenses\n- Walk away from any lender demanding advance payment",
  },
];

function readJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getTemplates() {
  const templates = readJSON(STORAGE_KEYS.templates, null);
  if (templates && templates.length) return templates;
  saveJSON(STORAGE_KEYS.templates, defaultTemplates);
  return defaultTemplates;
}

function getCredits() {
  const credits = Number(localStorage.getItem(STORAGE_KEYS.credits));
  if (Number.isFinite(credits)) return credits;
  localStorage.setItem(STORAGE_KEYS.credits, "0");
  return 0;
}

function setCredits(value) {
  localStorage.setItem(STORAGE_KEYS.credits, String(value));
}

function getUnlockedTemplateIds() {
  return readJSON(STORAGE_KEYS.unlocked, []);
}

function setUnlockedTemplateIds(ids) {
  saveJSON(STORAGE_KEYS.unlocked, ids);
}

function seedFreeTemplates() {
  const templates = getTemplates();
  const freeCount = templates.filter((template) => template.isFree).length;

  if (freeCount >= FREE_TEMPLATE_LIMIT) return;

  const updated = templates.map((template, index) => ({
    ...template,
    isFree: index < FREE_TEMPLATE_LIMIT ? true : template.isFree,
    cost: index < FREE_TEMPLATE_LIMIT ? 0 : template.cost,
  }));

  saveJSON(STORAGE_KEYS.templates, updated);
}

function templateIsAccessible(template) {
  if (template.isFree) return true;
  return getUnlockedTemplateIds().includes(template.id);
}

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderStats(templates) {
  document.getElementById("credit-balance").textContent = String(getCredits());
  document.getElementById("total-count").textContent = String(templates.length);
  document.getElementById("free-count").textContent = String(
    templates.filter((template) => template.isFree).length,
  );
  document.getElementById("premium-count").textContent = String(
    templates.filter((template) => !template.isFree).length,
  );
}

function renderCards() {
  const templates = getTemplates();
  renderStats(templates);

  const searchValue = document.getElementById("search-input").value.trim().toLowerCase();
  const filterValue = document.getElementById("filter-select").value;

  const visibleTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchValue) ||
      template.category.toLowerCase().includes(searchValue);

    const matchesFilter =
      filterValue === "all" ||
      (filterValue === "free" && template.isFree) ||
      (filterValue === "premium" && !template.isFree);

    return matchesSearch && matchesFilter;
  });

  const cardGrid = document.getElementById("card-grid");
  cardGrid.innerHTML = "";

  if (!visibleTemplates.length) {
    cardGrid.innerHTML = `
      <article class="card">
        <div class="card-content">
          <h4>No templates found</h4>
          <p>Try a different search term or change the filter.</p>
        </div>
      </article>
    `;
    return;
  }

  visibleTemplates.forEach((template) => {
    const isOpen = templateIsAccessible(template);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card-top">
        <span class="tag ${template.isFree ? "free" : "premium"}">
          ${template.isFree ? "Free lesson" : `${template.cost} credit${template.cost > 1 ? "s" : ""}`}
        </span>
        <span class="status ${isOpen ? "free" : "premium"}">${isOpen ? "Open" : "Locked"}</span>
      </div>
      <div class="card-content">
        <p class="eyebrow">${escapeHTML(template.category)}</p>
        <h4>${escapeHTML(template.title)}</h4>
        <p>${escapeHTML(template.summary)}</p>
      </div>
      <div class="card-bottom">
        <span>${template.isFree ? "Included in trial" : "Unlock detailed lesson"}</span>
        <button class="unlock-button" type="button" data-id="${template.id}">
          ${isOpen ? "Read format" : "Unlock"}
        </button>
      </div>
    `;
    cardGrid.appendChild(card);
  });
}

function renderTemplateModal(template) {
  const modal = document.getElementById("template-modal");
  const isOpen = templateIsAccessible(template);
  const modalBody = document.getElementById("modal-body");

  if (isOpen) {
    modalBody.innerHTML = `
      <div class="modal-body">
        <div class="meta">
          <span class="tag ${template.isFree ? "free" : "premium"}">
            ${template.isFree ? "Free lesson" : `Unlocked premium lesson`}
          </span>
          <span class="tag">${escapeHTML(template.category)}</span>
        </div>
        <h3>${escapeHTML(template.title)}</h3>
        <p>${escapeHTML(template.summary)}</p>
        <div class="lesson">${escapeHTML(template.content)}</div>
      </div>
    `;
  } else {
    modalBody.innerHTML = `
      <div class="modal-body">
        <div class="meta">
          <span class="tag premium">${template.cost} credit${template.cost > 1 ? "s" : ""}</span>
          <span class="tag">${escapeHTML(template.category)}</span>
        </div>
        <h3>${escapeHTML(template.title)}</h3>
        <p>${escapeHTML(template.summary)}</p>
        <p>
          This full lesson explains how scammers use this format, the warning signs to watch for,
          and practical steps users can take to avoid becoming victims.
        </p>
        <button class="primary-button" type="button" id="modal-unlock-button" data-id="${template.id}">
          Spend ${template.cost} credit${template.cost > 1 ? "s" : ""} to unlock
        </button>
      </div>
    `;
  }

  modal.showModal();
}

function unlockTemplate(templateId) {
  const templates = getTemplates();
  const template = templates.find((item) => item.id === templateId);
  if (!template || template.isFree) return;

  const unlockedIds = getUnlockedTemplateIds();
  if (unlockedIds.includes(template.id)) {
    renderCards();
    renderTemplateModal(template);
    return;
  }

  const currentCredits = getCredits();
  if (currentCredits < template.cost) {
    alert("You do not have enough credits yet. Please top up your wallet.");
    return;
  }

  setCredits(currentCredits - template.cost);
  setUnlockedTemplateIds([...unlockedIds, template.id]);
  renderCards();
  renderTemplateModal(template);
}

function renderAdminList() {
  const container = document.getElementById("admin-list");
  const templates = getTemplates();

  container.innerHTML = "";
  templates.forEach((template) => {
    const item = document.createElement("article");
    item.className = "admin-item";
    item.innerHTML = `
      <div>
        <div class="card-top">
          <h4>${escapeHTML(template.title)}</h4>
          <span class="tag ${template.isFree ? "free" : "premium"}">
            ${template.isFree ? "Free" : `${template.cost} credits`}
          </span>
        </div>
        <p>${escapeHTML(template.category)} · ${escapeHTML(template.summary)}</p>
      </div>
      <div class="admin-item-actions">
        <button class="ghost-button edit-template" type="button" data-id="${template.id}">Edit</button>
        <button class="ghost-button delete-template" type="button" data-id="${template.id}">Delete</button>
      </div>
    `;
    container.appendChild(item);
  });
}

function resetForm() {
  document.getElementById("template-id").value = "";
  document.getElementById("title-input").value = "";
  document.getElementById("category-input").value = "";
  document.getElementById("cost-input").value = "0";
  document.getElementById("free-input").checked = false;
  document.getElementById("summary-input").value = "";
  document.getElementById("content-input").value = "";
}

function fillForm(templateId) {
  const template = getTemplates().find((item) => item.id === templateId);
  if (!template) return;

  document.getElementById("template-id").value = template.id;
  document.getElementById("title-input").value = template.title;
  document.getElementById("category-input").value = template.category;
  document.getElementById("cost-input").value = String(template.cost);
  document.getElementById("free-input").checked = template.isFree;
  document.getElementById("summary-input").value = template.summary;
  document.getElementById("content-input").value = template.content;
}

function saveTemplate(event) {
  event.preventDefault();
  const id = document.getElementById("template-id").value || crypto.randomUUID();
  const isFree = document.getElementById("free-input").checked;
  const costValue = Number(document.getElementById("cost-input").value);

  const template = {
    id,
    title: document.getElementById("title-input").value.trim(),
    category: document.getElementById("category-input").value.trim(),
    summary: document.getElementById("summary-input").value.trim(),
    content: document.getElementById("content-input").value.trim(),
    isFree,
    cost: isFree ? 0 : Math.max(1, costValue || 1),
  };

  const templates = getTemplates();
  const existingIndex = templates.findIndex((item) => item.id === id);
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.unshift(template);
  }

  saveJSON(STORAGE_KEYS.templates, templates);
  resetForm();
  renderCards();
  renderAdminList();
}

function deleteTemplate(templateId) {
  const templates = getTemplates().filter((item) => item.id !== templateId);
  saveJSON(STORAGE_KEYS.templates, templates);
  setUnlockedTemplateIds(getUnlockedTemplateIds().filter((id) => id !== templateId));
  renderCards();
  renderAdminList();
}

function openAdminPanel() {
  document.getElementById("admin-panel").classList.remove("hidden");
}

function closeAdminPanel() {
  document.getElementById("admin-panel").classList.add("hidden");
}

function unlockAdmin() {
  const password = document.getElementById("admin-password").value;
  if (password !== DEMO_ADMIN_PASSWORD) {
    alert("Incorrect password.");
    return;
  }

  document.getElementById("admin-lock").classList.add("hidden");
  document.getElementById("admin-content").classList.remove("hidden");
  renderAdminList();
}

function setupEventListeners() {
  document.getElementById("search-input").addEventListener("input", renderCards);
  document.getElementById("filter-select").addEventListener("change", renderCards);

  document.getElementById("card-grid").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;

    const template = getTemplates().find((item) => item.id === button.dataset.id);
    if (template) renderTemplateModal(template);
  });

  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("template-modal").close();
  });

  document.getElementById("modal-body").addEventListener("click", (event) => {
    const button = event.target.closest("#modal-unlock-button");
    if (!button) return;
    unlockTemplate(button.dataset.id);
  });

  document.getElementById("open-wallet").addEventListener("click", () => {
    document.getElementById("wallet-modal").showModal();
  });

  document.getElementById("close-wallet").addEventListener("click", () => {
    document.getElementById("wallet-modal").close();
  });

  document.querySelectorAll(".bundle-card").forEach((button) => {
    button.addEventListener("click", () => {
      const creditsToAdd = Number(button.dataset.credits);
      const method = button.dataset.method;
      setCredits(getCredits() + creditsToAdd);
      renderCards();
      document.getElementById("wallet-modal").close();
      alert(`${method} top-up successful. ${creditsToAdd} credits added to your wallet.`);
    });
  });

  document.getElementById("admin-toggle").addEventListener("click", openAdminPanel);
  document.getElementById("close-admin").addEventListener("click", closeAdminPanel);
  document.getElementById("admin-login").addEventListener("click", unlockAdmin);
  document.getElementById("template-form").addEventListener("submit", saveTemplate);
  document.getElementById("reset-form").addEventListener("click", resetForm);

  document.getElementById("admin-list").addEventListener("click", (event) => {
    const editButton = event.target.closest(".edit-template");
    const deleteButton = event.target.closest(".delete-template");

    if (editButton) {
      fillForm(editButton.dataset.id);
    }

    if (deleteButton) {
      deleteTemplate(deleteButton.dataset.id);
    }
  });
}

function initializeApp() {
  seedFreeTemplates();
  setupEventListeners();
  renderCards();
}

initializeApp();
