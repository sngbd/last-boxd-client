<script>
  import { onMount } from "svelte";

  let title, director, rating, square, chart, dlchart, loading, note;
  let username = "";
  let isButtonDisabled = true;
  let isTimeDisabled = true;
  let isLoading = false;
  let hasLoaded = false;
  let colValue = 3;
  let rowValue = 3;

  $: isButtonDisabled = username.trim() === "";

  onMount(() => {
    const slider_input = document.getElementById("slider_input");
    const slider_input_row = document.getElementById("slider_input_row");
    const time_range_check = document.getElementById("time_range_check");
    const col_row = document.getElementById("col_row");

    showSliderValueCol();
    window.addEventListener("resize", showSliderValueCol);
    slider_input.addEventListener("input", showSliderValueCol, false);

    showSliderValueRow();
    window.addEventListener("resize", showSliderValueRow);
    slider_input_row.addEventListener("input", showSliderValueRow, false);

    time_range_check.addEventListener(
      "change",
      () => {
        if (time_range_check.checked) {
          isTimeDisabled = false;
          col_row.hidden = true;
        } else {
          isTimeDisabled = true;
          col_row.hidden = false;
        }
      },
      false,
    );

    squareOperation();
  });

  const innerElement = () => {
    let parts = [];
    if (title.checked) {
      parts.push("Title");
    }
    if (director.checked) {
      parts.push("Director");
    }
    if (rating.checked) {
      parts.push("Rating");
    }
    return parts
      .map(
        (p) =>
          `<small style="display:block;line-height:1.2;color:#6a6a7a;font-size:0.9rem">${p}</small>`,
      )
      .join("");
  };

  const squareOperation = () => {
    let innerElem = "";
    let cv = parseInt(slider_input.value);
    let rv = parseInt(slider_input_row.value);
    colValue = cv;
    rowValue = rv;

    if (rv * cv > 49) {
      if (isTimeDisabled) {
        note.hidden = false;
      } else {
        note.hidden = true;
      }
    } else {
      note.hidden = true;
    }

    for (let i = 0; i < cv * rv; i++) {
      square.style["grid-template-columns"] = `repeat(${cv}, 1fr)`;
      square.style["grid-template-rows"] = `repeat(${rv}, 1fr)`;
      if (cv > 7 || rv > 7) {
        innerElem += `<div class="border border-[0.5px] border-[#2a2e36]"></div> `;
      } else {
        innerElem +=
          `<div
        style="display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;text-align:left;padding:3px 4px;border:0.5px solid #2a2e36"
        >` +
          innerElement() +
          `</div> `;
      }
    }
    square.innerHTML = innerElem;
  };

  const getChart = () => {
    let titleStatus = "on";
    let directorStatus = "on";
    let ratingStatus = "on";

    if (!title.checked) {
      titleStatus = "off";
    }
    if (!director.checked) {
      directorStatus = "off";
    }
    if (!rating.checked) {
      ratingStatus = "off";
    }

    chart.hidden = true;
    loading.innerHTML = `
    <svg
      aria-hidden='true'
      class='
        w-24 h-24 inline animate-spin fill-emerald-400 text-neutral-700
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
    `;

    if (!hasLoaded) {
      hasLoaded = true;
    }
    isLoading = true;

    let apiLink;
    if (!time_range_check.checked) {
      apiLink = `${import.meta.env.VITE_LAST_BOXD_API}/${username}?col=${slider_input.value}&row=${slider_input_row.value}&title=${titleStatus}&director=${directorStatus}&rating=${ratingStatus}`;
    } else {
      apiLink = `${import.meta.env.VITE_LAST_BOXD_API}/${username}?time=${time_range.value}&title=${titleStatus}&director=${directorStatus}&rating=${ratingStatus}`;
    }

    fetch(apiLink, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      mode: "cors",
    })
      .then((response) => response.json())
      .then((response) => {
        isLoading = false;
        chart.hidden = false;
        chart.src = `data:image/jpeg;base64,${response.image}`;
        dlchart.setAttribute(
          "href",
          `data:image/jpeg;base64,${response.image}`,
        );
      })
      .catch(() => {
        loading.className += " text-red-400";
        loading.innerHTML = "Failed to fetch data";
      });
  };

  function showSliderValueCol() {
    colValue = parseInt(slider_input.value);
    slider_thumb.innerHTML = "<b>Column: " + slider_input.value + "</b>";

    squareOperation();
  }

  function showSliderValueRow() {
    rowValue = parseInt(slider_input_row.value);
    slider_thumb_row.innerHTML = "<b>Row: " + slider_input_row.value + "</b>";

    squareOperation();
  }
