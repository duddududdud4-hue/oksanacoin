import { dom } from './dom.js';
import { state, saveState, SAVE_INTERVAL_MS } from './state.js';
import { resetExpiredBoosts, getTapPower, applyOnlineDelta } from './game.js';
import { applyUpgrade } from './upgrades.js';
import { dailyRewards, getDailyClaimStatus, applyDailyRewardLocally } from './daily.js';
import {
  showLoadingScreen,
  hideLoadingScreen,
  showAuthScreen,
  hideAuthScreen,
  updateUI,
  enterApp,
  openDailyModal,
  closeDailyModal,
  closeAfkModal,
  openScreen,
  renderDailyRewards
} from './ui.js';
import {
  bootstrapFromServer,
  hydrateStateFromServer,
  savePlayerStateToServer
} from './api.js';
import { register } from './auth.js';
import { bindLeaderboard, syncWithCloud } from './leaderboard.js';
import { handleAppHidden, handleAppVisible } from './afk.js';
import { buyShopBoost, buyCase } from './shop.js';
import {
  activateBuff,
  equipPet,
  unequipPet,
  equipAccessory,
  unequipAccessory,
  reserveCase,
  applyCaseReward
} from './inventory.js';
import { openCaseAnimation, closeCaseModal } from './case-opening.js';

const tg = window.Telegram?.WebApp;
const NICKNAME_CHANGE_COST = 10000;
const ADMIN_TELEGRAM_ID = '7878558600';

let caseOpeningInProgress = false;
let frameStarted = false;
let lastFrameTime = 0;
let lastStateSaveTime = 0;
let lastServerSaveTime = 0;
let lastUiRefreshTime = 0;
let forceSyncInFlight = false;

if (tg) {
  tg.ready();
  tg.expand();
  tg.headerColor = '#0a0a12';
  tg.backgroundColor = '#0a0a12';
}

function showMessage(text) {
  if (tg?.showAlert) tg.showAlert(text);
  else alert(text);
}

function triggerHapticImpact(style = 'medium') {
  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(style);
}

function triggerHapticSuccess() {
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
}

function createParticle(x, y, text) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.textContent = text;
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 800);
}

function isGameScreenActive() {
  return document.getElementById('screen-game')?.classList.contains('active');
}

function refreshUI() {
  saveState(state);
  updateUI(handlers);
}

function softRefreshUI(now = performance.now()) {
  if (now - lastUiRefreshTime >= 50) {
    updateUI(handlers);
    lastUiRefreshTime = now;
  }
}

async function forceSyncFromServer() {
  if (forceSyncInFlight) return false;
  forceSyncInFlight = true;

  try {
    const serverData = await bootstrapFromServer();
    if (!serverData?.ok) return false;

    hydrateStateFromServer(serverData);

    const offlineFrom = serverData.state?.last_active_at
      ? new Date(serverData.state.last_active_at).getTime()
      : Date.now();

    state.lastTime = offlineFrom;
    refreshUI();
    return true;
  } catch (error) {
    console.error('forceSyncFromServer error:', error);
    return false;
  } finally {
    forceSyncInFlight = false;
  }
}

window.forceSyncFromServer = forceSyncFromServer;

function onBuyUpgrade(type) {
  const ok = applyUpgrade(type);
  if (!ok) return;

  refreshUI();
  triggerHapticSuccess();
  savePlayerStateToServer();
}

function onTap(event) {
  const tapPower = getTapPower();
  if (state.energy < tapPower) return;

  state.coins += tapPower;
  state.energy -= tapPower;

  createParticle(event.clientX, event.clientY, `+${tapPower}`);
  triggerHapticImpact('medium');
  refreshUI();
}

