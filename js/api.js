import {
  state,
  saveState,
  getDefaultState,
  setState,
  setStorageNamespace,
  loadStateForTelegram,
  migrateLegacyStateForTelegram
} from './state.js';

export async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  return response.json();
}

function hasMeaningfulInventory(inv) {
  if (!inv) return false;

  const cases = inv.cases || {};
  const caseCount = Object.values(cases).some((value) => Number(value || 0) > 0);

  return (
    caseCount ||
    (inv.buffs && inv.buffs.length > 0) ||
    (inv.pets && inv.pets.length > 0) ||
    (inv.accessories && inv.accessories.length > 0)
  );
}

function hasMeaningfulEquipped(eq) {
  if (!eq) return false;
  return (
    (eq.buffs && eq.buffs.length > 0) ||
    (eq.pets && eq.pets.length > 0) ||
    (eq.accessories && eq.accessories.length > 0)
  );
}

function maxNumber(a, b) {
  return Math.max(Number(a || 0), Number(b || 0));
}

export function applyServerState(serverState) {
  if (!serverState) return;

  state.coins = Number(serverState.coins ?? state.coins);
  state.energy = Number(serverState.energy ?? state.energy);
  state.maxEnergy = Number(serverState.max_energy ?? state.maxEnergy);
  state.powerPerTap = Number(serverState.power_per_tap ?? state.powerPerTap);
  state.passivePerSecond = Number(serverState.passive_per_second ?? state.passivePerSecond);
  state.regenPerSecond = Number(serverState.regen_per_second ?? state.regenPerSecond);
  state.powerLevel = Number(serverState.power_level ?? state.powerLevel);
  state.mineLevel = Number(serverState.mine_level ?? state.mineLevel);
  state.energyLevel = Number(serverState.energy_level ?? state.energyLevel);
  state.regenLevel = Number(serverState.regen_level ?? state.regenLevel);

  if (serverState.inventory_json) {
    state.inventory = {
      ...getDefaultState().inventory,
      ...serverState.inventory_json,
      cases: {
        ...getDefaultState().inventory.cases,
        ...(serverState.inventory_json.cases || {})
      }
    };
  }

  if (serverState.equipped_json) {
    state.equipped = {
      ...getDefaultState().equipped,
      ...serverState.equipped_json
    };
  }
}

export function applyServerDaily(serverDaily) {
  if (!serverDaily) return;

  state.daily.streak = Number(serverDaily.streak ?? state.daily.streak);
  state.daily.cycleDay = Number(serverDaily.cycle_day ?? state.daily.cycleDay);
  state.daily.lastClaimAt = serverDaily.last_claim_at
    ? new Date(serverDaily.last_claim_at).getTime()
    : 0;
}

export async function bootstrapFromServer() {
  const telegramApp = window.Telegram?.WebApp;
  if (!telegramApp?.initData) return null;

  try {
    const authData = await apiRequest('/api/auth-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: telegramApp.initData })
    });

    if (!authData.ok) return null;

    const playerData = await apiRequest(
      `/api/player?telegram_id=${encodeURIComponent(authData.user.telegram_id)}`
    );

    if (!playerData.ok) return null;

    return playerData;
  } catch (error) {
    console.error('bootstrapFromServer error:', error);
    return null;
  }
}

let saveInFlight = false;

export async function savePlayerStateToServer() {
  if (!state.telegramId || saveInFlight) return;

  saveInFlight = true;

  try {
    await apiRequest('/api/save-player-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegram_id: state.telegramId,
        display_name: state.name,
        state: {
          coins: Math.floor(state.coins),
          energy: Math.floor(state.energy),
          max_energy: state.maxEnergy,
          power_per_tap: state.powerPerTap,
          passive_per_second: state.passivePerSecond,
          regen_per_second: state.regenPerSecond,
          power_level: state.powerLevel,
          mine_level: state.mineLevel,
          energy_level: state.energyLevel,
          regen_level: state.regenLevel,
          inventory_json: state.inventory,
          equipped_json: state.equipped
        },
        daily: {
          streak: state.daily.streak,
          cycle_day: state.daily.cycleDay,
          last_claim_at: state.daily.lastClaimAt
            ? new Date(state.daily.lastClaimAt).toISOString()
            : null
        }
      })
    });
  } catch (error) {
    console.error('savePlayerStateToServer error:', error);
  } finally {
    saveInFlight = false;
  }
}

export function hydrateStateFromServer(serverData) {
  const telegramId = String(serverData?.user?.telegram_id || '');
  const username = serverData?.user?.username || '';
  const displayName = serverData?.user?.display_name || '';

  setStorageNamespace(telegramId);

  const scopedLocal =
    loadStateForTelegram(telegramId) ||
    migrateLegacyStateForTelegram({
      telegram_id: telegramId,
      username,
      display_name: displayName
    }) ||
    getDefaultState();

  const localSnapshot = { ...scopedLocal };
  const serverState = serverData?.state || {};
  const serverDaily = serverData?.daily || {};

  const baseState = {
    ...getDefaultState(),
    ...scopedLocal,
    telegramId,
    telegramUsername: username || scopedLocal.telegramUsername || '',
    name: displayName || scopedLocal.name || ''
  };

  setState(baseState);
  applyServerState(serverState);
  applyServerDaily(serverDaily);

  state.coins = maxNumber(localSnapshot.coins, serverState.coins);
  state.maxEnergy = maxNumber(localSnapshot.maxEnergy, serverState.max_energy);
  state.powerPerTap = maxNumber(localSnapshot.powerPerTap, serverState.power_per_tap);
  state.passivePerSecond = maxNumber(localSnapshot.passivePerSecond, serverState.passive_per_second);
  state.regenPerSecond = maxNumber(localSnapshot.regenPerSecond, serverState.regen_per_second);
  state.powerLevel = maxNumber(localSnapshot.powerLevel, serverState.power_level);
  state.mineLevel = maxNumber(localSnapshot.mineLevel, serverState.mine_level);
  state.energyLevel = maxNumber(localSnapshot.energyLevel, serverState.energy_level);
  state.regenLevel = maxNumber(localSnapshot.regenLevel, serverState.regen_level);
  state.energy = Math.min(
    state.maxEnergy,
    maxNumber(localSnapshot.energy, serverState.energy)
  );

  if (hasMeaningfulInventory(localSnapshot.inventory)) {
    state.inventory = localSnapshot.inventory;
  }

  if (hasMeaningfulEquipped(localSnapshot.equipped)) {
    state.equipped = localSnapshot.equipped;
  }

  saveState(state);
}
