const form = document.getElementById('emailForm');
const statusEl = document.getElementById('status');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function switchTab(targetSelector) {
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  const targetBtn = document.querySelector(`.tab[data-target="${targetSelector}"]`);
  const targetPanel = document.querySelector(targetSelector);
  if (targetBtn && targetPanel) {
    targetBtn.classList.add('active');
    targetPanel.classList.add('active');
  }
}

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.target));
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setStatus('Sending...');

  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.to) {
    setStatus('Please enter a recipient (To).', true);
    return;
  }
  if (!data.text && !data.html) {
    setStatus('Provide message content in Plain text or HTML.', true);
    return;
  }

  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.details || body?.error || 'Failed');
    }
    setStatus(`Sent! Message ID: ${body.messageId || 'n/a'}`);
  } catch (err) {
    setStatus(`Error: ${err.message || err}`, true);
  }
});


