const getChart = () => {
  const username = document.getElementById('user').value
  const e = document.getElementById('grid');
  const grid = e.value;
  let details = 'on'
  if (!document.getElementById('details').checked) {
    details = 'off'
  }

  const time = grid > 3 ? '2 mins' : '1 min'
  document.getElementById('loading').className = 'text-secondary'
  document.getElementById('loading').innerHTML = `Loading (approx. ${time} for ${grid}x${grid} grid)<span id='wait'>.</span>`
  document.getElementById('loading').hidden = false

  const loading = window.setInterval(() => {
    const wait = document.getElementById('wait');
    if (wait.innerHTML.length > 3) 
      wait.innerHTML = '.';
    else 
      wait.innerHTML += '.';
    }, 1000);

  fetch(`http://localhost:8000/${username}?grid=${grid}&details=${details}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'cors',
  })
  .then((response) => response.json())
  .then((response) => {
    document.getElementById('loading').hidden = true
    document.getElementById('chart').hidden = false
    document.getElementById('chart').src = `data:image/jpeg;base64,${response.image}`
    clearInterval(loading);
  })
  .catch((error) => {
    document.getElementById('loading').className = 'text-danger'
    document.getElementById('loading').innerHTML = 'Failed to fetch data'
    clearInterval(loading);
  })
}