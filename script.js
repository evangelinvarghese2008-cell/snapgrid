// 1. Get DOM element references
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");

// Optional enhancement element (if you have a result count tag in HTML)
const resultCount = document.getElementById("result-count");

// 2. Catch the search form submit event
form.addEventListener("submit", async (event) => {
  // Prevent page reload
  event.preventDefault();

  // Read and clean the user's search query
  const query = input.value.trim();

  // Task 4: Ignore empty searches
  if (!query) return;

  // Task 3: Clear old results before fetching new ones
  resultsContainer.innerHTML = "";

  try {
    // Task 2: Build the request URL using encodeURIComponent
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
      "&gsrsearch=" + encodeURIComponent(query) +
      "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

    // Fetch data from Wikimedia Commons API
    const response = await fetch(url);

    // Task 2: Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    // Task 2: Parse JSON response
    const data = await response.json();
    const pages = data.query?.pages;

    // Handle case where no images are found
    if (!pages) {
      resultsContainer.innerHTML = "<p>No results found for your search.</p>";
      if (resultCount) resultCount.textContent = "";
      return;
    }

    const items = Object.values(pages);

    // Task 5 (Enhancement): Update result count display if element exists
    if (resultCount) {
      resultCount.textContent = `Showing ${items.length} results for "${query}"`;
    }

    // Task 3: Render results into the DOM
    renderResults(items);
  } catch (error) {
    console.error("Error fetching images:", error);
  }
});

// Function to render image cards into the grid
function renderResults(items) {
  items.forEach((item) => {
    // Extract image thumbnail URL
    const imageUrl = item.imageinfo?.[0]?.thumburl;
    if (!imageUrl) return;

    // Create card container
    const card = document.createElement("article");
    card.className = "card";

    // Task 5 (Enhancement): Make card a link to open full image in a new tab
    const link = document.createElement("a");
    link.href = item.imageinfo[0].descriptionurl || item.imageinfo[0].url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // Create image element
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = item.title;

    // Create caption element
    const caption = document.createElement("p");
    // Clean up title by removing "File:" prefix
    caption.textContent = item.title.replace(/^File:/i, "");

    // Build the DOM node structure
    link.appendChild(img);
    card.appendChild(link);
    card.appendChild(caption);

    // Add card to the results grid
    resultsContainer.appendChild(card);
  });
}// Part 1: Scaffold & UI Setup
// Data fetching logic will be added in Part 2.