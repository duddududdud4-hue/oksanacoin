import { dom } from './dom.js';
import { state } from './state.js';
import {
  CASES,
  createBuffInstance,
  createPetInstance,
  createAccessoryInstance,
  getBuffDef,
  getPetDef,
  getAccessoryDef
} from './items.js';
import { formatNumber } from './game.js';

function iconHtml(icon, rarity) {
  return `<div class="item-icon ${rarity}">${icon}</div>`;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  if (mins > 0) {
    return `${mins}м ${String(secs).padStart(2, '0')}с`;
  }

  return `${secs}с`;
}

export function activateBuff(instanceId) {
  if (state.equipped.buffs.length >= 3) return false;

  const idx = state.inventory.buffs.findIndex((item) => item.instanceId === instanceId);
  if (idx === -1) return false;

  const item = state.inventory.buffs.splice(idx, 1)[0];
  const def = getBuffDef(item.key);

  state.equipped.buffs.push({
    ...item,
    activatedAt: Date.now(),
    expiresAt: Date.now() + def.durationMs
  });

  return true;
}

export function deactivateBuff() {
  return false;
}

export function equipPet(instanceId) {
  if (state.equipped.pets.length >= 3) return false;

  const idx = state.inventory.pets.findIndex((item) => item.instanceId === instanceId);
  if (idx === -1) return false;

  const item = state.inventory.pets.splice(idx, 1)[0];
  state.equipped.pets.push(item);
  return true;
}

export function unequipPet(instanceId) {
  const idx = state.equipped.pets.findIndex((item) => item.instanceId === instanceId);
  if (idx === -1) return false;

  const item = state.equipped.pets.splice(idx, 1)[0];
  state.inventory.pets.push(item);
  return true;
}

export function equipAccessory(instanceId) {
  if (state.equipped.accessories.length >= 1) return false;

  const idx = state.inventory.accessories.findIndex((item) => item.instanceId === instanceId);
  if (idx === -1) return false;

  const item = state.inventory.accessories.splice(idx, 1)[0];
  state.equipped.accessories.push(item);
  return true;
}

export function unequipAccessory(instanceId) {
  const idx = state.equipped.accessories.findIndex((item) => item.instanceId === instanceId);
  if (idx === -1) return false;

  const item = state.equipped.accessories.splice(idx, 1)[0];
  state.inventory.accessories.push(item);
  return true;
}

export function reserveCase(caseType) {
  if (!state.inventory.cases[caseType]) return false;
  state.inventory.cases[caseType] -= 1;
  return true;
}

export function applyCaseReward(reward) {
  if (reward.type === 'coins') {
    state.coins += reward.amount;
    return { ok: true, message: `Выпало ${formatNumber(reward.amount)} монет` };
  }

  if (reward.type === 'buff') {
    state.inventory.buffs.push(createBuffInstance(reward.key));
    return { ok: true, message: `Выпал баф: ${getBuffDef(reward.key).name}` };
  }

  if (reward.type === 'pet') {
    state.inventory.pets.push(createPetInstance(reward.key));
    return { ok: true, message: `Выпал пет: ${getPetDef(reward.key).name}` };
  }

  if (reward.type === 'accessory') {
    state.inventory.accessories.push(createAccessoryInstance(reward.key));
    return { ok: true, message: `Выпал аксессуар: ${getAccessoryDef(reward.key).name}` };
  }

  return { ok: false };
}

