import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getDatabase,
  ref,
  set,
  onValue,
  query,
  orderByChild,
  limitToLast
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

import { state } from './state.js';
import { dom } from './dom.js';
import { formatNumber } from './game.js';

const firebaseConfig = {
  databaseURL: 'https://oksicoindb-default-rtdb.firebaseio.com/'
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

let leaderboardBound = false;

function getRankVisual(position) {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return `#${position}`;
}

export function syncWithCloud() {
  if (!state.name) return;

  try {
    set(ref(db, `players/${state.name}`), {
      username: state.name,
      score: Math.floor(state.coins),
      lvl: state.powerLevel,
      passive: state.mineLevel
    });
  } catch (error) {
    console.error('Cloud sync error:', error);
  }
}

export function bindLeaderboard() {
  if (leaderboardBound || !dom.leaderboardList) return;
  leaderboardBound = true;

  const listRef = query(ref(db, 'players'), orderByChild('score'), limitToLast(15));

  onValue(listRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      dom.leaderboardList.innerHTML = `
        <div class="leader-row">
          <div class="leader-player">
            <strong>Пока пусто</strong>
            <span>Стань первым китом Oksicoin</span>
          </div>
        </div>
      `;
      return;
    }

    const sorted = Object.values(data).sort((a, b) => b.score - a.score);

    dom.leaderboardList.innerHTML = sorted.map((player, index) => {
      const position = index + 1;
      const rankClass = position <= 3 ? `rank-${position}` : '';
      const isMe = player.username === state.name ? 'is-me' : '';

      return `
        <article class="leader-row ${rankClass} ${isMe}">
          <div class="leader-left">
            <div class="rank-badge">${getRankVisual(position)}</div>
            <div class="leader-player">
              <strong>${player.username}</strong>
              <span>${position <= 3 ? 'Лидер сезона' : `Место #${position}`}</span>
            </div>
          </div>
          <div class="leader-score">${formatNumber(player.score)} 💎</div>
        </article>
      `;
    }).join('');
  });
}
