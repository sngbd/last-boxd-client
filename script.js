function handleResize() {
  if (window.innerWidth <= 992) {
    console.log(window.innerWidth)
    document.querySelector("#container").className = "mx-4 my-4"
  } else {
    document.querySelector("#container").className = "container h-100 justify-content-between d-flex"
  }
}

window.addEventListener("resize", handleResize);

document.addEventListener("DOMContentLoaded", () => {
  const details = document.getElementById('details')

  let inner = ""
  for (let i = 0; i < 9; i++) {
    if (details.checked) {
      inner += `
        <div class="grid-item">
        <small>Title <br></small>
        <small>Director <br></small>
        <small>Rating</small>
        </div>
      `
    } else {
      inner += `
        <div class="grid-item">
        </div>
      `
    }
  }
  document.querySelector(".square").innerHTML = inner

  details.addEventListener("change", function() {
    const gridItems = document.querySelectorAll('.grid-item')
    gridItems.forEach((gi) => {
      if (document.getElementById('details').checked) {
        gi.innerHTML = `
          <small>Title <br></small>
          <small>Director <br></small>
          <small>Rating</small>
        `
      } else {
        gi.innerHTML = ``
      }
    })
  })

  const e = document.getElementById('grid');
  e.addEventListener("change", function() {
    const element = document.querySelector(".square");
    element.style["grid-template-columns"] = `repeat(${e.value}, 1fr)`;
    element.style["grid-template-rows"] = `repeat(${e.value}, 1fr)`;
    let inner = ""
    for (let i = 0; i < parseInt(e.value) * parseInt(e.value); i++) {
      if (details.checked) {
        inner += `
          <div class="grid-item">
            <small>Title <br></small>
            <small>Director <br></small>
            <small>Rating</small>
          </div>
        `
      } else {
        inner += '<div class="grid-item"></div>'
      }
    }
    document.querySelector(".square").innerHTML = inner
  })
})

const getChart = () => {
  const username = document.getElementById('user').value
  const e = document.getElementById('grid');
  const grid = e.value;
  let details = 'on'
  if (!document.getElementById('details').checked) {
    details = 'off'
  }

  document.getElementById('loading').className = 'text-secondary'
  document.getElementById('loading').innerHTML = `Loading<span id='wait'>.</span>`
  document.getElementById('loading').hidden = false

  const loading = window.setInterval(() => {
    const wait = document.getElementById('wait');
    if (wait.innerHTML.length > 3) 
      wait.innerHTML = '.';
    else 
      wait.innerHTML += '.';
    }, 1000);

  fetch(`https://last-boxd-production.up.railway.app/${username}?grid=${grid}&details=${details}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'cors',
  })
  .then((response) => response.json())
  .then((response) => {
    document.querySelector('.square').hidden = true
    document.getElementById('loading').hidden = true
    document.getElementById('chart').hidden = false
    document.getElementById('chart').src = `data:image/jpeg;base64,${response.image}`
    clearInterval(loading);
  })
  .catch(() => {
    document.getElementById('loading').className = 'text-danger'
    document.getElementById('loading').innerHTML = 'Failed to fetch data'
    clearInterval(loading);
  })
}