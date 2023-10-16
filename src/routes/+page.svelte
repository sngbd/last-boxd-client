<svelte:window on:change={squareOperation} />

<svelte:head>
	<link rel="icon" type="image/x-icon" href={favicon}>
</svelte:head>

<script>
  import { onMount } from "svelte";

  let favicon = 'lb-dark.svg';
  let title, director, rating, square, chart, dlchart, loading, wait, col, row, user;

  onMount(() => {
    let matcher;
    const onUpdate = () => {
      if (matcher.matches) {
        favicon = 'lb-dark.svg'
      } else {
        favicon = 'lb-light.svg'
      }
    }

    matcher = window.matchMedia("(prefers-color-scheme: dark)");
    matcher.addListener(onUpdate);
    onUpdate();
    squareOperation();
  })
  
  const innerElement = () => {
    let innerEl = ""
    if (title.checked) {
      innerEl += "<small class='item'>Title <br></small>"
    } 
    if (director.checked) {
      innerEl += "<small class='item'>Director <br></small>"
    }
    if (rating.checked) {
      innerEl += "<small class='item'>Rating</small>"
    }
    return innerEl;
  }
  
  const squareOperation = () => {
    let innerElem = ""
    for (let i = 0; i < parseInt(col.value) * parseInt(row.value); i++) {
      square.style["grid-template-columns"] = `repeat(${col.value}, 1fr)`;
      square.style["grid-template-rows"] = `repeat(${row.value}, 1fr)`;
      innerElem += `<div class="grid-item">` + innerElement() + `</div> `
    }
    square.innerHTML = innerElem

    const gridItems = document.querySelectorAll('.grid-item')
    gridItems.forEach((gi) => {
      gi.innerHTML = innerElement();
    })
  }

  const getChart = () => {
    let titleStatus = 'on'
    let directorStatus = 'on'
    let ratingStatus = 'on'

    if (!title.checked) {
      titleStatus = 'off'
    }
    if (!director.checked) {
      directorStatus = 'off'
    }
    if (!rating.checked) {
      ratingStatus = 'off'
    }

    loading.className = 'text-secondary'
    loading.hidden = false
    
    const loadingOperation = window.setInterval(() => {
      if (wait.innerHTML.length > 3) 
        wait.innerHTML = '.';
      else 
        wait.innerHTML += '.';
      }, 1000);

    fetch(`${import.meta.env.VITE_LAST_BOXD_API}/${user.value}?col=${col.value}&row=${row.value}&title=${titleStatus}&director=${directorStatus}&rating=${ratingStatus}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors', 
    })
    .then((response) => response.json())
    .then((response) => {
      if (col.value < row.value) {
        chart.style.width = 'auto'
        if (screen.width <= 600) {
          chart.style.height = '450'
        } else {
          chart.style.height = '750'
        }
      } else if (col.value >= row.value) {
        if (screen.width <= 600) {
          chart.style.width = '300'
        } else {
          chart.style.width = '500'
        }
        chart.style.height = 'auto'
      }

      square.hidden = true
      loading.hidden = true
      chart.hidden = false
      chart.src = `data:image/jpeg;base64,${response.image}`
      dlchart.setAttribute('href', `data:image/jpeg;base64,${response.image}`)
      clearInterval(loadingOperation);
    })
    .catch(() => {
      loading.className = 'text-danger'
      loading.innerHTML = 'Failed to fetch data'
      clearInterval(loadingOperation);
    })
  }
</script>

<div class="container my-5 justify-content-evenly d-flex flex-wrap">
  <div class="row align-items-center d-flex">
    <div>
      <h1 class="mb-4"><span class="letterboxd">Letterboxd</span> collage generator</h1>
      <form on:submit={getChart}>
        <div class="mb-3">
          <input class="form-control mb-1" style="width: 200px; display: inline-block;" bind:this={user} type="text" placeholder="Letterboxd username" required>
          <div>
            <select class="form-control" style="width: 45px; display: inline-block;" bind:this={col}>
              <option value="2">2</option>
              <option selected value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
            ×
            <select class="form-control" style="width: 45px; display: inline-block;" bind:this={row}>
              <option value="2">2</option>
              <option selected value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </div>
        </div>
        <input class="btn btn-primary mb-2" type="submit" value="Submit">
        <div class="mt-2">
          <ul>
            <li>Display title? <input bind:this={title} type="checkbox" checked></li>
            <li>Display director? <input bind:this={director} type="checkbox" checked></li>
            <li>Display rating? <input bind:this={rating} type="checkbox" checked></li>
          </ul>
        </div>
      </form>
    </div>
  </div>
  <div class="row align-items-center d-flex">
    <div>
      <h4 bind:this={loading} hidden>Loading<span bind:this={wait}>.</span></h4>
      <a bind:this={dlchart} href download>
        <img class="img-fluid" bind:this={chart} hidden src="" alt="chart" width="500">
      </a>
      <div class="square mw-100" bind:this={square}>
      </div>
    </div>
  </div>
</div>
<footer class="justify-content-center align-items-center d-flex container w-100">
  <small class="text-center">
    <i>This product uses the <a href="https://themoviedb.org/">TMDB</a> API but is not endorsed or certified by <a href="https://themoviedb.org/">TMDB</a>.</i><br>
    <span>© Last Boxd 2023 | <a href="mailto:lastboxd@gmail.com">Contact</a></span>
  </small>
</footer>