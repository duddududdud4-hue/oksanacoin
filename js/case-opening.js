import { dom } from './dom.js';
import { getRewardPresentation, rollCaseReward } from './items.js';

const REEL_ITEM_WIDTH = 92;
const REEL_GAP = 12;
const REEL_STEP = REEL_ITEM_WIDTH + REEL_GAP;
const REEL_SIDE_PADDING = 16;

// Долго крутится, но без затягивания
const SPIN_DURATION_MS = 13500;

// Чем больше, тем дальше лента проедет
const BASE_ITEMS_COUNT = 140;

// На каком индексе гарантированно стоит выигрышный предмет
const WINNER_INDEX = 112;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

function makeVisualPool(caseType) {
  const pool = [];
  const push = (reward, count) => {
    for (let i = 0; i < count; i += 1) pool.push(reward);
  };

  if (caseType === 'common') {
    push({ type: 'coins', amount: 4000 }, 10);
    push({ type: 'coins', amount: 8000 }, 8);
    push({ type: 'coins', amount: 10000 }, 6);

    push({ type: 'buff', key: 'buff_x2_coins_5m' }, 8);
    push({ type: 'buff', key: 'buff_x2_passive_10m' }, 8);
    push({ type: 'buff', key: 'buff_x2_regen_10m' }, 8);

    push({ type: 'accessory', key: 'acc_simple_chain' }, 7);
    push({ type: 'accessory', key: 'acc_dark_glasses' }, 7);
    push({ type: 'accessory', key: 'acc_gold_chain' }, 5);

    push({ type: 'pet', key: 'pet_oksi_cat' }, 5);
    push({ type: 'pet', key: 'pet_hamster_miner' }, 4);

    // Визуально дорогие вещи будут пролетать чаще
    push({ type: 'accessory', key: 'acc_oksi_crown' }, 4);
    push({ type: 'pet', key: 'pet_golden_fox' }, 3);
    push({ type: 'accessory', key: 'acc_royal_crown' }, 3);
    push({ type: 'accessory', key: 'acc_crown_of_oksi' }, 2);
  }

  if (caseType === 'rare') {
    push({ type: 'coins', amount: 10000 }, 8);
    push({ type: 'coins', amount: 15000 }, 7);
    push({ type: 'coins', amount: 20000 }, 6);
    push({ type: 'coins', amount: 28000 }, 4);

    push({ type: 'buff', key: 'buff_x2_coins_15m' }, 7);
    push({ type: 'buff', key: 'buff_x2_passive_20m' }, 6);
    push({ type: 'buff', key: 'buff_x2_regen_15m' }, 6);
    push({ type: 'buff', key: 'buff_x3_coins_10m' }, 5);

    push({ type: 'accessory', key: 'acc_gold_chain' }, 5);
    push({ type: 'accessory', key: 'acc_stylish_watch' }, 5);
    push({ type: 'accessory', key: 'acc_neon_bracelet' }, 5);

    push({ type: 'pet', key: 'pet_golden_fox' }, 4);
    push({ type: 'pet', key: 'pet_mini_whale' }, 4);

    push({ type: 'accessory', key: 'acc_oksi_crown' }, 4);
    push({ type: 'accessory', key: 'acc_diamond_ring' }, 4);
    push({ type: 'accessory', key: 'acc_royal_crown' }, 3);
    push({ type: 'pet', key: 'pet_crystal_raven' }, 3);
    push({ type: 'pet', key: 'pet_whale_king' }, 2);
    push({ type: 'accessory', key: 'acc_crown_of_oksi' }, 2);
  }

  if (caseType === 'oksicase') {
    push({ type: 'coins', amount: 30000 }, 8);
    push({ type: 'coins', amount: 45000 }, 7);
    push({ type: 'coins', amount: 60000 }, 6);
    push({ type: 'coins', amount: 80000 }, 5);

    push({ type: 'buff', key: 'buff_x2_coins_15m' }, 6);
    push({ type: 'buff', key: 'buff_x2_passive_20m' }, 6);
    push({ type: 'buff', key: 'buff_x2_regen_15m' }, 6);
    push({ type: 'buff', key: 'buff_x3_coins_10m' }, 6);

    push({ type: 'accessory', key: 'acc_oksi_crown' }, 5);
    push({ type: 'accessory', key: 'acc_diamond_ring' }, 5);
    push({ type: 'accessory', key: 'acc_royal_crown' }, 4);

    push({ type: 'pet', key: 'pet_mini_whale' }, 4);
    push({ type: 'pet', key: 'pet_crystal_raven' }, 4);
    push({ type: 'pet', key: 'pet_whale_king' }, 3);
    push({ type: 'accessory', key: 'acc_crown_of_oksi' }, 3);
  }

  return pool;
}

