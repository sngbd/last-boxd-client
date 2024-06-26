<svelte:window on:change={squareOperation, showSliderValueCol, showSliderValueRow} />

<svelte:head>
	<link rel="icon" type="image/x-icon" href={favicon}>
</svelte:head>

<script>
  import { onMount } from "svelte";

  let favicon = 'lb-dark.svg';
  let title, director, rating, square, chart, dlchart, loading, user, note;

  onMount(() => {
    let matcher;
    const onUpdate = () => {
      if (matcher.matches) {
        favicon = 'lb-dark.svg';
      } else {
        favicon = 'lb-light.svg';
      }
    }

    matcher = window.matchMedia("(prefers-color-scheme: dark)");
    matcher.addListener(onUpdate);

    const slider_input = document.getElementById('slider_input');
    const slider_input_row = document.getElementById('slider_input_row');
    const time_range_check = document.getElementById('time_range_check');
    const time_range = document.getElementById('time_range');
    const col_row = document.getElementById('col_row');

    showSliderValueCol();
    window.addEventListener("resize",showSliderValueCol);
    slider_input.addEventListener('input', showSliderValueCol, false);

    showSliderValueRow();
    window.addEventListener("resize",showSliderValueRow);
    slider_input_row.addEventListener('input', showSliderValueRow, false);

    time_range_check.addEventListener('change', () => {
      if (time_range_check.checked) {
        time_range.disabled = false;
        col_row.hidden = true;
      } else {
        time_range.disabled = true;
        col_row.hidden = false;
      }
    }, false)

    onUpdate();
    squareOperation();
  })
  
  const innerElement = () => {
    let innerEl = "";
    if (title.checked) {
      innerEl += "<small class='item'>Title <br></small>";
    } 
    if (director.checked) {
      innerEl += "<small class='item'>Director <br></small>";
    }
    if (rating.checked) {
      innerEl += "<small class='item'>Rating</small>";
    }
    return innerEl;
  }
  
  const squareOperation = () => {
    let innerElem = "";
    let colValue = parseInt(slider_input.value);
    let rowValue = parseInt(slider_input_row.value);

    if (rowValue * colValue > 49) {
      note.hidden = false;
    } else {
      note.hidden = true;
    }

   for (let i = 0; i < colValue * rowValue; i++) {
      square.style["grid-template-columns"] = `repeat(${colValue}, 1fr)`;
      square.style["grid-template-rows"] = `repeat(${rowValue}, 1fr)`;
      if (colValue > 7 || rowValue > 7) {
        innerElem += `<div class="grid-item">` + `</div> `;
      } else {
        innerElem += `<div class="grid-item">` + innerElement() + `</div> `;
      }
    }
    square.innerHTML = innerElem;

    const gridItems = document.querySelectorAll('.grid-item');
    if (colValue <= 7 && rowValue <= 7) {
      gridItems.forEach((gi) => {
        gi.innerHTML = innerElement();
      });
    }
  };

  const getChart = () => {
    let titleStatus = 'on';
    let directorStatus = 'on';
    let ratingStatus = 'on';

    if (!title.checked) {
      titleStatus = 'off';
    }
    if (!director.checked) {
      directorStatus = 'off';
    }
    if (!rating.checked) {
      ratingStatus = 'off';
    }

    loading.className = 'text-secondary';
    loading.hidden = false;
    loading.innerHTML = 'Loading';
    
    const loadingOperation = window.setInterval(() => {
      if (loading.innerHTML.length > 9) 
        loading.innerHTML = 'Loading';
      else 
        loading.innerHTML += '.';
      }, 1000);
    
    let apiLink;
    if (!time_range_check.checked) {
      apiLink = `${import.meta.env.VITE_LAST_BOXD_API}/${user.value}?col=${slider_input.value}&row=${slider_input_row.value}&title=${titleStatus}&director=${directorStatus}&rating=${ratingStatus}`
    } else {
      apiLink = `${import.meta.env.VITE_LAST_BOXD_API}/${user.value}?time=${time_range.value}&title=${titleStatus}&director=${directorStatus}&rating=${ratingStatus}`
    }

    fetch(apiLink, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors', 
    })
    .then((response) => response.json())
    .then((response) => {
      square.hidden = true;
      loading.hidden = true;
      chart.hidden = false;
      chart.src = `data:image/jpeg;base64,${response.image}`;
      dlchart.setAttribute('href', `data:image/jpeg;base64,${response.image}`);
      clearInterval(loadingOperation);
    })
    .catch(() => {
      loading.className = 'text-danger';
      loading.innerHTML = 'Failed to fetch data';
      clearInterval(loadingOperation);
    })
  }

  function showSliderValueCol() {
    slider_thumb.innerHTML = slider_input.value;
    let bulletPosition;
    if (slider_input.value == 1) {
      bulletPosition = 0;
    } else {
      bulletPosition = (slider_input.value / slider_input.max);
    }
    const space = slider_input.offsetWidth - slider_thumb.offsetWidth;

    slider_thumb.style.left = (bulletPosition * space) + 'px';
    slider_line.style.width = slider_input.value + '%';

    squareOperation();
  }

  function showSliderValueRow() {
    slider_thumb_row.innerHTML = slider_input_row.value;
    let bulletPosition;
    if (slider_input_row.value == 1) {
      bulletPosition = 0;
    } else {
      bulletPosition = (slider_input_row.value / slider_input_row.max);
    }
    const space = slider_input_row.offsetWidth - slider_thumb_row.offsetWidth;

    slider_thumb_row.style.left = (bulletPosition * space) + 'px';
    slider_line_row.style.width = slider_input_row.value + '%';

    squareOperation();
  }
