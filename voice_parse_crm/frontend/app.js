// ─── STATE ────────────────────────────────────────────────────
let entries = [];
let currentTab = 'table';
let isRecording = false;
let recInterval = null;
let recSeconds = 0;
let waveInterval = null;
let recognition = null;

// ─── WAVEFORM ─────────────────────────────────────────────────
function initWaveform() {
  const area = document.getElementById('waveformArea');
  area.innerHTML = '';
  for (let i = 0; i < 32; i++) {
    const bar = document.createElement('div');
    bar.className = 'waveform-bar';
    bar.id = 'wb' + i;
    area.appendChild(bar);
  }
}

function animateWaveform(active) {
  clearInterval(waveInterval);
  if (!active) {
    for (let i = 0; i < 32; i++) {
      const bar = document.getElementById('wb' + i);
      if (bar) bar.style.height = '8px';
    }
    return;
  }
  waveInterval = setInterval(() => {
    for (let i = 0; i < 32; i++) {
      const bar = document.getElementById('wb' + i);
      if (!bar) continue;
      const h = Math.floor(Math.random() * 28) + 4;
      bar.style.height = h + 'px';
      bar.style.background = h > 20 ? 'rgba(124,106,247,0.7)' : 'rgba(255,255,255,0.12)';
    }
  }, 80);
}

// ─── RECORDING ────────────────────────────────────────────────
function toggleRecording() {
  if (isRecording) stopRecording();
  else startRecording();
}

function startRecording() {
  isRecording = true;
  document.getElementById('micBtn').classList.add('recording');
  document.getElementById('micLabel').textContent = 'Tap to Stop';
  document.getElementById('recIndicator').classList.add('visible');
  animateWaveform(true);

  recSeconds = 0;
  recInterval = setInterval(() => {
    recSeconds++;
    document.getElementById('recTimer').textContent = `Recording... ${recSeconds}s`;
  }, 1000);

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';
    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      document.getElementById('noteInput').value = finalTranscript + interim;
    };
    recognition.onerror = () => showToast('Mic error. Type your note below.', 'error');
    recognition.start();
  } else {
    showToast('Speech API unavailable — type your note below', 'error');
  }
}

function stopRecording() {
  isRecording = false;
  document.getElementById('micBtn').classList.remove('recording');
  document.getElementById('micLabel').textContent = 'Tap to Record';
  document.getElementById('recIndicator').classList.remove('visible');
  clearInterval(recInterval);
  animateWaveform(false);
  if (recognition) { recognition.stop(); recognition = null; }
  const note = document.getElementById('noteInput').value.trim();
  if (note) setTimeout(() => parseNote(), 400);
}

// ─── PARSE NOTE — calls your backend, never Anthropic directly ─
async function parseNote() {
  const note = document.getElementById('noteInput').value.trim();
  if (!note) { showToast('Please enter or record a note first', 'error'); return; }

  const btn = document.getElementById('parseBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spin" style="border-color:rgba(255,255,255,0.2);border-top-color:white;width:14px;height:14px;"></div> Parsing...';
  showProcessing('AI is parsing your note...');

  try {
    const res = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note })
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const parsed = await res.json();

    const entry = {
      id: Date.now(),
      ...parsed,
      addedAt: new Date(),
      status: parsed.followUp ? 'followup' : 'new',
      isNew: true
    };

    entries.unshift(entry);
    updateStats();
    renderView();
    document.getElementById('noteInput').value = '';
    showToast(`${entry.name} added to CRM`, 'success');
    setTimeout(() => { entry.isNew = false; renderView(); }, 2500);

  } catch (err) {
    console.error(err);
    showToast('Parse failed — check console for details', 'error');
  } finally {
    hideProcessing();
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg> Parse & Add to CRM`;
  }
}

// ─── ENTRY ACTIONS ────────────────────────────────────────────
function deleteEntry(id) { entries = entries.filter(e => e.id !== id); updateStats(); renderView(); showToast('Entry removed', 'success'); }
function markDone(id)    { entries = entries.filter(e => e.id !== id); updateStats(); renderView(); showToast('Marked as done ✓', 'success'); }

// ─── STATS ────────────────────────────────────────────────────
function updateStats() {
  const now = new Date();
  document.getElementById('statTotal').textContent  = entries.length;
  document.getElementById('statToday').textContent  = entries.filter(e => new Date(e.addedAt).toDateString() === now.toDateString()).length;
  document.getElementById('statUrgent').textContent = entries.filter(e => e.priority === 'high').length;
}

// ─── TAB SWITCHING ────────────────────────────────────────────
function switchTab(btn, tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentTab = tab;
  renderView();
}

// ─── UI HELPERS ───────────────────────────────────────────────
function showProcessing(msg) { document.getElementById('processingText').textContent = msg; document.getElementById('processingBanner').classList.add('visible'); }
function hideProcessing()    { document.getElementById('processingBanner').classList.remove('visible'); }

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function initials(name)          { return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(); }
function deadlineClass(days)     { if (days <= 1) return 'urgent'; if (days <= 5) return 'soon'; return 'normal'; }

// ─── RENDER VIEWS ─────────────────────────────────────────────
function renderView() {
  const container = document.getElementById('crmContent');
  if (entries.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎙️</div><div class="empty-title">No entries yet</div><div class="empty-sub">Record a voice note or type a field note to get started</div></div>`;
    return;
  }
  if (currentTab === 'table')   renderTable(container);
  else if (currentTab === 'kanban') renderKanban(container);
  else renderTimeline(container);
}

