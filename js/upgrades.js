import { state } from './state.js';
import { getTapPower, getPassivePerSecond, getRegenPerSecond, formatNumber } from './game.js';
import { dom } from './dom.js';

export const upgradeDefinitions = {
  tap: {
    title: 'Сила тапа',
    description: 'Увеличивает количество монет за одно нажатие.',
    baseCost: 10,
    growth: 1.55,
    label: 'Улучшить',
    getEffect: () => `+${getTapPower()} за тап`,
    nextEffect: () => `Следующий уровень: +${state.powerPerTap + 1}`
  },
  mine: {
    title: 'Авто-майнер',
    description: 'Добавляет пассивную добычу, даже когда ты не тапаешь.',
    baseCost: 50,
    growth: 1.65,
    label: 'Нанять',
    getEffect: () => `+${getPassivePerSecond()}/сек`,
    nextEffect: () => `Следующий уровень: +${state.passivePerSecond + 1}/сек`
  },
  limit: {
    title: 'Лимит энергии',
    description: 'Повышает максимальный запас энергии для длинных сессий.',
    baseCost: 100,
    growth: 1.45,
    label: '+1000 ⚡',
    getEffect: () => `${state.maxEnergy} максимум`,
    nextEffect: () => `Следующий уровень: ${state.maxEnergy + 1000}`
  },
  regen: {
    title: 'Регенерация',
    description: 'Ускоряет восстановление энергии каждую секунду.',
    baseCost: 150,
    growth: 1.8,
    label: 'Ускорить',
    getEffect: () => `+${getRegenPerSecond()}/сек`,
    nextEffect: () => `Следующий уровень: +${state.regenPerSecond + 2}/сек`
  }
};

export function getUpgradeCost(type) {
  const def = upgradeDefinitions[type];
  const levelMap = {
    tap: state.powerLevel,
    mine: state.mineLevel,
    limit: state.energyLevel,
    regen: state.regenLevel
  };
  const level = levelMap[type];
  return Math.floor(def.baseCost * Math.pow(def.growth, Math.max(0, level - (type === 'mine' ? 0 : 1))));
}

export function getUpgradeLevel(type) {
  if (type === 'tap') return state.powerLevel;
  if (type === 'mine') return state.mineLevel;
  if (type === 'limit') return state.energyLevel;
  if (type === 'regen') return state.regenLevel;
  return 0;
}

export function applyUpgrade(type) {
  const cost = getUpgradeCost(type);
  if (state.coins < cost) return false;

  state.coins -= cost;

  if (type === 'tap') {
    state.powerLevel += 1;
    state.powerPerTap += 1;
  } else if (type === 'mine') {
    state.mineLevel += 1;
    state.passivePerSecond += 1;
  } else if (type === 'limit') {
    state.energyLevel += 1;
    state.maxEnergy += 1000;
    state.energy = Math.min(state.maxEnergy, state.energy + 1000);
  } else if (type === 'regen') {
    state.regenLevel += 1;
    state.regenPerSecond += 2;
  }

  return true;
}

export function renderUpgrades(onBuy) {
  dom.upgradesList.innerHTML = Object.entries(upgradeDefinitions).map(([type, def]) => {
    const cost = getUpgradeCost(type);
    const level = getUpgradeLevel(type);
    const disabled = state.coins < cost;

    return `
      <article class="upgrade-card">
        <div class="upgrade-top">
          <div>
            <div class="upgrade-title">${def.title}</div>
            <div class="upgrade-desc">${def.description}</div>
          </div>
          <div class="level-badge">
            <span>Уровень</span>
            <strong>${level}</strong>
          </div>
        </div>
        <div class="upgrade-bottom">
          <div class="upgrade-meta">
            <div class="upgrade-effect">${def.getEffect()}</div>
            <div class="upgrade-desc">${def.nextEffect()}</div>
            <div class="upgrade-price">💰 ${formatNumber(cost)}</div>
          </div>
          <button class="buy-btn" data-upgrade="${type}" ${disabled ? 'disabled' : ''}>${def.label}</button>
        </div>
      </article>
    `;
  }).join('');

  dom.upgradesList.querySelectorAll('[data-upgrade]').forEach((button) => {
    button.addEventListener('click', () => onBuy(button.dataset.upgrade));
  });
}
