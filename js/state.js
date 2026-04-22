export const APP_VERSION = '6.0';
export const STORAGE_KEY = 'oksicoin_state_v60';
export const STORAGE_PREFIX = 'oksicoin_state_tg_v60_';
export const LAST_ACTIVE_TELEGRAM_KEY = 'oksicoin_last_active_telegram_id_v60';

export const DAY_MS = 24 * 60 * 60 * 1000;
export const SAVE_INTERVAL_MS = 25000;
export const AFK_MIN_SECONDS_TO_SHOW = 600;
export const OFFLINE_PASSIVE_MULTIPLIER = 0.5;

let currentStorageKey = STORAGE_KEY;

export function getDefaultState() {
  return {
    version: APP_VERSION,
    telegramId: '',
    telegramUsername: '',
    name: '',
    coins: 0,
    energy: 1000,
    maxEnergy: 1000,
    powerPerTap: 1,
    passivePerSecond: 0,
    regenPerSecond: 2,
    powerLevel: 1,
    mineLevel: 0,
    energyLevel: 1,
    regenLevel: 1,
    boosts: {
      tapBoostUntil: 0,
      tapBoostMultiplier: 1,
      passiveBoostUntil: 0,
      passiveBoostMultiplier: 1,
      regenBoostUntil: 0,
      regenBoostMultiplier: 1,
      globalBoostUntil: 0,
      globalBoostMultiplier: 1,
      offlineBoostUntil: 0,
      offlineBoostMultiplier: 1
    },
    daily: {
      streak: 0,
      cycleDay: 1,
      lastClaimAt: 0
    },
    inventory: {
      cases: { common: 0, rare: 0, oksicase: 0 },
      buffs: [],
      pets: [],
      accessories: [],
      meta: {
        shopBoostLimits: {}
      }
    },
    equipped: {
      buffs: [],
      pets: [],
      accessories: []
    },
    ui: {
      shopTab: 'boosts',
      inventoryTab: 'cases'
    },
    lastTime: Date.now()
  };
}

function normalizeState(parsed) {
  return {
    ...getDefaultState(),
    ...parsed,
    boosts: {
      ...getDefaultState().boosts,
      ...(parsed?.boosts || {})
    },
    daily: {
      ...getDefaultState().daily,
      ...(parsed?.daily || {})
    },
    inventory: {
      ...getDefaultState().inventory,
      ...(parsed?.inventory || {}),
      cases: {
        ...getDefaultState().inventory.cases,
        ...(parsed?.inventory?.cases || {})
      },
      meta: {
        ...getDefaultState().inventory.meta,
        ...(parsed?.inventory?.meta || {}),
        shopBoostLimits: {
          ...getDefaultState().inventory.meta.shopBoostLimits,
          ...(parsed?.inventory?.meta?.shopBoostLimits || {})
        }
      }
    },
    equipped: {
      ...getDefaultState().equipped,
      ...(parsed?.equipped || {})
    },
    ui: {
      ...getDefaultState().ui,
      ...(parsed?.ui || {})
    },
    version: APP_VERSION
  };
}

function parseSavedValue(raw) {
  if (!raw) return null;

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function getScopedStorageKey(telegramId) {
  return `${STORAGE_PREFIX}${telegramId}`;
}

export function setStorageNamespace(telegramId) {
  if (telegramId) {
    currentStorageKey = getScopedStorageKey(String(telegramId));
    localStorage.setItem(LAST_ACTIVE_TELEGRAM_KEY, String(telegramId));
  } else {
    currentStorageKey = STORAGE_KEY;
  }
}

export function loadStateForTelegram(telegramId) {
  if (!telegramId) return null;
  return parseSavedValue(localStorage.getItem(getScopedStorageKey(String(telegramId))));
}

export function loadState() {
  const current = parseSavedValue(localStorage.getItem(currentStorageKey));
  if (current) return current;

  const lastActiveTelegramId = localStorage.getItem(LAST_ACTIVE_TELEGRAM_KEY);
  if (lastActiveTelegramId) {
    const scoped = parseSavedValue(
      localStorage.getItem(getScopedStorageKey(lastActiveTelegramId))
    );
    if (scoped) {
      currentStorageKey = getScopedStorageKey(lastActiveTelegramId);
      return scoped;
    }
  }

  return getDefaultState();
}

export function saveState(nextState) {
  const effectiveKey = nextState?.telegramId
    ? getScopedStorageKey(String(nextState.telegramId))
    : currentStorageKey;

  currentStorageKey = effectiveKey;
  localStorage.setItem(effectiveKey, JSON.stringify(normalizeState(nextState)));

  if (nextState?.telegramId) {
    localStorage.setItem(LAST_ACTIVE_TELEGRAM_KEY, String(nextState.telegramId));
  }
}

export function clearAllCurrentOksicoinStorage() {
  const keysToDelete = [];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;

    if (
      key.startsWith('oksicoin_state_') ||
      key.startsWith('oksicoin_state_tg_') ||
      key.startsWith('oksicoin_last_active_telegram_id')
    ) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => localStorage.removeItem(key));
}

export let state = loadState();

export function setState(nextState) {
  state = normalizeState(nextState);
}