</script>

<svelte:window
  on:change={(squareOperation, showSliderValueCol, showSliderValueRow)}
/>

<div
  class="flex flex-col items-center justify-center min-h-screen gap-6 px-4 py-8"
>
  <div
    class="flex flex-wrap items-center justify-center w-full lg:gap-20 md:gap-12 gap-8"
  >
    <!-- Left Panel: Controls -->
    <div class="flex-1 max-w-md p-6">
      <!-- Header with Logo -->
      <div class="flex items-center gap-3 mb-8">
        <img src="/lb.svg" alt="Last Boxd logo" class="w-10 h-10" />
        <h1
          class="text-5xl font-['Archivo_Black'] bg-gradient-to-r from-[#FF8000] via-[#00E054] to-[#40BCF4] inline-block text-transparent bg-clip-text"
        >
          Last Boxd
        </h1>
      </div>

      <form on:submit={getChart}>
        <!-- Username Input -->
        <div class="relative mb-5">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
          >
            <svg
              class="w-5 h-5 text-[#555]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            class="
              w-full pl-10 pr-4 py-3 rounded-xl
              bg-[#1e2228] text-white placeholder-[#555]
              border border-[#2a2e36]
              outline-none transition-all duration-300
              focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_20px_rgba(0,224,84,0.08)]
            "
            bind:value={username}
            type="text"
            placeholder="Letterboxd username"
            required
          />
        </div>

        <!-- Grid Size Controls -->
        <div class="mb-5">
          <div id="col_row" class="space-y-4">
            <!-- Column Slider -->
            <div class="bg-[#1a1d22] rounded-xl p-4 border border-[#2a2e36]/50">
              <div class="flex items-center justify-between mb-2">
                <span
                  id="slider_thumb"
                  class="text-sm font-medium text-[#90929a]"
                ></span>
                <span
                  class="text-xs font-mono text-emerald-400/60 bg-emerald-500/10 px-2 py-0.5 rounded-full"
                  >{colValue}</span
                >
              </div>
              <input
                id="slider_input"
                class="w-full"
                type="range"
                value="3"
                min="1"
                max="10"
              />
            </div>

            <!-- Row Slider -->
            <div class="bg-[#1a1d22] rounded-xl p-4 border border-[#2a2e36]/50">
              <div class="flex items-center justify-between mb-2">
                <span
                  id="slider_thumb_row"
                  class="text-sm font-medium text-[#90929a]"
                ></span>
                <span
                  class="text-xs font-mono text-emerald-400/60 bg-emerald-500/10 px-2 py-0.5 rounded-full"
                  >{rowValue}</span
                >
              </div>
              <input
                id="slider_input_row"
                class="w-full"
                type="range"
                value="3"
                min="1"
                max="10"
              />
            </div>
          </div>

          <!-- Time Range -->
          <div
            class="mt-4 flex items-center gap-3 bg-[#1a1d22] rounded-xl p-4 border border-[#2a2e36]/50"
          >
            <label class="toggle-switch">
              <input type="checkbox" id="time_range_check" />
              <span class="toggle-slider"></span>
            </label>
            <span class="text-sm text-[#90929a] mr-2">Time range</span>
            <select
              id="time_range"
              class="flex-1 text-sm"
              class:opacity-100={!isTimeDisabled}
              disabled={isTimeDisabled}
            >
              <option value="1">1 Week</option>
              <option value="2">1 Month</option>
              <option value="3">3 Months</option>
              <option value="4">1 Year</option>
            </select>
          </div>

          <!-- Note -->
          <div bind:this={note} hidden class="mt-3">
            <div
              class="flex items-center gap-2 text-amber-400/80 text-sm bg-amber-500/10 rounded-lg px-3 py-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <i>This may take longer to load...</i>
            </div>
          </div>
        </div>

        <!-- Generate Button -->
        {#if isButtonDisabled}
          <button
            class="
              w-full py-3 rounded-xl font-semibold text-base tracking-wide
              transition-all duration-300 ease-out
              bg-[#2a2e36] text-[#555] cursor-not-allowed
            "
            disabled
            type="submit"
          >
            Generate Collage
          </button>
        {:else}
          <button
            class="
              w-full py-3 rounded-xl font-semibold text-base tracking-wide
              transition-all duration-300 ease-out
              bg-gradient-to-r from-emerald-500 to-emerald-400
              hover:from-emerald-400 hover:to-emerald-300
              active:from-emerald-600 active:to-emerald-500
              text-[#14171c] font-bold cursor-pointer
              shadow-lg shadow-emerald-500/20
              hover:shadow-emerald-500/30 hover:scale-[1.02]
              active:scale-[0.98]
            "
            type="submit"
          >
            Generate Collage
          </button>
        {/if}

        <!-- Display Options -->
        <div
          class="mt-5 bg-[#1a1d22] rounded-xl p-4 border border-[#2a2e36]/50"
        >
          <p
            class="text-xs uppercase tracking-wider text-[#555] mb-3 font-semibold"
          >
            Display Options
          </p>
          <div class="space-y-3">
            <label
              class="flex items-center justify-between cursor-pointer group"
            >
              <span
                class="text-sm text-[#90929a] group-hover:text-[#c8c8d0] transition-colors"
                >Title</span
              >
              <input
                class="w-4 h-4"
                bind:this={title}
                type="checkbox"
                checked
              />
            </label>
            <label
              class="flex items-center justify-between cursor-pointer group"
            >
              <span
                class="text-sm text-[#90929a] group-hover:text-[#c8c8d0] transition-colors"
                >Director</span
              >
              <input
                class="w-4 h-4"
                bind:this={director}
                type="checkbox"
                checked
              />
            </label>
            <label
              class="flex items-center justify-between cursor-pointer group"
            >
              <span
                class="text-sm text-[#90929a] group-hover:text-[#c8c8d0] transition-colors"
                >Rating</span
              >
              <input
                class="w-4 h-4"
                bind:this={rating}
                type="checkbox"
                checked
              />
            </label>
          </div>
        </div>
      </form>
    </div>

    <!-- Right Panel: Preview -->
    <div
      class="
        flex-1 flex items-center justify-center max-w-[500px] max-h-[750px]
        max-[800px]:max-w-[400px] max-[800px]:max-h-[600px]
        max-[450px]:max-w-[300px] max-[450px]:max-h-[450px]
        max-[300px]:max-w-[225px] max-[300px]:max-h-[337.5px]
      "
    >
      <div class="relative">
        <!-- Generated Chart (download link) -->
        <a bind:this={dlchart} href download>
          <img
            class="
              rounded-xl shadow-2xl shadow-black/30
              max-w-[500px] max-h-[750px]
              max-[800px]:max-w-[400px] max-[800px]:max-h-[600px]
              max-[450px]:max-w-[300px] max-[450px]:max-h-[450px]
              max-[300px]:max-w-[225px] max-[300px]:max-h-[337.5px]
            "
            bind:this={chart}
            hidden
            src=""
            alt="Generated film collage"
          />
        </a>

        <!-- Loading Spinner -->
        <div
          class="
            w-[500px] h-[750px] flex items-center justify-center
            max-[800px]:w-[400px] max-[800px]:h-[600px]
            max-[450px]:w-[300px] max-[450px]:h-[450px]
            max-[300px]:w-[225px] max-[300px]:h-[337.5px]
          "
          class:hidden={!isLoading}
          bind:this={loading}
        ></div>

        <!-- Preview Grid Placeholder -->
        <div
          class="
            w-[500px] h-[750px] border border-[#2a2e36] rounded-xl overflow-hidden
            grid grid-cols-3 grid-rows-3
            bg-[#1a1d22]
            max-[800px]:w-[400px] max-[800px]:h-[600px]
            max-[450px]:w-[300px] max-[450px]:h-[450px]
            max-[300px]:w-[225px] max-[300px]:h-[337.5px]
          "
          bind:this={square}
          class:hidden={hasLoaded}
        ></div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer
    class="mt-8 pt-6 border-t border-[#2a2e36]/50 text-sm text-center text-[#555] max-w-lg w-full"
  >
    <p>© Last Boxd 2026 · <a href="mailto:lastboxd@gmail.com">Contact</a></p>
  </footer>
</div>
