document.addEventListener("DOMContentLoaded", () => {
    fetch('/auth-status')
      .then(response => response.json())
      .then(data => {
          console.log('Auth status:', data);
          const authButtons = document.getElementById('auth-buttons');

          if (data.loggedIn) {
              authButtons.innerHTML = `
                  <button class="auth-button" onclick="signOut()">SignOut</button>
                  <span class="username-label"><img src="/images/person.png"/ alt="profile-icon" id="profile"><strong>${data.username}</strong></span>
              `;
          } else {
              authButtons.innerHTML = `
                  <a href="/login" class="auth-button">Login</a>
                  <a href="/signup" class="auth-button">SignUp</a>
              `;
          }
      })
      .catch(error => console.error('Error checking auth status:', error));

    // If search result is in the URL, display the "Results for: 'query'" text
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("query");
    const sT = document.getElementById("search-text");
    if (searchQuery !== null) {
        sT.style.display = "block";
        search(searchQuery);
    }
});

const recipeSearch = document.getElementById("recipe-search");
const searchText = document.getElementById("search-text");
const recipesContainer = document.querySelector(".recipes-container");

async function search(query) {
    if (searchText.style.display === "none") {
        searchText.style.display = "block";
    }

    const queryInput = query || recipeSearch.value;
    recipeSearch.value = queryInput;
    searchText.innerHTML = `Results for: <span>${queryInput}</span>`;

    // Update the URL to include the query parameter without reloading the page
    const newUrl = `${window.location.pathname}?query=${encodeURIComponent(queryInput)}`;
    window.history.replaceState(null, '', newUrl);

    // Clear any previous recipe results
    recipesContainer.innerHTML = '';

    const uniqueRecipes = new Set();
    const recipes = await fetchRecipes(queryInput);

    // Filter duplicates and display each unique recipe
    recipes.forEach(recipe => {
        if (!uniqueRecipes.has(recipe.idMeal)) {
            uniqueRecipes.add(recipe.idMeal);
            displayRecipe(recipe);
        }
    });

    if (recipes.length === 0) {
        recipesContainer.innerHTML = `<p>No recipes found for: <strong>${queryInput}</strong></p>`;
    } else {
        recipes.forEach(recipe => {
            if (!uniqueRecipes.has(recipe.idMeal)) {
                uniqueRecipes.add(recipe.idMeal);
                displayRecipe(recipe);
            }
        });
    }
}

// Fetch multiple recipes that match the search query
async function fetchRecipes(query) {
    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ search: query })
        });
        const data = await response.json();
        return data.meals || []; // Return an empty array if no meals are found
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
}

// Function to display a recipe card
function displayRecipe(recipe) {
    if (!recipe) {
        console.warn("Cannot display recipe; recipe is null or undefined.");
        return;
    }

    const recipeId = recipe.idMeal;

    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");
    recipeCard.setAttribute("data-id", recipeId);

    recipeCard.innerHTML = `
        <img src="${recipe.strMealThumb}" alt="Image of ${recipe.strMeal}">
        <h3>${recipe.strMeal}</h3>
        <p><strong>Ingredients:</strong> ${getIngredients(recipe)}</p>
        <p><strong>Prep time:</strong> ${estimatePrepTime(recipe.strInstructions)} minutes</p>
    `;

    recipeCard.addEventListener("click", () => {
        window.location.href = `/recipe?id=${recipeId}`;
    });

    recipesContainer.appendChild(recipeCard);
}

// Function to extract and format ingredients
function getIngredients(recipe) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient) ingredients.push(`${measure} ${ingredient}`);
    }
    return ingredients.join(", ");
}

// Function to estimate prep time based on instruction length
function estimatePrepTime(instructions) {
    const words = instructions.split(" ").length;
    return Math.ceil(words / 3);
}

function signOut() {
    fetch('/logout', { method: 'POST' })
      .then(response => {
        if (response.ok) {
          window.location.reload();
        }
      })
      .catch(error => console.error('Error during logout:', error));
}
