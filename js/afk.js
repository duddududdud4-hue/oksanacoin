import { state, saveState, AFK_MIN_SECONDS_TO_SHOW } from './state.js';
import { applyOfflineProgress } from './game.js';
import { showAfkModal, updateUI } from './ui.js';
import { savePlayerStateToServer } from './api.js';

export function handleAppHidden() {
  state.lastTime = Date.now();
  saveState(state);
  savePlayerStateToServer();
}

export function handleAppVisible(onBuyUpgrade) {
  const result = applyOfflineProgress(state.lastTime);
  saveState(state);
  updateUI(onBuyUpgrade);

  if (result.diffSeconds >= AFK_MIN_SECONDS_TO_SHOW && result.earnedCoins > 0) {
    showAfkModal(result.earnedCoins, result.diffSeconds);
  }

  savePlayerStateToServer();
}
