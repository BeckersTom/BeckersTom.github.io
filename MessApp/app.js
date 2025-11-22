function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const formatted = now.toLocaleString('en-GB', options);
  document.getElementById('datetime').textContent = formatted;
}

setInterval(updateDateTime, 1000);
updateDateTime();

if ('serviceWorker' in navigator) {
  // Register the service worker with a path relative to this page so the
  // service worker scope is limited to the `MessApp/` folder.
  navigator.serviceWorker.register('./service-worker.js');
}