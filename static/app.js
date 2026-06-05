// Telegram WebApp init
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

// Global state
let state = {
  user: null,
  balance: 0,
  gameId: null,
  stake: 0,
  myCards: [],
  lang: 'en',
  games_played: 0,
  wins: 0,
  total_won: 0,
  myCardData: [],
  takenCards: []
};

let pollInterval = null;
let countdownInterval = null;

// Translations (English, Amharic, Oromo, Tigrigna) – keep your existing full LANG object
// For brevity, I assume you already have the full LANG object from your original app.js.
// If not, you can copy it from your working version.
const LANG = {
  en: { /* ... your English translations ... */ },
  am: { /* ... your Amharic translations ... */ },
  om: { /* ... your Oromo translations ... */ },
  ti: { /* ... your Tigrigna translations ... */ }
};

function T(key, vars = {}) {
  let text = (LANG[state.lang] && LANG[state.lang][key]) || (LANG.en && LANG.en[key]) || key;
  for (let [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v);
  return text;
}

// API helper
async function apiCall(path, method = 'GET', body = null) {
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    return await res.json();
  } catch (e) {
    console.error('API error:', e);
    return null;
  }
}

// Load user with referral parameter
async function loadUser() {
  const userId = tg?.initDataUnsafe?.user?.id || parseInt(localStorage.getItem('userId') || '99999');
  const username = tg?.initDataUnsafe?.user?.username || 'user';
  const fullName = tg?.initDataUnsafe?.user?.first_name || 'Player';
  const startParam = tg?.initDataUnsafe?.start_param || '';
  let ref = '';
  if (startParam && startParam.startsWith('ref_')) {
    ref = startParam.split('_')[1];
  }
  if (!tg?.initDataUnsafe?.user?.id) localStorage.setItem('userId', userId);

  const data = await apiCall(`/api/player/${userId}?username=${encodeURIComponent(username)}&full_name=${encodeURIComponent(fullName)}&ref=${ref}`);
  if (data && !data.error) {
    state.user = data;
    state.balance = data.balance || 0;
    state.games_played = data.games_played || 0;
    state.wins = data.wins || 0;
    state.total_won = data.total_won || 0;

    if (!state.user.phone) {
      goPage('pg-register');
      return;
    }
    if (state.user.language && LANG[state.user.language]) state.lang = state.user.language;
    updateUILanguage();

    if (data.active_game && !state.gameId) {
      state.gameId = data.active_game.game_id;
      state.stake = data.active_game.stake;
      await loadMyCards();
      if (data.active_game.status === 'running') {
        startGamePolling();
        goPage('pg-game');
      } else {
        goPage('pg-select');
        await refreshGameInfo();
      }
    }
    renderUI();
    loadLatestNotification();
    loadReferralLink();  // <-- NEW
    return true;
  }
  return false;
}

function renderUI() {
  const balanceEl = document.getElementById('balanceDisplay');
  if (balanceEl) balanceEl.innerText = (state.balance || 0).toFixed(2) + ' ETB';
  const wdBalance = document.getElementById('wdBalanceShow');
  if (wdBalance) wdBalance.innerText = (state.balance || 0).toFixed(2) + ' ETB';
  const gamesEl = document.getElementById('stat-games');
  if (gamesEl) gamesEl.innerText = state.games_played || 0;
  const winsEl = document.getElementById('stat-wins');
  if (winsEl) winsEl.innerText = state.wins || 0;
  const wonEl = document.getElementById('stat-won');
  if (wonEl) wonEl.innerText = (state.total_won || 0).toFixed(0);
}

function updateUILanguage() {
  // ... keep your existing updateUILanguage() function (same as original) ...
}

function toggleLang() {
  const order = ['en', 'am', 'om', 'ti'];
  let idx = order.indexOf(state.lang);
  state.lang = order[(idx + 1) % order.length];
  updateUILanguage();
  apiCall('/api/update_profile', 'POST', { user_id: state.user.user_id, language: state.lang });
}

// Navigation
function goPage(pageId) { /* ... existing ... */ }
function navTo(pageId, el) { /* ... existing ... */ }

// Registration & Settings (unchanged)
let selectedRegLang = 'en';
function selectRegLang(lang) { /* ... existing ... */ }
async function completeRegistration() { /* ... existing ... */ }
let selectedSettingsLang = 'en';
function selectSettingsLang(lang) { /* ... existing ... */ }
async function saveSettings() { /* ... existing ... */ }

// --- REFERRAL LINK FUNCTIONS (NEW) ---
async function loadReferralLink() {
  if (!state.user) return;
  const res = await apiCall(`/api/referral_link/${state.user.user_id}`);
  if (res && res.link) {
    const linkInput = document.getElementById('referralLink');
    if (linkInput) linkInput.value = res.link;
  }
}
function copyReferralLink() {
  const linkInput = document.getElementById('referralLink');
  if (linkInput && linkInput.value) {
    navigator.clipboard.writeText(linkInput.value);
    alert('Referral link copied!');
  }
}

// --- GAME FUNCTIONS (keep your existing ones) ---
function buildStakeGrid() { /* ... existing ... */ }
async function joinGame(stake) { /* ... existing ... */ }
function buildCardGrid(takenCards) { /* ... existing ... */ }
async function pickCard(cardNumber) { /* ... existing ... */ }
async function refreshGameInfo() { /* ... existing ... */ }
async function loadMyCards() { /* ... existing ... */ }
function startCountdown(seconds) { /* ... existing ... */ }
function startGamePolling() { /* ... existing ... */ }
function updateGameUI(gameState) { /* ... existing ... */ }
async function renderMyCards(drawnBalls) { /* ... existing ... */ }
function buildCardHTML(cardData, drawnNumbersSet, cardIndex) { /* ... existing ... */ }
function showWinner(gameState) { /* ... existing ... */ }

// Deposit / Withdraw / Inquiry
let selectedDepositAmount = 50;
function buildDepositAmountGrid() { /* ... existing ... */ }
let selectedPlatform = 'telebirr';
function selectPlatform(platform) { /* ... existing ... */ }
async function submitDeposit() { /* ... existing ... */ }
function setWdPlatform(platform, el) { /* ... existing ... */ }
async function submitWithdraw() { /* ... existing ... */ }
async function submitInquiry() { /* ... existing ... */ }
async function loadLatestNotification() { /* ... existing ... */ }
function showAdminPanel() { window.open('/admin', '_blank'); }
async function loadPlatformNumbers() { /* ... existing ... */ }

// Initialization
window.addEventListener('DOMContentLoaded', async () => {
  buildStakeGrid();
  buildDepositAmountGrid();
  await loadPlatformNumbers();
  await loadUser();
  renderUI();
  if (state.user && state.user.phone) {
    const settingsPhone = document.getElementById('settingsPhone');
    if (settingsPhone) settingsPhone.value = state.user.phone;
    if (state.user.language) {
      selectedSettingsLang = state.user.language;
      document.querySelectorAll('.settings-lang-btn').forEach(btn => {
        if (btn.dataset.lang === state.user.language) {
          btn.style.borderColor = 'var(--gold)';
          btn.style.background = 'rgba(255,215,0,0.2)';
        }
      });
    }
  }
  goPage('pg-home');
});
