import { state, DAY_MS, OFFLINE_PASSIVE_MULTIPLIER } from './state.js';
import { getBuffDef, getPetDef, getAccessoryDef } from './items.js';

export function formatNumber(value) {
  return Math.floor(Number(value || 0)).toLocaleString('ru-RU');
}

export function isBoostActive(until) {
  return Number(until) > Date.now();
}

export function cleanupExpiredInventoryBuffs() {
  const now = Date.now();
  state.equipped.buffs = state.equipped.buffs.filter(
    (item) => Number(item.expiresAt || 0) > now
  );
}

function sumEffects(collection, getter) {
  return collection.reduce((acc, item) => {
    const def = getter(item.key);
    if (!def?.effect) return acc;

    for (const [key, value] of Object.entries(def.effect)) {
      acc[key] = (acc[key] || 0) + Number(value || 0);
    }

    return acc;
  }, {});
}

function getEquipmentEffects() {
  cleanupExpiredInventoryBuffs();

  const buffEffects = sumEffects(state.equipped.buffs, getBuffDef);
  const petEffects = sumEffects(state.equipped.pets, getPetDef);
  const accessoryEffects = sumEffects(state.equipped.accessories, getAccessoryDef);

  const all = {};
  for (const source of [buffEffects, petEffects, accessoryEffects]) {
    for (const [key, value] of Object.entries(source)) {
      all[key] = (all[key] || 0) + value;
    }
  }

  return all;
}

export function getGlobalMultiplier() {
  return isBoostActive(state.boosts.globalBoostUntil)
    ? state.boosts.globalBoostMultiplier
    : 1;
}

export function getTapBoostMultiplier() {
  return isBoostActive(state.boosts.tapBoostUntil)
    ? state.boosts.tapBoostMultiplier
    : 1;
}

export function getPassiveBoostMultiplier() {
  return isBoostActive(state.boosts.passiveBoostUntil)
    ? state.boosts.passiveBoostMultiplier
    : 1;
}

export function getRegenBoostMultiplier() {
  return isBoostActive(state.boosts.regenBoostUntil)
    ? state.boosts.regenBoostMultiplier
    : 1;
}

export function getOfflineBoostMultiplier() {
  return isBoostActive(state.boosts.offlineBoostUntil)
    ? state.boosts.offlineBoostMultiplier
    : 1;
}

export function getTapPower() {
  const effects = getEquipmentEffects();

  const coinsMultiplier = effects.coinsMultiplier || 1;
  const tapBonus = effects.tapBonus || 0;
  const allIncomeBonus = effects.allIncomeBonus || 0;

  return Math.floor(
    state.powerPerTap *
      getTapBoostMultiplier() *
      getGlobalMultiplier() *
      coinsMultiplier *
      (1 + tapBonus + allIncomeBonus)
  );
}

export function getPassivePerSecond() {
  const effects = getEquipmentEffects();

  const coinsMultiplier = effects.coinsMultiplier || 1;
  const passiveMultiplier = effects.passiveMultiplier || 1;
  const passiveBonus = effects.passiveBonus || 0;
  const allIncomeBonus = effects.allIncomeBonus || 0;

  return (
    state.passivePerSecond *
    getPassiveBoostMultiplier() *
    getGlobalMultiplier() *
    coinsMultiplier *
    passiveMultiplier *
    (1 + passiveBonus + allIncomeBonus)
  );
}

export function getRegenPerSecond() {
  const effects = getEquipmentEffects();

  const regenMultiplier = effects.regenMultiplier || 1;
  const regenBonus = effects.regenBonus || 0;

  return (
    state.regenPerSecond *
    getRegenBoostMultiplier() *
    getGlobalMultiplier() *
    regenMultiplier *
    (1 + regenBonus)
  );
}

export function getOfflinePassivePerSecond() {
  const effects = getEquipmentEffects();
  const offlineBonus = effects.offlineBonus || 0;

  return (
    getPassivePerSecond() *
    getOfflineBoostMultiplier() *
    OFFLINE_PASSIVE_MULTIPLIER *
    (1 + offlineBonus)
  );
}

export function resetExpiredBoosts() {
  const now = Date.now();

  if (state.boosts.tapBoostUntil <= now) state.boosts.tapBoostMultiplier = 1;
  if (state.boosts.passiveBoostUntil <= now) state.boosts.passiveBoostMultiplier = 1;
  if (state.boosts.regenBoostUntil <= now) state.boosts.regenBoostMultiplier = 1;
  if (state.boosts.globalBoostUntil <= now) state.boosts.globalBoostMultiplier = 1;
  if (state.boosts.offlineBoostUntil <= now) state.boosts.offlineBoostMultiplier = 1;

  cleanupExpiredInventoryBuffs();
}

export function getDaysBetween(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const utcStart = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const utcEnd = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  return Math.floor((utcEnd - utcStart) / DAY_MS);
}

export function applyOfflineProgress(fromTimestamp) {
  const now = Date.now();
  const lastTimestamp = Number(fromTimestamp || now);
  const diffSeconds = Math.max(0, Math.floor((now - lastTimestamp) / 1000));

  if (!diffSeconds) {
    state.lastTime = now;
    return { earnedCoins: 0, diffSeconds: 0 };
  }

  const earnedCoins = diffSeconds * getOfflinePassivePerSecond();
  if (earnedCoins > 0) {
    state.coins += earnedCoins;
  }

  if (state.energy < state.maxEnergy) {
    state.energy = Math.min(
      state.maxEnergy,
      state.energy + (diffSeconds * getRegenPerSecond())
    );
  }

  resetExpiredBoosts();
  state.lastTime = now;

  return { earnedCoins, diffSeconds };
}

export function applyOnlineDelta(deltaSeconds) {
  let changed = false;

  resetExpiredBoosts();

  const passiveGain = getPassivePerSecond() * deltaSeconds;
  if (passiveGain > 0) {
    state.coins += passiveGain;
    changed = true;
  }

  if (state.energy < state.maxEnergy) {
    const nextEnergy = Math.min(
      state.maxEnergy,
      state.energy + (getRegenPerSecond() * deltaSeconds)
    );

    if (nextEnergy !== state.energy) {
      state.energy = nextEnergy;
      changed = true;
    }
  }

  return changed;
}
