import { dom } from './dom.js';
import { state } from './state.js';
import { SHOP_BOOSTS, CASES, getBuffDef, getCaseOdds } from './items.js';
import { formatNumber } from './game.js';

const BOOST_LIMIT_COUNT = 2;
const BOOST_LIMIT_WINDOW_MS = 4 * 60 * 60 * 1000;

function iconHtml(icon, rarity) {
  return `<div class="item-icon ${rarity}">${icon}</div>`;
}

function cardClass(rarity, featured = false) {
  return `shop-card rarity-card-${rarity}${featured ? ' oksicase' : ''}`;
}

function ensureBoostMeta() {
  if (!state.inventory.meta) state.inventory.meta = {};
  if (!state.inventory.meta.shopBoostLimits) state.inventory.meta.shopBoostLimits = {};
}

function getBoostPurchases(key) {
  ensureBoostMeta();

  const now = Date.now();
  const raw = Array.isArray(state.inventory.meta.shopBoostLimits[key])
    ? state.inventory.meta.shopBoostLimits[key]
    : [];

  const filtered = raw.filter((ts) => now - Number(ts) < BOOST_LIMIT_WINDOW_MS);
  state.inventory.meta.shopBoostLimits[key] = filtered;
  return filtered;
}

function getBoostLimitState(key) {
  const purchases = getBoostPurchases(key);
  const used = purchases.length;
  const remaining = Math.max(0, BOOST_LIMIT_COUNT - used);
  const locked = used >= BOOST_LIMIT_COUNT;

  let unlockInMs = 0;
  if (locked && purchases[0]) {
    unlockInMs = Math.max(0, BOOST_LIMIT_WINDOW_MS - (Date.now() - Number(purchases[0])));
  }

  return {
    used,
    remaining,
    locked,
    unlockInMs
  };
}

function formatCooldown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}ч ${String(minutes).padStart(2, '0')}м`;
  }

  return `${minutes}м`;
}

function renderBoostLimitHtml(key) {
  const info = getBoostLimitState(key);

  if (!info.locked) {
    return `
      <div class="shop-limit-line">
        <span class="shop-limit-chip">Лимит</span>
        <span class="shop-limit-text">Куплено ${info.used}/${BOOST_LIMIT_COUNT} за 4ч</span>
      </div>
    `;
  }

  return `
    <div class="shop-limit-line shop-limit-locked">
      <span class="shop-limit-chip">Лимит исчерпан</span>
      <span class="shop-limit-text">Откроется через ${formatCooldown(info.unlockInMs)}</span>
    </div>
  `;
}

function renderOddsHtml(caseType) {
  const odds = getCaseOdds(caseType);

  return odds.map((entry) => `
    <div class="case-odds-row rarity-card-${entry.rarity}">
      <div class="case-odds-head">
        <strong>${entry.title}</strong>
        <span class="rarity-badge rarity-${entry.rarity}">${entry.chance}</span>
      </div>
      <div class="case-odds-items">${entry.items.join(' • ')}</div>
    </div>
  `).join('');
}

function openCaseInfo(caseType) {
  const cfg = CASES[caseType];
  if (!cfg || !dom.caseInfoModal) return;

  dom.caseInfoTitle.textContent = `${cfg.icon} ${cfg.name}`;
  dom.caseInfoPrice.textContent = `Цена: ${formatNumber(cfg.price)} 💰`;
  dom.caseInfoDesc.textContent = cfg.description;
  dom.caseInfoOdds.innerHTML = renderOddsHtml(caseType);

  dom.caseInfoModal.classList.remove('hidden');
}

function closeCaseInfo() {
  dom.caseInfoModal?.classList.add('hidden');
}

function bindCaseInfoEvents() {
  if (!dom.caseInfoClose || !dom.caseInfoModal || dom.caseInfoModal.dataset.bound === '1') return;

  dom.caseInfoClose.addEventListener('click', closeCaseInfo);
  dom.caseInfoModal.addEventListener('click', (event) => {
    if (event.target === dom.caseInfoModal) closeCaseInfo();
  });

  dom.caseInfoModal.dataset.bound = '1';
}

export function buyShopBoost(key) {
  const offer = SHOP_BOOSTS.find((item) => item.key === key);
  if (!offer) return false;

  const limit = getBoostLimitState(key);
  if (limit.locked) return false;
  if (state.coins < offer.price) return false;

  state.coins -= offer.price;
  state.inventory.buffs.push({
    instanceId: `it_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'buff',
    key
  });

  ensureBoostMeta();
  state.inventory.meta.shopBoostLimits[key].push(Date.now());

  return true;
}

export function buyCase(caseType) {
  const cfg = CASES[caseType];
  if (!cfg || state.coins < cfg.price) return false;

  state.coins -= cfg.price;
  state.inventory.cases[caseType] = (state.inventory.cases[caseType] || 0) + 1;
  return true;
}

export function renderShop(handlers) {
  bindCaseInfoEvents();

  const tab = state.ui.shopTab;

  if (tab === 'boosts') {
    dom.shopContent.innerHTML = `
      <div class="shop-grid">
        ${SHOP_BOOSTS.map((offer) => {
          const def = getBuffDef(offer.key);
          const limit = getBoostLimitState(offer.key);
          const disabled = state.coins < offer.price || limit.locked;

          return `
            <article class="${cardClass(def.rarity)}">
              <div class="shop-card-top">
                ${iconHtml(def.icon, def.rarity)}
                <div>
                  <div class="shop-title">${def.name}</div>
                  <div class="rarity-badge rarity-${def.rarity}">${def.rarity.toUpperCase()}</div>
                  <div class="shop-subtitle">${def.description}</div>
                  ${renderBoostLimitHtml(offer.key)}
                </div>
              </div>
              <div class="shop-bottom">
                <div class="shop-price">💰 ${formatNumber(offer.price)}</div>
                <button class="buy-btn" data-buy-boost="${offer.key}" ${disabled ? 'disabled' : ''}>Купить</button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  } else {
    dom.shopContent.innerHTML = `
      <div class="shop-grid">
        ${Object.entries(CASES).map(([key, cfg]) => `
          <article class="${cardClass(cfg.rarity, cfg.featured)}">
            <div class="shop-card-top">
              ${iconHtml(cfg.icon, cfg.rarity)}
              <div>
                <div class="shop-title">${cfg.name}</div>
                <div class="rarity-badge rarity-${cfg.rarity}">${cfg.rarity.toUpperCase()}</div>
                <div class="shop-subtitle">${cfg.description}</div>
              </div>
            </div>

            <div class="shop-case-actions">
              <button class="secondary-btn" data-case-info="${key}">Содержимое</button>
            </div>

            <div class="shop-bottom">
              <div class="shop-price">💰 ${formatNumber(cfg.price)}</div>
              <button class="buy-btn" data-buy-case="${key}" ${state.coins < cfg.price ? 'disabled' : ''}>Купить</button>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  dom.shopContent.querySelectorAll('[data-buy-boost]').forEach((el) => {
    el.addEventListener('click', () => handlers.onBuyShopBoost(el.dataset.buyBoost));
  });

  dom.shopContent.querySelectorAll('[data-buy-case]').forEach((el) => {
    el.addEventListener('click', () => handlers.onBuyCase(el.dataset.buyCase));
  });

  dom.shopContent.querySelectorAll('[data-case-info]').forEach((el) => {
    el.addEventListener('click', () => openCaseInfo(el.dataset.caseInfo));
  });
}
