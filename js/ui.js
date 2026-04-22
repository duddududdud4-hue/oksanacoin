import { dom } from './dom.js';
import { state } from './state.js';
import { formatNumber } from './game.js';
import { renderUpgrades } from './upgrades.js';
import { dailyRewards, getDailyClaimStatus } from './daily.js';
import { renderShop } from './shop.js';
import { renderInventory } from './inventory.js';

const ADMIN_TELEGRAM_ID = '7878558600';

const coinSkins = [
  { min: 100000, file: './assets/coin6.png' },
  { min: 50000, file: './assets/coin5.png' },
  { min: 25000, file: './assets/coin4.png' },
  { min: 15000, file: './assets/coin3.png' },
  { min: 5000, file: './assets/coin2.png' },
  { min: 0, file: './assets/coin.png' }
];

function getCoinSkinByCoins(coins) {
  const current = coinSkins.find((skin) => coins >= skin.min);
  return current ? current.file : './assets/coin.png';
}

function getNextSkinInfo(coins) {
  const thresholds = [5000, 15000, 25000, 50000, 100000];
  const next = thresholds.find((value) => coins < value);

  if (!next) {
    return { text: '100 000 / 100 000' };
  }

  return { text: `${formatNumber(coins)} / ${formatNumber(next)}` };
}

export function showLoadingScreen() {
  dom.loadingScreen?.classList.remove('hidden');
}

export function hideLoadingScreen() {
  dom.loadingScreen?.classList.add('hidden');
}

export function showAuthScreen() {
  dom.authScreen?.classList.remove('hidden-auth');
}

export function hideAuthScreen() {
  dom.authScreen?.classList.add('hidden-auth');
}

export function updateHeader() {
  dom.displayName.textContent = state.name || '...';
  dom.telegramUsername.textContent = state.telegramUsername ? `@${state.telegramUsername}` : '';
}

export function updateCoinSkin() {
  if (!dom.coinBtn) return;
  dom.coinBtn.style.backgroundImage = `url('${getCoinSkinByCoins(Number(state.coins || 0))}')`;
}

export function updateNextSkinText() {
  if (!dom.nextSkinText) return;
  dom.nextSkinText.textContent = getNextSkinInfo(Number(state.coins || 0)).text;
}

export function updateGiftState() {
  const status = getDailyClaimStatus();
  const isGame = document.getElementById('screen-game')?.classList.contains('active');
  dom.giftDot.classList.toggle('visible', status.canClaim);
  dom.dailyRewardBtn.classList.toggle('claimable', status.canClaim);
  dom.dailyRewardBtn.style.display = isGame ? 'flex' : 'none';
}

export function getCountdownToNextReward() {
  if (!state.daily.lastClaimAt) return 'Награда доступна прямо сейчас';

  const next = new Date(state.daily.lastClaimAt);
  next.setHours(24, 0, 0, 0);

  const diff = next.getTime() - Date.now();
  if (diff <= 0) return 'Награда доступна прямо сейчас';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `Следующая награда через ${hours}ч ${minutes}м`;
}

export function renderDailyRewards() {
  const status = getDailyClaimStatus();
  const currentDay = state.daily.cycleDay;

  dom.dailyStreakText.textContent = `${state.daily.streak} дней`;
  dom.dailyStatusText.textContent = status.canClaim ? 'Можно забрать' : 'Уже получено';
  dom.dailyTimer.textContent = status.canClaim ? 'Сегодняшний подарок уже ждёт тебя' : getCountdownToNextReward();

  dom.claimDailyBtn.disabled = !status.canClaim;
  dom.claimDailyBtn.style.opacity = status.canClaim ? '1' : '0.55';

  dom.dailyGrid.innerHTML = dailyRewards.map((reward, index) => {
    const day = index + 1;
    let stateClass = 'future';
    let badge = 'Скоро';

    if (status.canClaim) {
      if (day < currentDay) {
        stateClass = 'claimed';
        badge = 'Получено';
      } else if (day === currentDay) {
        stateClass = 'available';
        badge = 'Сегодня';
      }
    } else {
      if (day < currentDay) {
        stateClass = 'claimed';
        badge = 'Получено';
      } else if (day === currentDay) {
        stateClass = 'future';
        badge = 'Завтра';
      }
    }

    return `
      <div class="daily-card ${stateClass} ${reward.special ? 'special' : ''}">
        <div class="daily-day">День ${day}</div>
        <div class="daily-icon">${reward.icon}</div>
        <div class="daily-reward-title">${reward.title}</div>
        <div class="daily-reward-desc">${reward.desc}</div>
        <div class="daily-status-badge">${badge}</div>
      </div>
    `;
  }).join('');
}

export function showAfkModal(earnedCoins, diffSeconds) {
  if (!dom.afkModal || earnedCoins <= 0) return;

  const minutes = Math.floor(diffSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  dom.afkEarned.textContent = `+${formatNumber(earnedCoins)}`;
  dom.afkDuration.textContent = hours > 0
    ? `Пока тебя не было ${hours}ч ${restMinutes}м, майнер продолжал работать в AFK-режиме.`
    : `Пока тебя не было ${minutes}м, майнер продолжал работать в AFK-режиме.`;

  dom.afkModal.classList.remove('hidden');
}

export function closeAfkModal() {
  dom.afkModal.classList.add('hidden');
}

export function updateUI(handlers) {
  updateHeader();
  updateCoinSkin();
  updateNextSkinText();

  const isAdminAccount = String(state.telegramId || '') === ADMIN_TELEGRAM_ID;
  const isGameScreen = document.getElementById('screen-game')?.classList.contains('active');

  if (dom.adminTools) {
    dom.adminTools.style.display = isAdminAccount && isGameScreen ? 'block' : 'none';
  }

  dom.counter.textContent = formatNumber(state.coins);
  dom.energyText.textContent = `${Math.floor(state.energy)} / ${state.maxEnergy}`;
  dom.energyFill.style.width = `${Math.max(0, Math.min(100, (state.energy / state.maxEnergy) * 100))}%`;

  renderUpgrades(handlers.onBuyUpgrade);
  renderShop(handlers);
  renderInventory(handlers);
  updateGiftState();

  if (!dom.dailyModal.classList.contains('hidden')) {
    renderDailyRewards();
  }
}

export function enterApp(handlers) {
  hideLoadingScreen();
  hideAuthScreen();
  updateUI(handlers);
}

export function showNicknameStep(handlers) {
  hideLoadingScreen();
  showAuthScreen();
  updateUI(handlers);
}

export function openDailyModal() {
  renderDailyRewards();
  dom.dailyModal.classList.remove('hidden');
}

export function closeDailyModal() {
  dom.dailyModal.classList.add('hidden');
}

export function openScreen(name) {
  dom.screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === `screen-${name}`);
  });

  dom.navItems.forEach((item) => {
    item.classList.toggle('active-nav', item.dataset.screen === name);
  });

  updateGiftState();
}
