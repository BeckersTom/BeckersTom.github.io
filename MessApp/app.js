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
  navigator.serviceWorker.register('/MessApp/service-worker.js');
}