function onClaimDailyReward() {
  const status = getDailyClaimStatus();
  if (!status.canClaim) return;

  if (status.missed) {
    state.daily.streak = 0;
    state.daily.cycleDay = 1;
  }

  const rewardIndex = state.daily.cycleDay - 1;
  const reward = dailyRewards[rewardIndex] || dailyRewards[0];

  applyDailyRewardLocally(reward);
  state.daily.lastClaimAt = Date.now();
  state.daily.streak += 1;
  state.daily.cycleDay = state.daily.cycleDay >= dailyRewards.length ? 1 : state.daily.cycleDay + 1;

  refreshUI();
  triggerHapticSuccess();
  renderDailyRewards();
  savePlayerStateToServer();
}

function onRegister() {
  const ok = register();
  if (!ok) return;
  enterApp(handlers);
}

function onChangeNickname() {
  if (!state.name || !isGameScreenActive()) return;

  if (state.coins < NICKNAME_CHANGE_COST) {
    showMessage(`Нужно ${NICKNAME_CHANGE_COST.toLocaleString('ru-RU')} монет для смены никнейма.`);
    return;
  }

  const nextName = prompt('Новый никнейм:', state.name)?.trim();
  if (!nextName || nextName.length < 2 || nextName === state.name) return;

  state.coins -= NICKNAME_CHANGE_COST;
  state.name = nextName;

  refreshUI();
  triggerHapticSuccess();
  savePlayerStateToServer();
  syncWithCloud();
}

function onBuyShopBoost(key) {
  if (!buyShopBoost(key)) return;

  refreshUI();
  triggerHapticSuccess();
  savePlayerStateToServer();
}

function onBuyCase(caseType) {
  if (!buyCase(caseType)) return;

  refreshUI();
  triggerHapticSuccess();
  savePlayerStateToServer();
}

async function onOpenCase(caseType) {
  if (caseOpeningInProgress) return;
  if (!reserveCase(caseType)) return;

  caseOpeningInProgress = true;
  refreshUI();

  try {
    const reward = await openCaseAnimation(caseType);
    const result = applyCaseReward(reward);

    refreshUI();
    triggerHapticSuccess();
    savePlayerStateToServer();

    if (result.message) {
      showMessage(result.message);
    }
  } catch (error) {
    console.error('case opening error:', error);
    showMessage('Не удалось открыть кейс.');
  } finally {
    caseOpeningInProgress = false;
    closeCaseModal();
  }
}

function onActivateBuff(instanceId) {
  if (!activateBuff(instanceId)) {
    showMessage('Можно активировать максимум 3 бафа одновременно.');
    return;
  }

  refreshUI();
  triggerHapticSuccess();
  savePlayerStateToServer();
}

function onEquipPet(instanceId) {
  if (!equipPet(instanceId)) {
    showMessage('Можно надеть максимум 3 пета.');
    return;
  }

  refreshUI();
  triggerHapticSuccess();
  savePlayerStateToServer();
}

function onUnequipPet(instanceId) {
  if (!unequipPet(instanceId)) return;

  refreshUI();
  savePlayerStateToServer();
}

function onEquipAccessory(instanceId) {
  if (!equipAccessory(instanceId)) {
    showMessage('Можно надеть только 1 аксессуар.');
    return;
  }

  refreshUI();
  triggerHapticSuccess();
  savePlayerStateToServer();
}

function onUnequipAccessory(instanceId) {
  if (!unequipAccessory(instanceId)) return;

  refreshUI();
  savePlayerStateToServer();
}

function onAdminAddCoins() {
  if (String(state.telegramId || '') !== ADMIN_TELEGRAM_ID) return;

  state.coins += 5000;
  refreshUI();
  triggerHapticSuccess();
  savePlayerStateToServer();
}

const handlers = {
  onBuyUpgrade,
  onBuyShopBoost,
  onBuyCase,
  onOpenCase,
  onActivateBuff,
  onEquipPet,
  onUnequipPet,
  onEquipAccessory,
  onUnequipAccessory
};

