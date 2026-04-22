import { state } from './state.js';
import { getDaysBetween } from './game.js';

export const dailyRewards = [
  { type: 'coins', amount: 2500, icon: '🪙', title: 'Стартовый бонус', desc: '+2 500 монет' },
  { type: 'coins', amount: 4000, icon: '💎', title: 'Уверенный старт', desc: '+4 000 монет' },
  { type: 'coins', amount: 6000, icon: '💰', title: 'Разгон', desc: '+6 000 монет' },
  { type: 'tapBoost', multiplier: 2, durationMinutes: 10, icon: '⚡', title: 'Тап-буст', desc: 'x2 к тапу на 10 мин' },
  { type: 'coins', amount: 9000, icon: '🪙', title: 'Денежный день', desc: '+9 000 монет' },
  { type: 'regenBoost', multiplier: 3, durationMinutes: 15, icon: '🔋', title: 'Турбо-реген', desc: 'x3 реген на 15 мин' },
  { type: 'coins', amount: 12000, icon: '💎', title: 'Недельный бонус', desc: '+12 000 монет' },
  { type: 'offlineBoost', multiplier: 2, durationHours: 12, icon: '🌙', title: 'Оффлайн-буст', desc: 'x2 оффлайн на 12 ч' },
  { type: 'coins', amount: 16000, icon: '💰', title: 'Большой плюс', desc: '+16 000 монет' },
  { type: 'passiveBoost', multiplier: 2, durationMinutes: 20, icon: '⛏️', title: 'Пассивный буст', desc: 'x2 пассивка на 20 мин' },
  { type: 'coins', amount: 22000, icon: '🪙', title: 'Deluxe payday', desc: '+22 000 монет' },
  { type: 'energyCoins', amount: 12000, restoreFullEnergy: true, icon: '⚡', title: 'Энерго-пак', desc: 'Полная энергия +12 000' },
  { type: 'coins', amount: 30000, icon: '💎', title: 'Золотой день', desc: '+30 000 монет' },
  { type: 'tapBoost', multiplier: 3, durationMinutes: 15, icon: '🔥', title: 'Mega tap', desc: 'x3 к тапу на 15 мин' },
  { type: 'globalBoost', multiplier: 2, durationMinutes: 25, coins: 50000, icon: '👑', title: 'Deluxe reward', desc: '+50 000 и x2 ко всему на 25 мин', special: true }
];

export function getDailyClaimStatus() {
  const lastClaimAt = state.daily.lastClaimAt;
  if (!lastClaimAt) return { canClaim: true, missed: false };

  const diffDays = getDaysBetween(new Date(lastClaimAt), new Date());
  if (diffDays <= 0) return { canClaim: false, missed: false };
  if (diffDays === 1) return { canClaim: true, missed: false };
  return { canClaim: true, missed: true };
}

export function applyDailyRewardLocally(reward) {
  switch (reward.type) {
    case 'coins':
      state.coins += reward.amount;
      break;
    case 'tapBoost':
      state.boosts.tapBoostMultiplier = reward.multiplier;
      state.boosts.tapBoostUntil = Date.now() + reward.durationMinutes * 60 * 1000;
      break;
    case 'regenBoost':
      state.boosts.regenBoostMultiplier = reward.multiplier;
      state.boosts.regenBoostUntil = Date.now() + reward.durationMinutes * 60 * 1000;
      break;
    case 'offlineBoost':
      state.boosts.offlineBoostMultiplier = reward.multiplier;
      state.boosts.offlineBoostUntil = Date.now() + reward.durationHours * 60 * 60 * 1000;
      break;
    case 'passiveBoost':
      state.boosts.passiveBoostMultiplier = reward.multiplier;
      state.boosts.passiveBoostUntil = Date.now() + reward.durationMinutes * 60 * 1000;
      break;
    case 'energyCoins':
      if (reward.restoreFullEnergy) state.energy = state.maxEnergy;
      state.coins += reward.amount;
      break;
    case 'globalBoost':
      if (reward.coins) state.coins += reward.coins;
      state.boosts.globalBoostMultiplier = reward.multiplier;
      state.boosts.globalBoostUntil = Date.now() + reward.durationMinutes * 60 * 1000;
      break;
  }
}