function randomFromPool(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function reelItemHtml(reward, isWinner = false) {
  const view = getRewardPresentation(reward);

  return `
    <div class="case-reel-item${isWinner ? ' case-reel-item-winner' : ''}">
      <div class="item-icon ${view.rarity}">${view.icon}</div>
      <div class="case-reel-item-name">${view.name}</div>
    </div>
  `;
}

function buildTrack(caseType, finalReward) {
  const pool = makeVisualPool(caseType);
  const items = [];

  for (let i = 0; i < BASE_ITEMS_COUNT; i += 1) {
    if (i === WINNER_INDEX) {
      items.push(finalReward);
    } else {
      items.push(randomFromPool(pool));
    }
  }

  return items;
}

function getTargetTranslate() {
  const wrapWidth = dom.caseReel.parentElement.clientWidth;
  const wrapCenter = wrapWidth / 2;

  const winnerCenter =
    REEL_SIDE_PADDING +
    (WINNER_INDEX * REEL_STEP) +
    (REEL_ITEM_WIDTH / 2);

  return Math.max(0, winnerCenter - wrapCenter);
}

function animateReelTo(targetX, durationMs) {
  return new Promise((resolve) => {
    let rafId = 0;
    const startX = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = easeOutQuint(progress);
      const currentX = startX + ((targetX - startX) * eased);

      dom.caseReel.style.transform = `translate3d(-${currentX}px, 0, 0)`;

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(rafId);
        resolve();
      }
    };

    rafId = requestAnimationFrame(tick);
  });
}

export function closeCaseModal() {
  dom.caseModal?.classList.add('hidden');
  dom.caseResult?.classList.add('hidden');

  if (dom.caseReel) {
    dom.caseReel.style.transform = 'translate3d(0,0,0)';
    dom.caseReel.innerHTML = '';
  }
}

export async function openCaseAnimation(caseType) {
  const finalReward = rollCaseReward(caseType);
  const track = buildTrack(caseType, finalReward);

  dom.caseModal.classList.remove('hidden');
  dom.caseResult.classList.add('hidden');
  dom.caseModalSubtitle.textContent = 'Лента наград крутится...';

  dom.caseReel.innerHTML = track
    .map((reward, index) => reelItemHtml(reward, index === WINNER_INDEX))
    .join('');

  dom.caseReel.style.transform = 'translate3d(0,0,0)';

  await wait(40);

  const targetTranslate = getTargetTranslate();

  await animateReelTo(targetTranslate, SPIN_DURATION_MS);

  const winnerEl = dom.caseReel.querySelector('.case-reel-item-winner');
  if (winnerEl) {
    winnerEl.classList.add('case-reel-item-hit');
  }

  const view = getRewardPresentation(finalReward);
  dom.caseModalSubtitle.textContent = 'Кейс открыт';
  dom.caseResultName.textContent = `${view.icon} ${view.name}`;
  dom.caseResultDesc.textContent = view.description;
  dom.caseResult.classList.remove('hidden');

  return new Promise((resolve) => {
    const onClaim = () => {
      dom.caseClaimBtn.removeEventListener('click', onClaim);
      resolve(finalReward);
    };

    dom.caseClaimBtn.addEventListener('click', onClaim, { once: true });
  });
}