</script>

<div class="container my-5 justify-content-evenly d-flex flex-wrap h-100">
  <div class="row align-items-center d-flex">
    <div>
      <h1 class="mb-4"><span class="letterboxd">Letterboxd</span> collage generator</h1>
      <form on:submit={getChart}>
        <div class="mb-2">
          <input class="form-control mb-1" style="width: 200px; display: inline-block;" bind:this={user} type="text" placeholder="Letterboxd username" required>
          <div class="mt-3">
            <div id="col_row">
              <b>Column:</b>
              <div class="range-slider">
                <div id="slider_thumb" class="range-slider_thumb"></div>
                <div class="range-slider_line">
                  <div id="slider_line" class="range-slider_line-fill"></div>
                </div>
                <input id="slider_input" class="range-slider_input" type="range" value="3" min="1" max="10">
              </div>
              <b>Row:</b>
              <div class="range-slider">
                <div id="slider_thumb_row" class="range-slider_thumb"></div>
                <div class="range-slider_line">
                  <div id="slider_line_row" class="range-slider_line-fill"></div>
                </div>
                <input id="slider_input_row" class="range-slider_input" type="range" value="3" min="1" max="10">
              </div>
            </div>
            <div class="mb-2">
              <input type="checkbox" id="time_range_check">
              <select class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-2 pr-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="time_range" disabled>
                <option value="1">1 Week</option>
                <option value="2">1 Month</option>
                <option value="3">3 Months</option>
                <option value="4">1 Year</option>
              </select> 
            </div>
            <div bind:this={note} hidden class="mb-2">
              <i class="text-danger">Note: This may take longer to load...</i>
            </div>
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
  <div class="row align-items-center d-flex chart mh-100">
    <div>
      <h4 bind:this={loading} hidden>Loading</h4>
      <a bind:this={dlchart} href download>
        <img class="img-fluid" bind:this={chart} hidden src="" alt="chart">
      </a>
      <div class="square" bind:this={square}>
      </div>
    </div>
  </div>
</div>
<footer class="justify-content-center align-items-center d-flex container w-100">
  <small class="text-center">
    <i>This product uses the <a href="https://themoviedb.org/">TMDB</a> API but is not endorsed or certified by <a href="https://themoviedb.org/">TMDB</a>.</i><br>
    <span>© Last Boxd 2024 | <a href="mailto:lastboxd@gmail.com">Contact</a></span>
  </small>
</footer>