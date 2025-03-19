document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll(".category-btn"); // Buttons for filtering
    const restaurants = document.querySelectorAll(".restaurants"); // Restaurant elements
    const searchInput = document.querySelector(".searchbar.search"); // Search input field

    if (!searchInput) {
        console.error("Search input field not found");
        return;
    }

    const filterByCategory = (filter) => {
        console.log("Filter selected:", filter); 

        restaurants.forEach(restaurant => {
            const cuisine = restaurant.getAttribute("data-category"); 
            console.log("Restaurant cuisine:", cuisine);

            if (filter === "All" || cuisine === filter) { 
                restaurant.classList.remove("hidden");
            } else {
                restaurant.classList.add("hidden");
            }
        });
    };

    const filterBySearch = () => {
        const searchValue = searchInput.value.toLowerCase(); 
        console.log("Search value:", searchValue);

        let anyMatch = false; 

        restaurants.forEach(restaurant => {
            const restaurantTitleElement = restaurant.querySelector(".resto-title");
            if (restaurantTitleElement) {
                const restaurantName = restaurantTitleElement.textContent.toLowerCase(); 
                console.log("Restaurant name:", restaurantName);

                if (restaurantName.includes(searchValue)) {
                    restaurant.classList.remove("hidden");
                    anyMatch = true; 
                } else {
                    restaurant.classList.add("hidden");
                }
            }
        });

        if (!anyMatch) {
            console.log("No matches found");
        }
    };

    buttons.forEach(button => {
        button.addEventListener("click", function() {
            const filter = this.getAttribute("data-category");
            filterByCategory(filter);
        });
    });

    searchInput.addEventListener("input", filterBySearch);

    searchInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            filterBySearch();
        }
    });
});