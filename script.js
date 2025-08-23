const englishEl = document.getElementById('english');
const langEl = document.getElementById('language');
const attemptEl = document.getElementById('attempt');
const outputEl = document.getElementById('output');
const checkBtn = document.getElementById('checkBtn');
const API_BASE = (location.origin.includes('localhost:3000') || location.origin.includes('127.0.0.1:3000'))
    ? ''
    : 'http://localhost:3000';

checkBtn.addEventListener('click', async () => {
    const english = englishEl.value.trim();
    const attempt = attemptEl.value.trim();
    const lang = langEl.value;

    if (!english || !attempt) {
        outputEl.textContent = "⚠️ Please fill both boxes.";
        return;
    }

    outputEl.textContent = "⏳ Checking with AI...";

    try {
        const res = await fetch(`${API_BASE}/api/check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ english, attempt, lang })
        });
        if (!res.ok) {
            const msg = await res.text().catch(() => '');
            outputEl.textContent = `❌ API error (${res.status}). ${msg || 'Check backend logs.'}`;
            return;
        }
        const data = await res.json();

        if (data.error) {
            outputEl.textContent = "❌ API error. Check backend logs.";
            return;
        }

        outputEl.innerHTML = `
        <strong>Reference:</strong> ${data.reference_translation}<br>
        <strong>Score:</strong> ${data.score}/100<br>
        <strong>Feedback:</strong> ${data.feedback}<br>
        <strong>Result:</strong> ${data.is_correct ? "✅ Correct!" : "❌ Try again"}
        `;
    } catch (err) {
        outputEl.textContent = "❌ Network error. Backend not running?";
    }
});