function renderCases() {
  const entries = Object.entries(CASES).filter(([key]) => (state.inventory.cases[key] || 0) > 0);

  if (!entries.length) {
    return `<div class="empty-card">Кейсов пока нет</div>`;
  }

  return `
    <div class="inventory-grid">
      ${entries.map(([key, cfg]) => `
        <article class="inventory-card ${cfg.featured ? 'oksicase' : ''}">
          <div class="inventory-card-top">
            ${iconHtml(cfg.icon, cfg.rarity)}
            <div>
              <div class="inventory-title">${cfg.name}</div>
              <div class="rarity-badge rarity-${cfg.rarity}">${cfg.rarity.toUpperCase()}</div>
              <div class="inventory-subtitle">Количество: ${state.inventory.cases[key]}</div>
            </div>
          </div>
          <div class="inventory-bottom">
            <div class="inventory-meta">Готов к открытию</div>
            <button class="buy-btn" data-open-case="${key}">Открыть</button>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderBuffs() {
  const active = state.equipped.buffs.map((item) => {
    const def = getBuffDef(item.key);
    const seconds = Math.max(0, Math.floor((item.expiresAt - Date.now()) / 1000));

    return `
      <article class="inventory-card">
        <div class="inventory-card-top">
          ${iconHtml(def.icon, def.rarity)}
          <div>
            <div class="inventory-title">${def.name}</div>
            <div class="rarity-badge rarity-${def.rarity}">${def.rarity.toUpperCase()}</div>
            <div class="inventory-subtitle">${def.description}</div>
          </div>
        </div>
        <div class="inventory-bottom">
          <div class="inventory-meta">Активен ещё ${formatDuration(seconds)}</div>
        </div>
      </article>
    `;
  }).join('');

  const inventory = state.inventory.buffs.map((item) => {
    const def = getBuffDef(item.key);
    return `
      <article class="inventory-card">
        <div class="inventory-card-top">
          ${iconHtml(def.icon, def.rarity)}
          <div>
            <div class="inventory-title">${def.name}</div>
            <div class="rarity-badge rarity-${def.rarity}">${def.rarity.toUpperCase()}</div>
            <div class="inventory-subtitle">${def.description}</div>
          </div>
        </div>
        <div class="inventory-bottom">
          <div class="inventory-meta">Инвентарь</div>
          <button class="buy-btn" data-activate-buff="${item.instanceId}" ${state.equipped.buffs.length >= 3 ? 'disabled' : ''}>Активировать</button>
        </div>
      </article>
    `;
  }).join('');

  if (!active && !inventory) return `<div class="empty-card">Бафов пока нет</div>`;
  return `<div class="inventory-grid">${active}${inventory}</div>`;
}

function renderPets() {
  const active = state.equipped.pets.map((item) => {
    const def = getPetDef(item.key);
    return `
      <article class="inventory-card">
        <div class="inventory-card-top">
          ${iconHtml(def.icon, def.rarity)}
          <div>
            <div class="inventory-title">${def.name}</div>
            <div class="rarity-badge rarity-${def.rarity}">${def.rarity.toUpperCase()}</div>
            <div class="inventory-subtitle">${def.description}</div>
          </div>
        </div>
        <div class="inventory-bottom">
          <div class="inventory-meta">Активен</div>
          <button class="buy-btn" data-unequip-pet="${item.instanceId}">Снять</button>
        </div>
      </article>
    `;
  }).join('');

  const inventory = state.inventory.pets.map((item) => {
    const def = getPetDef(item.key);
    return `
      <article class="inventory-card">
        <div class="inventory-card-top">
          ${iconHtml(def.icon, def.rarity)}
          <div>
            <div class="inventory-title">${def.name}</div>
            <div class="rarity-badge rarity-${def.rarity}">${def.rarity.toUpperCase()}</div>
            <div class="inventory-subtitle">${def.description}</div>
          </div>
        </div>
        <div class="inventory-bottom">
          <div class="inventory-meta">Инвентарь</div>
          <button class="buy-btn" data-equip-pet="${item.instanceId}" ${state.equipped.pets.length >= 3 ? 'disabled' : ''}>Надеть</button>
        </div>
      </article>
    `;
  }).join('');

  if (!active && !inventory) return `<div class="empty-card">Петов пока нет</div>`;
  return `<div class="inventory-grid">${active}${inventory}</div>`;
}

function renderAccessories() {
  const active = state.equipped.accessories.map((item) => {
    const def = getAccessoryDef(item.key);
    return `
      <article class="inventory-card">
        <div class="inventory-card-top">
          ${iconHtml(def.icon, def.rarity)}
          <div>
            <div class="inventory-title">${def.name}</div>
            <div class="rarity-badge rarity-${def.rarity}">${def.rarity.toUpperCase()}</div>
            <div class="inventory-subtitle">${def.description}</div>
          </div>
        </div>
        <div class="inventory-bottom">
          <div class="inventory-meta">Надет</div>
          <button class="buy-btn" data-unequip-accessory="${item.instanceId}">Снять</button>
        </div>
      </article>
    `;
  }).join('');

  const inventory = state.inventory.accessories.map((item) => {
    const def = getAccessoryDef(item.key);
    return `
      <article class="inventory-card">
        <div class="inventory-card-top">
          ${iconHtml(def.icon, def.rarity)}
          <div>
            <div class="inventory-title">${def.name}</div>
            <div class="rarity-badge rarity-${def.rarity}">${def.rarity.toUpperCase()}</div>
            <div class="inventory-subtitle">${def.description}</div>
          </div>
        </div>
        <div class="inventory-bottom">
          <div class="inventory-meta">Инвентарь</div>
          <button class="buy-btn" data-equip-accessory="${item.instanceId}" ${state.equipped.accessories.length >= 1 ? 'disabled' : ''}>Надеть</button>
        </div>
      </article>
    `;
  }).join('');

  if (!active && !inventory) return `<div class="empty-card">Аксессуаров пока нет</div>`;
  return `<div class="inventory-grid">${active}${inventory}</div>`;
}

export function renderInventory(handlers) {
  dom.activeBuffsCount.textContent = `${state.equipped.buffs.length} / 3`;
  dom.activePetsCount.textContent = `${state.equipped.pets.length} / 3`;
  dom.activeAccessoriesCount.textContent = `${state.equipped.accessories.length} / 1`;

  const tab = state.ui.inventoryTab;
  let html = '';

  if (tab === 'cases') html = renderCases();
  if (tab === 'buffs') html = renderBuffs();
  if (tab === 'pets') html = renderPets();
  if (tab === 'accessories') html = renderAccessories();

  dom.inventoryContent.innerHTML = html;

  dom.inventoryContent.querySelectorAll('[data-open-case]').forEach((el) => {
    el.addEventListener('click', () => handlers.onOpenCase(el.dataset.openCase));
  });
  dom.inventoryContent.querySelectorAll('[data-activate-buff]').forEach((el) => {
    el.addEventListener('click', () => handlers.onActivateBuff(el.dataset.activateBuff));
  });
  dom.inventoryContent.querySelectorAll('[data-equip-pet]').forEach((el) => {
    el.addEventListener('click', () => handlers.onEquipPet(el.dataset.equipPet));
  });
  dom.inventoryContent.querySelectorAll('[data-unequip-pet]').forEach((el) => {
    el.addEventListener('click', () => handlers.onUnequipPet(el.dataset.unequipPet));
  });
  dom.inventoryContent.querySelectorAll('[data-equip-accessory]').forEach((el) => {
    el.addEventListener('click', () => handlers.onEquipAccessory(el.dataset.equipAccessory));
  });
  dom.inventoryContent.querySelectorAll('[data-unequip-accessory]').forEach((el) => {
    el.addEventListener('click', () => handlers.onUnequipAccessory(el.dataset.unequipAccessory));
  });
}
