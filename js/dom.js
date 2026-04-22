export const dom = {
  loadingScreen: document.getElementById('loading-screen'),
  authScreen: document.getElementById('auth-screen'),
  nicknameInput: document.getElementById('nickname-input'),
  registerBtn: document.getElementById('register-btn'),

  displayName: document.getElementById('display-name'),
  telegramUsername: document.getElementById('telegram-username'),
  counter: document.getElementById('counter'),
  energyText: document.getElementById('energy-text'),
  energyFill: document.getElementById('energy-fill'),
  coinBtn: document.getElementById('coin-btn'),
  nextSkinText: document.getElementById('next-skin-text'),
  adminTools: document.getElementById('admin-tools'),
  adminAddCoinsBtn: document.getElementById('admin-add-coins-btn'),

  upgradesList: document.getElementById('upgrades-list'),
  leaderboardList: document.getElementById('leaderboard-list'),
  shopContent: document.getElementById('shop-content'),
  inventoryContent: document.getElementById('inventory-content'),

  activeBuffsCount: document.getElementById('active-buffs-count'),
  activePetsCount: document.getElementById('active-pets-count'),
  activeAccessoriesCount: document.getElementById('active-accessories-count'),

  shopTabs: Array.from(document.querySelectorAll('[data-shop-tab]')),
  inventoryTabs: Array.from(document.querySelectorAll('[data-inventory-tab]')),

  navItems: Array.from(document.querySelectorAll('.nav-item')),
  screens: Array.from(document.querySelectorAll('.screen')),

  dailyRewardBtn: document.getElementById('daily-reward-btn'),
  giftDot: document.getElementById('gift-dot'),
  dailyModal: document.getElementById('daily-modal'),
  dailyModalClose: document.getElementById('daily-modal-close'),
  claimDailyBtn: document.getElementById('claim-daily-btn'),
  dailyGrid: document.getElementById('daily-grid'),
  dailyStreakText: document.getElementById('daily-streak-text'),
  dailyStatusText: document.getElementById('daily-status-text'),
  dailyTimer: document.getElementById('daily-timer'),

  afkModal: document.getElementById('afk-modal'),
  afkEarned: document.getElementById('afk-earned'),
  afkDuration: document.getElementById('afk-duration'),
  afkCloseBtn: document.getElementById('afk-close-btn'),

  caseModal: document.getElementById('case-modal'),
  caseModalClose: document.getElementById('case-modal-close'),
  caseModalSubtitle: document.getElementById('case-modal-subtitle'),
  caseReel: document.getElementById('case-reel'),
  caseResult: document.getElementById('case-result'),
  caseResultName: document.getElementById('case-result-name'),
  caseResultDesc: document.getElementById('case-result-desc'),
  caseClaimBtn: document.getElementById('case-claim-btn'),

  caseInfoModal: document.getElementById('case-info-modal'),
  caseInfoClose: document.getElementById('case-info-close'),
  caseInfoTitle: document.getElementById('case-info-title'),
  caseInfoPrice: document.getElementById('case-info-price'),
  caseInfoDesc: document.getElementById('case-info-desc'),
  caseInfoOdds: document.getElementById('case-info-odds')
};
