import { state, saveState } from './state.js';
import { savePlayerStateToServer } from './api.js';

export function register() {
  const input = document.getElementById('nickname-input');
  const name = input?.value?.trim() || '';

  if (name.length < 2) return false;

  state.name = name;
  saveState(state);
  savePlayerStateToServer();
  return true;
}
