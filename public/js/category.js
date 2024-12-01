const categoryButtons = document.querySelectorAll(".category-button");
        const searchBar = document.getElementById("recipe-search");

        categoryButtons.forEach(button => {
            button.addEventListener("click", function() {
                const category = button.getAttribute("data-category");
                searchBar.value = category;
            });
        });