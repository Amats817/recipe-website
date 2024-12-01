document.addEventListener("DOMContentLoaded", async () => {
    fetch('/auth-status')
      .then(response => response.json())
      .then(data => {
          console.log('Auth status:', data);
          const authButtons = document.getElementById('auth-buttons');
          const commentBox = document.querySelector('#comment-box');

          if (data.loggedIn) {
              authButtons.innerHTML = `
                  <button class="auth-button" onclick="signOut()">SignOut</button>
                  <span class="username-label"><img src="/images/person.png" alt="profile-icon" id="profile"><strong>${data.username}</strong></span>
              `;
              commentBox.placeholder = "Leave a comment..."; // Reset placeholder for logged-in users
              commentBox.disabled = false; // Enable the comment box
          } else {
              authButtons.innerHTML = `
                  <a href="/login" class="auth-button">Login</a>
                  <a href="/signup" class="auth-button">SignUp</a>
              `;
              commentBox.placeholder = "You must be logged in to comment."; // Set placeholder for logged-out users
              commentBox.disabled = true; // Disable the comment box
          }
      })
      .catch(error => console.error('Error checking auth status:', error));

    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get("id");

    const commentBar = document.querySelector(".comment-bar"); // Select the comment bar
    const commentSection = document.querySelector(".comment-section"); // Select the comment section

    // Hide the comment section initially
    commentSection.style.display = "none";

    if (recipeId) {
        try {
            const response = await fetch('/api/recipe-lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipeId })
            });
            const data = await response.json();

            if (data.meals && data.meals.length > 0) {
                const recipe = data.meals[0];
                const recipeHTML = `
                    <div class="recipe-detail">
                        <h2 class="recipe-title">${recipe.strMeal}</h2>
                        <div class="recipe-img-prep-ingredients">
                            <img class="recipe-img" src="${recipe.strMealThumb}" alt="Image of ${recipe.strMeal}">
                            
                            <div class="recipe-prep-ingredients">
                                <div class="recipe-prep-time">
                                    <img class="hourglass" src="/images/hourglass.png" alt="hourglass" />
                                    <p>${estimatePrepTime(recipe.strInstructions)} minutes</p>
                                </div>
                                <div class="recipe-ingredients">
                                    <h3>Ingredients</h3>
                                    <ul>${getIngredients(recipe)}</ul>
                                </div>
                            </div>
                        </div>
                        <div class="instructions-container">
                            <div class="recipe-instructions">
                                <h3>Instructions</h3>
                                ${getNumberedInstructions(recipe.strInstructions)}
                            </div>
                        </div>
                    </div>
                `;
                document.querySelector(".recipe-container").innerHTML = recipeHTML;

                // Show the comment section after the recipe is loaded
                commentSection.style.display = "block"; // Show the comment section
                fetchComments(recipeId); // Fetch comments after showing section
            } else {
                // If no recipe is found, display a message and hide the comment section
                document.querySelector(".recipe-container").innerHTML = "Recipe not found.";
                commentSection.style.display = "none"; // Hide the comment section
            }
        } catch (error) {
            console.error("Error fetching recipe details:", error);
            document.querySelector(".recipe-container").innerHTML = "Error loading recipe.";
            commentSection.style.display = "none"; // Hide the comment section if there's an error
        }
    } else {
        document.querySelector(".recipe-container").innerHTML = "Recipe not found.";
        commentSection.style.display = "none"; // Hide the comment section if no recipe ID is provided
    }

    function getIngredients(recipe) {
        const ingredientsList = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ingredient) ingredientsList.push(`<li>${measure} ${ingredient}</li>`);
        }
        return `<ul>${ingredientsList.join("")}</ul>`;
    }

    function getNumberedInstructions(instructions) {
        return instructions
            .split(". ")
            .map((step, index) => `<p><strong>Step ${index + 1}:</strong> ${step.trim()}</p>`)
            .join("");
    }

    function estimatePrepTime(instructions) {
        const words = instructions.split(" ").length;
        return Math.ceil(words / 3);
    }

    fetchComments(recipeId);

    // Event listener for comment button
    const commentButton = document.querySelector('.comment-button');
    const commentBox = document.querySelector('#comment-box');
    
    if (commentButton && commentBox) {
        commentButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent page refresh
            const comment = commentBox.value;
            submitComment(recipeId, comment);
        });
    }
    
});

function signOut() {
    fetch('/logout', { method: 'POST' })
      .then(response => {
        if (response.ok) {
          window.location.reload();
        }
      })
      .catch(error => console.error('Error during logout:', error));
}

//Below is all code for comments.

async function fetchComments(recipeId) {
    const response = await fetch(`/comments/fetch?recipeId=${recipeId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    if (Array.isArray(data) && data.length === 0) {
        console.log("No comments found for this recipe.");
    } else {
        displayComments(data);
    }
}

function displayComments(data) {
    const commentsContainer = document.querySelector(".comments-container");
    commentsContainer.innerHTML = ''; // Clear existing comments if any

    // Sort comments by date and commentId in descending order
    data.sort((a, b) => {
        // Extract month, day, and year for both dates
        const [monthA, dayA, yearA] = a.date.split('/').map(Number);
        const [monthB, dayB, yearB] = b.date.split('/').map(Number);

        // Convert to Date objects
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);

        // Compare dates first
        if (dateB - dateA !== 0) return dateB - dateA;

        // If dates are the same, sort by commentId in descending order
        return b.commentId - a.commentId;
    });

    // Display each comment
    data.forEach(comment => {
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("comment-div");

        const usernameDiv = document.createElement("div");
        usernameDiv.classList.add("username");
        usernameDiv.textContent = comment.username;

        const commentTextDiv = document.createElement("div");
        commentTextDiv.classList.add("comment-text");
        commentTextDiv.textContent = comment.comment;

        const commentDateDiv = document.createElement("div");
        commentDateDiv.classList.add("comment-date");
        commentDateDiv.textContent = comment.date;

        commentDiv.appendChild(usernameDiv);
        commentDiv.appendChild(commentTextDiv);
        commentDiv.appendChild(commentDateDiv);
        commentsContainer.appendChild(commentDiv);
    });
}


// Function to submit a new comment and update comments section
async function submitComment(recipeId, comment) {
    if (!comment.trim()) {
        return; // Do nothing if comment is empty or only whitespace
    }

    try {
        const response = await fetch('/comments/add', {  // Corrected endpoint to /comments/add
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipeId, comment })
        });

        if (response.ok) {
            // Clear the comment box after successful submission
            document.querySelector('#comment-box').value = '';

            // Re-fetch and display updated comments
            fetchComments(recipeId);
        } else {
            console.error('Failed to submit comment:', response.status);
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
}

