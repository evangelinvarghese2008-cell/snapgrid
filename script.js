const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const clearBtn = document.getElementById("clear-btn");
const statusElement = document.getElementById("status");
const resultsContainer = document.getElementById("results");
const chipsContainer = document.querySelector(".chips-container");

// Event Listener for Search Form Submit
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    fetchImages(query);
  }
});

// Event Listener for Quick Category Chips
chipsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("chip")) {
    const query = e.target.textContent;
    searchInput.value = query;
    fetchImages(query);
  }
});

// Event Listener for Clear Button
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  resultsContainer.innerHTML = "";
  statusElement.textContent = "Search for a topic above to explore images.";
});

// Core Function to Fetch Images and Handle States
async function fetchImages(query) {
  // 1. LOADING STATE
  statusElement.textContent = `Searching for "${query}"...`;
  resultsContainer.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
    </div>
  `;

  // Wikimedia Commons Search API URL
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
    query
  )}&gsrlimit=12&prop=imageinfo&iiprop=url|size&format=json&origin=*`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if query returns pages/images
    if (!data.query || !data.query.pages) {
      // 2. EMPTY STATE
      statusElement.textContent = `No results found for "${query}". Try another search term!`;
      resultsContainer.innerHTML = "";
      return;
    }

    const pages = Object.values(data.query.pages);

    // Filter pages to ensure valid image URLs exist
    const validImages = pages.filter(
      (page) => page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url
    );

    if (validImages.length === 0) {
      // EMPTY STATE fallback
      statusElement.textContent = `No viewable images found for "${query}".`;
      resultsContainer.innerHTML = "";
      return;
    }

    // 3. RESULTS & POLISH STATE
    statusElement.textContent = `Showing ${validImages.length} results for "${query}".`;
    renderImages(validImages);

  } catch (error) {
    // 4. ERROR STATE
    console.error("Fetch error:", error);
    statusElement.textContent = "Something went wrong while fetching images. Please try again.";
    resultsContainer.innerHTML = "";
  }
}

// Function to Render Image Cards
function renderImages(images) {
  resultsContainer.innerHTML = "";

  images.forEach((imgData) => {
    const info = imgData.imageinfo[0];
    const title = imgData.title.replace("File:", "");

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="card-image-wrapper">
        <img src="${info.url}" alt="${title}" loading="lazy" />
      </div>
      <div class="card-content">
        <h3 title="${title}">${title}</h3>
        <a href="${info.descriptionurl}" target="_blank" rel="noopener noreferrer">View Original</a>
      </div>
    `;

    resultsContainer.appendChild(card);
  });
}