function renderTable(container) {
  const rows = entries.map(e => `
    <tr class="contact-row ${e.isNew ? 'row-new' : ''}">
      <td>
        <div class="contact-name">
          <div class="avatar">${initials(e.name)}</div>
          <div>
            <div class="name-text">${e.name}</div>
            ${e.company ? `<div class="company-text">${e.company}</div>` : ''}
          </div>
        </div>
      </td>
      <td class="task-cell">${e.task}${e.details ? `<br><span style="color:var(--muted);font-size:11px;font-family:var(--mono)">${e.details}</span>` : ''}</td>
      <td><span class="deadline-chip ${deadlineClass(e.deadlineDays)}"><span class="priority-dot ${e.priority}"></span>${e.deadline || 'No deadline'}</span></td>
      <td><span class="status-badge ${e.status}">${e.status === 'followup' ? 'Follow up' : 'New lead'}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn" title="Mark done" onclick="markDone(${e.id})">✓</button>
          <button class="action-btn" title="Delete" onclick="deleteEntry(${e.id})">×</button>
        </div>
      </td>
    </tr>`).join('');

  container.innerHTML = `
    <table class="crm-table">
      <thead><tr><th>Contact</th><th>Task / Details</th><th>Deadline</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderKanban(container) {
  const cols = {
    'New Leads': entries.filter(e => e.status === 'new'),
    'Follow Up': entries.filter(e => e.status === 'followup'),
    'Urgent':    entries.filter(e => e.priority === 'high')
  };
  let html = '<div class="kanban-board">';
  for (const [col, items] of Object.entries(cols)) {
    html += `<div class="kanban-col"><div class="kanban-col-header"><span class="kanban-col-title">${col}</span><span class="kanban-count">${items.length}</span></div>`;
    if (!items.length) html += `<div style="text-align:center;padding:20px;font-size:11px;color:var(--muted);font-family:var(--mono)">empty</div>`;
    items.forEach(e => {
      html += `<div class="kanban-card"><div class="kanban-card-name">${e.name}</div><div class="kanban-card-task">${e.task}</div><div class="kanban-card-footer"><span class="deadline-chip ${deadlineClass(e.deadlineDays)}" style="font-size:10px;padding:2px 8px">${e.deadline || 'No date'}</span><span class="priority-dot ${e.priority}"></span></div></div>`;
    });
    html += '</div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function renderTimeline(container) {
  let html = '<div class="timeline">';
  entries.forEach(e => {
    const time = new Date(e.addedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    html += `<div class="timeline-item">
      <div class="timeline-dot">${initials(e.name)}</div>
      <div class="timeline-content">
        <div class="timeline-header"><span class="timeline-name">${e.name}</span><span class="timeline-time">${time}</span></div>
        <div class="timeline-task">${e.task}${e.details ? ' — ' + e.details : ''}</div>
        <div class="timeline-tags">
          <span class="deadline-chip ${deadlineClass(e.deadlineDays)}" style="font-size:10px;padding:2px 8px">${e.deadline || 'No deadline'}</span>
          <span class="status-badge ${e.status}" style="font-size:9px">${e.status === 'followup' ? 'Follow up' : 'New'}</span>
        </div>
      </div>
    </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ─── DEMO SEED ────────────────────────────────────────────────
entries = [
  { id: 1, name: 'Dhruv Mehta', company: 'BuildRight Co.', task: 'Send quote for 500 units', details: '500 units — Grade A cement blocks', deadline: 'Tuesday', deadlineDays: 1, followUp: true,  priority: 'high', status: 'followup', addedAt: new Date(),                   isNew: false },
  { id: 2, name: 'Priya Nair',  company: 'Nair Interiors',  task: 'Share portfolio & pricing deck', details: 'Full office renovation quote', deadline: 'This Friday', deadlineDays: 4, followUp: false, priority: 'med',  status: 'new',      addedAt: new Date(Date.now() - 3600000), isNew: false }
];

// ─── INIT ─────────────────────────────────────────────────────
initWaveform();
updateStats();
renderView();