function bindEvents() {
  dom.registerBtn?.addEventListener('click', onRegister);

  dom.nicknameInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') onRegister();
  });

  dom.coinBtn?.addEventListener('pointerdown', onTap);
  dom.displayName?.addEventListener('click', onChangeNickname);
  dom.adminAddCoinsBtn?.addEventListener('click', onAdminAddCoins);

  dom.navItems.forEach((item) => {
    item.addEventListener('click', () => {
      openScreen(item.dataset.screen);
      updateUI(handlers);
    });
  });

  dom.shopTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.ui.shopTab = tab.dataset.shopTab;
      dom.shopTabs.forEach((x) => x.classList.toggle('active-inventory-tab', x === tab));
      updateUI(handlers);
    });
  });

  dom.inventoryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.ui.inventoryTab = tab.dataset.inventoryTab;
      dom.inventoryTabs.forEach((x) => x.classList.toggle('active-inventory-tab', x === tab));
      updateUI(handlers);
    });
  });

  dom.dailyRewardBtn?.addEventListener('click', openDailyModal);
  dom.dailyModalClose?.addEventListener('click', closeDailyModal);
  dom.claimDailyBtn?.addEventListener('click', onClaimDailyReward);
  dom.afkCloseBtn?.addEventListener('click', closeAfkModal);

  dom.caseModalClose?.addEventListener('click', () => {
    if (!caseOpeningInProgress) closeCaseModal();
  });

  dom.dailyModal?.addEventListener('click', (event) => {
    if (event.target === dom.dailyModal) closeDailyModal();
  });

  dom.afkModal?.addEventListener('click', (event) => {
    if (event.target === dom.afkModal) closeAfkModal();
  });

  dom.caseModal?.addEventListener('click', (event) => {
    if (event.target === dom.caseModal && !caseOpeningInProgress) {
      closeCaseModal();
    }
  });

  window.addEventListener('beforeunload', handleAppHidden);

  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) {
      handleAppHidden();
    } else {
      await forceSyncFromServer();
      handleAppVisible(handlers);
    }
  });
}

function startGameLoop() {
  if (frameStarted) return;
  frameStarted = true;

  const loop = (now) => {
    if (!lastFrameTime) {
      lastFrameTime = now;
      lastStateSaveTime = now;
      lastServerSaveTime = now;
      lastUiRefreshTime = now;
    }

    const deltaMs = Math.min(now - lastFrameTime, 120);
    lastFrameTime = now;

    if (!document.hidden) {
      resetExpiredBoosts();

      const changed = applyOnlineDelta(deltaMs / 1000);

      if (changed) {
        softRefreshUI(now);
      }

      if (now - lastStateSaveTime >= 300) {
        saveState(state);
        lastStateSaveTime = now;
      }

      if (!dom.dailyModal.classList.contains('hidden')) {
        renderDailyRewards();
      }

      if (now - lastServerSaveTime >= SAVE_INTERVAL_MS) {
        savePlayerStateToServer();
        lastServerSaveTime = now;
      }
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

  setInterval(() => {
    syncWithCloud();
  }, 15000);
}

async function init() {
  showLoadingScreen();
  hideAuthScreen();

  bindEvents();
  bindLeaderboard();

  const serverData = await bootstrapFromServer();

  if (serverData?.ok) {
    hydrateStateFromServer(serverData);

    const offlineFrom = serverData.state?.last_active_at
      ? new Date(serverData.state.last_active_at).getTime()
      : Date.now();

    state.lastTime = offlineFrom;

    if (state.name) {
      handleAppVisible(handlers);
      enterApp(handlers);
    } else {
      hideLoadingScreen();
      showAuthScreen();
      updateUI(handlers);
    }

    refreshUI();
    await forceSyncFromServer();
  } else if (state.name) {
    enterApp(handlers);
    refreshUI();
    await forceSyncFromServer();
  } else {
    hideLoadingScreen();
    showAuthScreen();
    updateUI(handlers);
  }

  startGameLoop();
}

window.addEventListener('load', init);
