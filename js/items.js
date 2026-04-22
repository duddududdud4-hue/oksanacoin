const nowId = () => `it_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const SHOP_BOOSTS = [
  { key: 'buff_x2_coins_15m', price: 15000 },
  { key: 'buff_x3_coins_10m', price: 40000 },
  { key: 'buff_x2_passive_20m', price: 25000 },
  { key: 'buff_x2_regen_15m', price: 15000 }
];

export const CASES = {
  common: {
    key: 'common',
    name: 'Обычный кейс',
    price: 15000,
    icon: '📦',
    rarity: 'common',
    description: 'Базовый кейс. Чаще всего даёт слабый лут и почти никогда не окупается.'
  },
  rare: {
    key: 'rare',
    name: 'Редкий кейс',
    price: 35000,
    icon: '🎁',
    rarity: 'rare',
    description: 'Более дорогой кейс с лучшими шансами на ценные бусты, аксессуары и петов.'
  },
  oksicase: {
    key: 'oksicase',
    name: 'OKSICASE',
    price: 100000,
    icon: '👑',
    rarity: 'legendary',
    featured: true,
    description: 'Премиальный кейс. Самый дорогой лут, сильные предметы и шанс Mythic меньше 1%.'
  }
};

export const BUFF_LIBRARY = {
  buff_x2_coins_15m: {
    key: 'buff_x2_coins_15m',
    name: 'x2 монеты',
    icon: '💸',
    rarity: 'rare',
    description: 'Удваивает доход от тапа и пассивки на 15 минут.',
    durationMs: 15 * 60 * 1000,
    effect: { coinsMultiplier: 2 }
  },
  buff_x3_coins_10m: {
    key: 'buff_x3_coins_10m',
    name: 'x3 монеты',
    icon: '💎',
    rarity: 'epic',
    description: 'Утроит доход от тапа и пассивки на 10 минут.',
    durationMs: 10 * 60 * 1000,
    effect: { coinsMultiplier: 3 }
  },
  buff_x2_passive_20m: {
    key: 'buff_x2_passive_20m',
    name: 'x2 пассивка',
    icon: '⛏️',
    rarity: 'rare',
    description: 'Удваивает пассивный доход на 20 минут.',
    durationMs: 20 * 60 * 1000,
    effect: { passiveMultiplier: 2 }
  },
  buff_x2_regen_15m: {
    key: 'buff_x2_regen_15m',
    name: 'x2 реген',
    icon: '⚡',
    rarity: 'rare',
    description: 'Удваивает реген энергии на 15 минут.',
    durationMs: 15 * 60 * 1000,
    effect: { regenMultiplier: 2 }
  },
  buff_x2_coins_5m: {
    key: 'buff_x2_coins_5m',
    name: 'x2 монеты mini',
    icon: '🪙',
    rarity: 'common',
    description: 'Удваивает доход на 5 минут.',
    durationMs: 5 * 60 * 1000,
    effect: { coinsMultiplier: 2 }
  },
  buff_x2_passive_10m: {
    key: 'buff_x2_passive_10m',
    name: 'x2 пассивка mini',
    icon: '🔧',
    rarity: 'common',
    description: 'Удваивает пассивный доход на 10 минут.',
    durationMs: 10 * 60 * 1000,
    effect: { passiveMultiplier: 2 }
  },
  buff_x2_regen_10m: {
    key: 'buff_x2_regen_10m',
    name: 'x2 реген mini',
    icon: '🔋',
    rarity: 'common',
    description: 'Удваивает реген на 10 минут.',
    durationMs: 10 * 60 * 1000,
    effect: { regenMultiplier: 2 }
  }
};

export const PET_LIBRARY = {
  pet_oksi_cat: {
    key: 'pet_oksi_cat',
    name: 'Oksi Cat',
    icon: '🐱',
    rarity: 'rare',
    description: '+8% к регену энергии',
    effect: { regenBonus: 0.08 }
  },
  pet_hamster_miner: {
    key: 'pet_hamster_miner',
    name: 'Hamster Miner',
    icon: '🐹',
    rarity: 'rare',
    description: '+8% к пассивному доходу',
    effect: { passiveBonus: 0.08 }
  },
  pet_golden_fox: {
    key: 'pet_golden_fox',
    name: 'Golden Fox',
    icon: '🦊',
    rarity: 'epic',
    description: '+12% к доходу от тапов',
    effect: { tapBonus: 0.12 }
  },
  pet_mini_whale: {
    key: 'pet_mini_whale',
    name: 'Mini Whale',
    icon: '🐋',
    rarity: 'epic',
    description: '+12% к AFK-доходу',
    effect: { offlineBonus: 0.12 }
  },
  pet_crystal_raven: {
    key: 'pet_crystal_raven',
    name: 'Crystal Bor',
    icon: '🧑‍🦽',
    rarity: 'legendary',
    description: '+10% ко всем доходам',
    effect: { allIncomeBonus: 0.1 }
  },
  pet_whale_king: {
    key: 'pet_whale_king',
    name: 'Crambaca',
    icon: '🐶',
    rarity: 'mythic',
    description: '+20% к AFK и +10% к пассивке',
    effect: { offlineBonus: 0.2, passiveBonus: 0.1 }
  }
};

export const ACCESSORY_LIBRARY = {
  acc_simple_chain: {
    key: 'acc_simple_chain',
    name: 'Намордник',
    icon: '😷',
    rarity: 'common',
    description: '+2% к тапу',
    effect: { tapBonus: 0.02 }
  },
  acc_dark_glasses: {
    key: 'acc_dark_glasses',
    name: 'Тёмные очки',
    icon: '🕶️',
    rarity: 'common',
    description: '+3% к AFK',
    effect: { offlineBonus: 0.03 }
  },
  acc_gold_chain: {
    key: 'acc_gold_chain',
    name: 'Золотая цепь',
    icon: '🔗',
    rarity: 'rare',
    description: '+5% к тапу',
    effect: { tapBonus: 0.05 }
  },
  acc_stylish_watch: {
    key: 'acc_stylish_watch',
    name: 'Стильные часы',
    icon: '⌚',
    rarity: 'rare',
    description: '+5% к пассивке',
    effect: { passiveBonus: 0.05 }
  },
  acc_neon_bracelet: {
    key: 'acc_neon_bracelet',
    name: 'Смарт часы',
    icon: '⌚',
    rarity: 'rare',
    description: '+5% к регену',
    effect: { regenBonus: 0.05 }
  },
  acc_oksi_crown: {
    key: 'acc_oksi_crown',
    name: 'Корона Окси',
    icon: '👑',
    rarity: 'epic',
    description: '+7% ко всем доходам',
    effect: { allIncomeBonus: 0.07 }
  },
  acc_diamond_ring: {
    key: 'acc_diamond_ring',
    name: 'Алмазное кольцо',
    icon: '💍',
    rarity: 'epic',
    description: '+10% к тапу',
    effect: { tapBonus: 0.1 }
  },
  acc_royal_crown: {
    key: 'acc_royal_crown',
    name: 'Royal Bor',
    icon: '🧑‍🦽',
    rarity: 'legendary',
    description: '+12% ко всем доходам',
    effect: { allIncomeBonus: 0.12 }
  },
  acc_crown_of_oksi: {
    key: 'acc_crown_of_oksi',
    name: 'Crown of Oksi',
    icon: '✨',
    rarity: 'mythic',
    description: '+20% ко всем доходам',
    effect: { allIncomeBonus: 0.2 }
  }
};

export const CASE_ODDS = {
  common: [
    {
      title: 'Монеты',
      chance: '45%',
      rarity: 'common',
      items: ['4 000', '6 000', '8 000', '10 000']
    },
    {
      title: 'Буст',
      chance: '25%',
      rarity: 'common',
      items: ['x2 монеты mini', 'x2 пассивка mini', 'x2 реген mini']
    },
    {
      title: 'Common аксессуар',
      chance: '18%',
      rarity: 'common',
      items: ['Намордник', 'Тёмные очки']
    },
    {
      title: 'Rare аксессуар',
      chance: '8%',
      rarity: 'rare',
      items: ['Золотая цепь', 'Стильные часы', 'Смарт часы']
    },
    {
      title: 'Rare pet',
      chance: '3.7%',
      rarity: 'rare',
      items: ['Oksi Cat', 'Hamster Miner']
    },
    {
      title: 'Mythic аксессуар',
      chance: '0.3%',
      rarity: 'mythic',
      items: ['Crown of Oksi']
    }
  ],
  rare: [
    {
      title: 'Монеты',
      chance: '30%',
      rarity: 'common',
      items: ['10 000', '15 000', '20 000', '28 000']
    },
    {
      title: 'Буст',
      chance: '28%',
      rarity: 'rare',
      items: ['x2 монеты', 'x2 пассивка', 'x2 реген']
    },
    {
      title: 'Rare аксессуар',
      chance: '22%',
      rarity: 'rare',
      items: ['Золотая цепь', 'Стильные часы', 'Смарт часы']
    },
    {
      title: 'Epic pet',
      chance: '12%',
      rarity: 'epic',
      items: ['Golden Fox', 'Mini Whale']
    },
    {
      title: 'Epic / Legendary предмет',
      chance: '7.2%',
      rarity: 'legendary',
      items: ['Корона Окси', 'Алмазное кольцо', 'Royal Bor']
    },
    {
      title: 'Mythic pet',
      chance: '0.8%',
      rarity: 'mythic',
      items: ['Crambaca']
    }
  ],
  oksicase: [
    {
      title: 'Монеты',
      chance: '22%',
      rarity: 'common',
      items: ['30 000', '45 000', '60 000', '80 000']
    },
    {
      title: 'Буст',
      chance: '20%',
      rarity: 'epic',
      items: ['x2 монеты', 'x3 монеты', 'x2 пассивка', 'x2 реген']
    },
    {
      title: 'Epic аксессуар',
      chance: '22%',
      rarity: 'epic',
      items: ['Корона Окси', 'Алмазное кольцо']
    },
    {
      title: 'Legendary аксессуар',
      chance: '18%',
      rarity: 'legendary',
      items: ['Royal Bor']
    },
    {
      title: 'Сильный pet',
      chance: '17.2%',
      rarity: 'legendary',
      items: ['Crystal Bor', 'Mini Whale']
    },
    {
      title: 'Mythic аксессуар',
      chance: '0.8%',
      rarity: 'mythic',
      items: ['Crown of Oksi']
    }
  ]
};

export function createBuffInstance(key) {
  return { instanceId: nowId(), kind: 'buff', key };
}

export function createPetInstance(key) {
  return { instanceId: nowId(), kind: 'pet', key };
}

export function createAccessoryInstance(key) {
  return { instanceId: nowId(), kind: 'accessory', key };
}

export function getBuffDef(key) {
  return BUFF_LIBRARY[key];
}

export function getPetDef(key) {
  return PET_LIBRARY[key];
}

export function getAccessoryDef(key) {
  return ACCESSORY_LIBRARY[key];
}

export function getCaseOdds(caseType) {
  return CASE_ODDS[caseType] || [];
}

function pickByWeight(entries) {
  const total = entries.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const item of entries) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return entries[entries.length - 1];
}

export function rollCaseReward(caseType) {
  const tables = {
    common: [
      { weight: 45, reward: { type: 'coins', amount: [4000, 6000, 8000, 10000][Math.floor(Math.random() * 4)] } },
      { weight: 25, reward: { type: 'buff', key: ['buff_x2_coins_5m', 'buff_x2_passive_10m', 'buff_x2_regen_10m'][Math.floor(Math.random() * 3)] } },
      { weight: 18, reward: { type: 'accessory', key: ['acc_simple_chain', 'acc_dark_glasses'][Math.floor(Math.random() * 2)] } },
      { weight: 8, reward: { type: 'accessory', key: ['acc_gold_chain', 'acc_stylish_watch', 'acc_neon_bracelet'][Math.floor(Math.random() * 3)] } },
      { weight: 3.7, reward: { type: 'pet', key: ['pet_oksi_cat', 'pet_hamster_miner'][Math.floor(Math.random() * 2)] } },
      { weight: 0.3, reward: { type: 'accessory', key: 'acc_crown_of_oksi' } }
    ],
    rare: [
      { weight: 30, reward: { type: 'coins', amount: [10000, 15000, 20000, 28000][Math.floor(Math.random() * 4)] } },
      { weight: 28, reward: { type: 'buff', key: ['buff_x2_coins_15m', 'buff_x2_passive_20m', 'buff_x2_regen_15m'][Math.floor(Math.random() * 3)] } },
      { weight: 22, reward: { type: 'accessory', key: ['acc_gold_chain', 'acc_stylish_watch', 'acc_neon_bracelet'][Math.floor(Math.random() * 3)] } },
      { weight: 12, reward: { type: 'pet', key: ['pet_golden_fox', 'pet_mini_whale'][Math.floor(Math.random() * 2)] } },
      { weight: 7.2, reward: { type: 'accessory', key: ['acc_oksi_crown', 'acc_diamond_ring', 'acc_royal_crown'][Math.floor(Math.random() * 3)] } },
      { weight: 0.8, reward: { type: 'pet', key: 'pet_whale_king' } }
    ],
    oksicase: [
      { weight: 22, reward: { type: 'coins', amount: [30000, 45000, 60000, 80000][Math.floor(Math.random() * 4)] } },
      { weight: 20, reward: { type: 'buff', key: ['buff_x2_coins_15m', 'buff_x3_coins_10m', 'buff_x2_passive_20m', 'buff_x2_regen_15m'][Math.floor(Math.random() * 4)] } },
      { weight: 22, reward: { type: 'accessory', key: ['acc_oksi_crown', 'acc_diamond_ring'][Math.floor(Math.random() * 2)] } },
      { weight: 18, reward: { type: 'accessory', key: 'acc_royal_crown' } },
      { weight: 17.2, reward: { type: 'pet', key: ['pet_crystal_raven', 'pet_mini_whale'][Math.floor(Math.random() * 2)] } },
      { weight: 0.8, reward: { type: 'accessory', key: 'acc_crown_of_oksi' } }
    ]
  };

  return pickByWeight(tables[caseType]).reward;
}

export function getRewardPresentation(reward) {
  if (reward.type === 'coins') {
    return {
      name: `${reward.amount.toLocaleString('ru-RU')} монет`,
      description: 'Монеты сразу добавятся на баланс.',
      icon: '🪙',
      rarity: reward.amount >= 60000 ? 'legendary' : reward.amount >= 20000 ? 'epic' : 'common'
    };
  }

  if (reward.type === 'buff') {
    const def = getBuffDef(reward.key);
    return { name: def.name, description: def.description, icon: def.icon, rarity: def.rarity };
  }

  if (reward.type === 'pet') {
    const def = getPetDef(reward.key);
    return { name: def.name, description: def.description, icon: def.icon, rarity: def.rarity };
  }

  if (reward.type === 'accessory') {
    const def = getAccessoryDef(reward.key);
    return { name: def.name, description: def.description, icon: def.icon, rarity: def.rarity };
  }

  return { name: 'Неизвестно', description: '', icon: '❔', rarity: 'common' };
}
