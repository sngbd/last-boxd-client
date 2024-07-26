<svelte:window on:change={squareOperation, showSliderValueCol, showSliderValueRow} />

<script>
  import { onMount } from "svelte";

  let title, director, rating, square, chart, dlchart, loading, note;
  let username = '';
  let isButtonDisabled = true;
  let isTimeDisabled = true;
  let isLoading = false;
  let hasLoaded = false;

  $: isButtonDisabled = username.trim() === '';

  onMount(() => {
    const slider_input = document.getElementById('slider_input');
    const slider_input_row = document.getElementById('slider_input_row');
    const time_range_check = document.getElementById('time_range_check');
    const col_row = document.getElementById('col_row');

    showSliderValueCol();
    window.addEventListener("resize",showSliderValueCol);
    slider_input.addEventListener('input', showSliderValueCol, false);

    showSliderValueRow();
    window.addEventListener("resize",showSliderValueRow);
    slider_input_row.addEventListener('input', showSliderValueRow, false);

    time_range_check.addEventListener('change', () => {
      if (time_range_check.checked) {
        isTimeDisabled = false;
        col_row.hidden = true;
      } else {
        isTimeDisabled = true;
        col_row.hidden = false;
      }
    }, false)

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
     if (isTimeDisabled) {
      note.hidden = false;
     } else {
      note.hidden = true;
     }
    } else {
      note.hidden = true;
    }

   for (let i = 0; i < colValue * rowValue; i++) {
      square.style["grid-template-columns"] = `repeat(${colValue}, 1fr)`;
      square.style["grid-template-rows"] = `repeat(${rowValue}, 1fr)`;
      if (colValue > 7 || rowValue > 7) {
        innerElem += `<div class="border border-[0.5px] border-[bcbcc4]">` + `</div> `;
      } else {
        innerElem += `<div
        class="
          border border-[0.5px] border-[bcbcc4]
          max-[800px]:text-[0.8rem]
          max-[450px]:text-[0.7rem]
          max-[300px]:text-[0.525rem]
        "
        >` + innerElement() + `</div> `;
      }
    }
    square.innerHTML = innerElem;
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

    chart.hidden = true;
    loading.innerHTML = `
    <svg
      aria-hidden='true'
      class='
        w-24 h-24 inline animate-spin fill-green-500 text-neutral-700
        max-[800px]:w-20 max-[800px]:h-20
        max-[450px]:w-16 max-[450px]:h-16
        max-[300px]:w-14 max-[300px]:h-14
      '
      viewBox='0 0 100 101'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
        fill='currentColor'
      />
      <path
        d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
        fill='currentFill'
      />
    </svg>
    `

    if (!hasLoaded) {
      hasLoaded = true
    }
    isLoading = true
    
    let apiLink;
    if (!time_range_check.checked) {
      apiLink = `${import.meta.env.VITE_LAST_BOXD_API}/${username}?col=${slider_input.value}&row=${slider_input_row.value}&title=${titleStatus}&director=${directorStatus}&rating=${ratingStatus}`
    } else {
      apiLink = `${import.meta.env.VITE_LAST_BOXD_API}/${username}?time=${time_range.value}&title=${titleStatus}&director=${directorStatus}&rating=${ratingStatus}`
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
      isLoading = false;
      chart.hidden = false;
      chart.src = `data:image/jpeg;base64,${response.image}`;
      dlchart.setAttribute('href', `data:image/jpeg;base64,${response.image}`);
    })
    .catch(() => {
      loading.className += ' text-red-500';
      loading.innerHTML = 'Failed to fetch data';
    })
  }

  function showSliderValueCol() {
    slider_thumb.innerHTML = "<b>Column: " + slider_input.value + "</b>";

    squareOperation();
  }

  function showSliderValueRow() {
    slider_thumb_row.innerHTML = "<b>Row: " + slider_input_row.value + "</b>";

    squareOperation();
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen gap-4">
  <div class="flex flex-wrap items-center justify-center w-full lg:gap-20 md:gap-10">
    <div class="flex-1 p-4">
      <h1 class="mb-6 text-5xl font-['Archivo_Black'] bg-gradient-to-r from-[#ee8232] via-[#57de68] to-[#58b9ef] inline-block text-transparent bg-clip-text">Last Boxd</h1>
      <form on:submit={getChart}>
        <div>
          <input class="p-2 w-full h-fit outline-none font-normal rounded-sm text-[#0e1013]" bind:value={username} type="text" placeholder="Letterboxd username" required>
          <div class="my-4">
            <div id="col_row">
              <div class="my-2" id="slider_thumb"></div>
              <input id="slider_input" class="w-full my-2 h-2 rounded-lg appearance-none cursor-pointer bg-gray-700" type="range" value="3" min="1" max="10">
              <div class="my-2" id="slider_thumb_row"></div>
              <input id="slider_input_row" class="w-full my-2 h-2 rounded-lg appearance-none cursor-pointer bg-gray-700" type="range" value="3" min="1" max="10">
            </div>
            <div class="my-4 flex items-center">
              <input class="w-4 h-4 mr-2" type="checkbox" id="time_range_check">
              <select class="p-2 h-fit outline-none font-normal rounded-sm" class:text-[#0e1013]={!isTimeDisabled} disabled={isTimeDisabled}>
                <option value="1">1 Week</option>
                <option value="2">1 Month</option>
                <option value="3">3 Months</option>
                <option value="4">1 Year</option>
              </select> 
            </div>
            <div bind:this={note} hidden class="mb-2">
              <i class="text-red-500">Note: This may take longer to load...</i>
            </div>
          </div>
        </div>
        <input
          class="font-medium p-2 rounded w-full" 
          class:bg-green-500={!isButtonDisabled}
          class:hover:bg-green-400={!isButtonDisabled}
          class:active:bg-green-600={!isButtonDisabled}
          class:bg-neutral-500={isButtonDisabled}
          class:text-white={!isButtonDisabled}
          class:cursor-pointer={!isButtonDisabled}
          class:text-neutral-300={isButtonDisabled}
          class:cursor-default={isButtonDisabled}
          disabled={isButtonDisabled}
          type="submit"
          value="Generate Collage"
        >
        <ul class="my-4">
          <li class="flex items-center">Display title? <input class="ml-2" bind:this={title} type="checkbox" checked></li>
          <li class="flex items-center">Display director? <input class="ml-2" bind:this={director} type="checkbox" checked></li>
          <li class="flex items-center">Display rating? <input class="ml-2" bind:this={rating} type="checkbox" checked></li>
        </ul>
      </form>
    </div>
    <div 
      class="
        flex-1 items-center justify-center max-w-[500px] max-h-[750px]
        max-[800px]:max-w-[400px] max-[800px]:max-h-[600px]
        max-[450px]:max-w-[300px] max-[450px]:max-h-[450px]
        max-[300px]:max-w-[225px] max-[300px]:max-h-[337.5px]
      "
    >
      <div>
        <a bind:this={dlchart} href download>
          <img 
            class="
              max-w-[500px] max-h-[750px]
              max-[800px]:max-w-[400px] max-[800px]:max-h-[600px]
              max-[450px]:max-w-[300px] max-[450px]:max-h-[450px]
              max-[300px]:max-w-[225px] max-[300px]:max-h-[337.5px]
            "
            bind:this={chart}
            hidden
            src=""
            alt="chart"
          >
        </a>
        <div
          class="
            w-[500px] h-[750px] flex items-center justify-center
            max-[800px]:w-[400px] max-[800px]:h-[600px]
            max-[450px]:w-[300px] max-[450px]:h-[450px]
            max-[300px]:w-[225px] max-[300px]:h-[337.5px]
          "
          class:hidden={!isLoading}
          bind:this={loading}>
        </div>
        <div 
          class="
            w-[500px] h-[750px] border border-[#bcbcc4] grid grid-cols-3 grid-rows-3
            max-[800px]:w-[400px] max-[800px]:h-[600px]
            max-[450px]:w-[300px] max-[450px]:h-[450px]
            max-[300px]:w-[225px] max-[300px]:h-[337.5px]
          "
          bind:this={square}
          class:hidden={hasLoaded}
        >
        </div>
      </div>
    </div>
  </div>
  <footer class="text-sm text-center p-4 justify-content-center align-items-center">
    <i>This product uses the <a href="https://themoviedb.org/">TMDB</a> API but is not endorsed or certified by <a href="https://themoviedb.org/">TMDB</a>.</i><br>
    <span><a href="https://trakteer.id/last-boxd/tip?open=true">Donate</a> | © Last Boxd 2024 | <a href="mailto:lastboxd@gmail.com">Contact</a></span>
  </footer>
</div>