// Example: Ends on July 20, 2026 at 8:00 PM UTC
const end = new Date("2026-07-25T00:00:00").getTime();
function tick() {
    const diff = Math.max(0, end - Date.now());

    const h = Math.floor(diff / 3600000);
    const m = Math.floor(diff / 60000) % 60;
    const s = Math.floor(diff / 1000) % 60;

    hours.textContent = String(h).padStart(2, "0");
    minutes.textContent = String(m).padStart(2, "0");
    seconds.textContent = String(s).padStart(2, "0");

    const total = end - new Date("2026-07-20T18:00:00Z").getTime();
    fill.style.width = ((total - diff) / total) * 100 + "%";
}

tick();
setInterval(tick, 1000);