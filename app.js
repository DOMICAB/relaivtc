const supabaseUrl = "https://oxmzxxlsjehucmnptbug.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bXp4eGxzamVodWNtbnB0YnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTgyOTQsImV4cCI6MjA5MTg3NDI5NH0.JzRzfQAJIaAKo8i-PrzsN6ZVckHGOWY4O_G9CjStWxw";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);function setupTabs() {
  
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const groupName = group.getAttribute('data-tab-group');
    const buttons = document.querySelectorAll(`[data-tab-btn="${groupName}"]`);
    const screens = document.querySelectorAll(`[data-tab-screen="${groupName}"]`);

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        screens.forEach(screen => {
          screen.classList.toggle('active', screen.id === target);
        });
      });
    });
  });
}

function bindDriverStatusFlow() {
  document.querySelectorAll('[data-next-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.mission-card');
      const statusLine = card.querySelector('.status-line');
      const next = btn.getAttribute('data-next-status');

      if (next === 'en_route') {
        statusLine.textContent = 'Statut : En route';
        btn.textContent = 'Sur place';
        btn.setAttribute('data-next-status', 'sur_place');
      } else if (next === 'sur_place') {
        statusLine.textContent = 'Statut : Sur place';
        btn.textContent = 'Client à bord';
        btn.setAttribute('data-next-status', 'client_a_bord');
        const waiting = card.querySelector('.waiting-panel');
        if (waiting) waiting.classList.remove('hidden');
      } else if (next === 'client_a_bord') {
        statusLine.textContent = 'Statut : Client à bord';
        btn.textContent = 'Terminer';
        btn.setAttribute('data-next-status', 'completed');
        const waiting = card.querySelector('.waiting-panel');
        if (waiting) waiting.classList.add('hidden');
      } else if (next === 'completed') {
        statusLine.textContent = 'Statut : Terminée';
        btn.textContent = 'Terminée';
        btn.disabled = true;
      }
    });
  });
}

function bindModeSwitch() {
  document.querySelectorAll('[data-mode-switch]').forEach(wrapper => {
    const buttons = wrapper.querySelectorAll('button');
    const targetSelector = wrapper.getAttribute('data-mode-target');
    const target = document.querySelector(targetSelector);
    if (!target) return;
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        target.setAttribute('data-mode', btn.dataset.mode);
      });
    });
  });
}

function initSimpleChrono() {
  document.querySelectorAll('[data-chrono]').forEach(node => {
    let seconds = 0;
    setInterval(() => {
      if (node.closest('.hidden')) return;
      seconds += 1;
      const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
      const ss = String(seconds % 60).padStart(2, '0');
      node.textContent = `${mm}:${ss}`;
      const paid = node.parentElement.querySelector('[data-after-free]');
      if (seconds > 900 && paid) paid.classList.remove('hidden');
    }, 1000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  bindDriverStatusFlow();
  bindModeSwitch();
  initSimpleChrono();
});
async function loadMissions() {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('status', 'broadcasted');

  if (error) {
    console.error(error);
    return;
  }

  const container = document.querySelector('#driver-courses-list');
  if (!container) return;

  container.innerHTML = '';

  data.forEach(mission => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div><strong>${mission.pickup}</strong> → ${mission.dropoff}</div>
      <div>${mission.price} €</div>
      <button onclick="acceptMission('${mission.id}')">Accepter</button>
    `;

    container.appendChild(card);
  });
}
