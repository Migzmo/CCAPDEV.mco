    document.getElementById('register').addEventListener('click', function() {
        const loginFrame = document.getElementById('loginframe');
        const registerFrame = document.getElementById('registerframe');
        const backdrop = document.getElementById('backdrop');

        loginFrame.style.display = 'none';
        registerFrame.style.display = 'block';
        backdrop.style.display = 'block';

        document.body.style.pointerEvents = 'none';
        registerFrame.style.pointerEvents = 'auto';
        backdrop.style.pointerEvents = 'auto';
    });

    function togglePopup() {
        const loginFrame = document.getElementById('loginframe');
        const backdrop = document.getElementById('backdrop');
        const registerFrame = document.getElementById('registerframe');
        const isHidden = (loginFrame.style.display === 'none');

        loginFrame.style.display = isHidden ? 'block' : 'none';
        backdrop.style.display = isHidden ? 'block' : 'none';
        registerFrame.style.display = 'none';

        if (isHidden) {
            document.body.style.pointerEvents = 'none';
            loginFrame.style.pointerEvents = 'auto';
            backdrop.style.pointerEvents = 'auto';
        } else {
            document.body.style.pointerEvents = 'auto';
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('closeRegister').addEventListener('click', function() {
            const registerFrame = document.getElementById('registerframe');
            const backdrop = document.getElementById('backdrop');

            registerFrame.style.display = 'none';
            backdrop.style.display = 'none';
            document.body.style.pointerEvents = 'auto';
        });

        document.getElementById('backToLogin').addEventListener('click', function() {
            const loginFrame = document.getElementById('loginframe');
            const registerFrame = document.getElementById('registerframe');

            registerFrame.style.display = 'none';
            loginFrame.style.display = 'block';

            document.body.style.pointerEvents = 'none';
            loginFrame.style.pointerEvents = 'auto';
        });
    });

document.getElementById('closeRegister').addEventListener('click', function() {
    const registerFrame = document.getElementById('registerframe');
    const backdrop = document.getElementById('backdrop');

    registerFrame.style.display = 'none';
    backdrop.style.display = 'none';
    document.body.style.pointerEvents = 'auto';
});

document.querySelector('.signin-button').addEventListener('click', function() {
    const loginFrame = document.getElementById('loginframe');
    const signinFrame = document.getElementById('signinframe');
    const backdrop = document.getElementById('backdrop');

    loginFrame.style.display = 'none';
    signinFrame.style.display = 'block';
    backdrop.style.display = 'block';

    document.body.style.pointerEvents = 'none';
    signinFrame.style.pointerEvents = 'auto';
    backdrop.style.pointerEvents = 'auto';
});

document.getElementById('backToOptions').addEventListener('click', function() {
    const signinFrame = document.getElementById('signinframe');
    const loginFrame = document.getElementById('loginframe');

    signinFrame.style.display = 'none';
    loginFrame.style.display = 'block';

    document.body.style.pointerEvents = 'none';
    loginFrame.style.pointerEvents = 'auto';
});

document.getElementById('closeSignin').addEventListener('click', function() {
    const signinFrame = document.getElementById('signinframe');
    const backdrop = document.getElementById('backdrop');

    signinFrame.style.display = 'none';
    backdrop.style.display = 'none';
    document.body.style.pointerEvents = 'auto';
});

// Implementation of Adding a new Restaurant by the admin

    let restaurants = [];

    //TO DO: FETCH RESTAURANTS FROM BACKEND
    function fetchRestaurants(){}

    function loadRestaurants() {
        fetch("http://localhost:3000/getRestaurants")
            .then(response => response.json())
            .then(restaurants => {
                const restoContainer = document.getElementById("restaurantContainer");
                restoContainer.innerHTML = ''; // Clear previous content

                // Create "Add Restaurant" button
                const addCard = document.createElement("div");
                addCard.classList.add("card", "add-card");
                addCard.id = "buttonAddResto";
                addCard.innerHTML = `<span>➕</span>`;
                addCard.addEventListener("click", addRestaurant);
                restoContainer.appendChild(addCard);

                restaurants.forEach(restaurant => {
                    const card = document.createElement("div");
                    card.classList.add("card");

                    card.innerHTML = `
                    <div class="restaurant">
                        <a href="${restaurant.link}">
                            <img class="resto-img" src="${restaurant.image}" alt="${restaurant.name}">
                            <div class="filler"></div>
                            <div class="resto-text">
                                <h2 class="resto-title">${restaurant.name} ⭐</h2>
                                <h3 class="resto-category">${restaurant.category}</h3>
                            </div>
                        </a>
                    </div>
                `;

                    // Create delete button
                    const deleteBtn = document.createElement("button");
                    deleteBtn.classList.add("delete-btn");
                    deleteBtn.innerHTML = "❌";
                    deleteBtn.onclick = function () {
                        deleteRestaurant(restaurant._id);
                    };

                    card.appendChild(deleteBtn);
                    restoContainer.appendChild(card);
                });
            })
            .catch(error => console.error("Error loading restaurants:", error));
    }

    // function validateForm() {
    //     let isValid = true;
    //
    //     let fields = [
    //         { id: "street-num", type: "number" },
    //         { id: "street-name", type: "text" },
    //         { id: "street-floor", type: "number" },
    //         { id: "subdivision", type: "text" },
    //         { id: "barangay", type: "text" },
    //         { id: "city", type: "text" },
    //         { id: "name", type: "text" },
    //         { id: "openTime", type: "text" },
    //         { id: "closeTime", type: "text" },
    //         { id: "phoneNum", type: "text" },
    //         { id: "email", type: "text" },
    //         { id: "pay", type: "text" },
    //         { id: "img", type: "text" },
    //         { id: "cuisine", type: "text" }
    //     ];
    //
    //     fields.forEach(field => {
    //         let element = document.getElementById(field.id);
    //         let value = element.value.trim();
    //
    //         if ((field.type === "number" && isNaN(parseInt(value))) || value === "") {
    //             element.style.backgroundColor = "red";
    //             isValid = false;
    //         } else {
    //             element.style.backgroundColor = "";
    //         }
    //     });
    //
    //     let perks = Array.from(document.querySelectorAll('input[name="perks"]:checked')).map(el => el.value);
    //     if (perks.length === 0) {
    //         document.getElementById("perks-container").style.backgroundColor = "red";
    //         isValid = false;
    //     } else {
    //         document.getElementById("perks-container").style.backgroundColor = "";
    //     }
    //
    //     return isValid;
    // }

    function addRestaurant() {
        // if (!validateForm()) {
        //     alert("Please fill in all required fields!");
        //     return;
        // }

        let newRestaurant = {
            streetNum: parseInt(document.getElementById("street-num").value) || 0,
            streetName: document.getElementById("street-name").value.trim(),
            streetFloor: parseInt(document.getElementById("street-floor").value) || 0,
            subdivision: document.getElementById("subdivision").value.trim(),
            barangay: document.getElementById("barangay").value.trim(),
            city: document.getElementById("city").value.trim(),
            name: document.getElementById("name").value.trim(),
            openTime: document.getElementById("openTime").value.trim(),
            closeTime: document.getElementById("closeTime").value.trim(),
            phoneNum: document.getElementById("phoneNum").value.trim(),
            email: document.getElementById("email").value.trim(),
            payMethod: document.getElementById("pay").value,
            perks: Array.from(document.querySelectorAll('input[name="perks"]:checked')).map(el => el.value),
            img: document.getElementById("img").value.trim() || "https://PLACEHOLDER-FOR-LINK",
            cuisine: Array.from(document.querySelectorAll('input[name="cuisine"]:checked')).map(el => el.value)
        };

        restaurants.push(newRestaurant);
        console.log("Restaurant added:", newRestaurant);

        document.getElementById("restaurant-form").reset();
    }

    //document.getElementById("addRestaurantBtn").addEventListener("click", addRestaurant);

    async function handleRegistration(event) {
        event.preventDefault();
        console.log('Registration form submitted');

        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            description: document.getElementById('description').value,
            profilePic: ''
        };

        console.log('Sending data:', formData);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                alert('Account created successfully!');
                document.getElementById('registerframe').style.display = 'none';
                document.getElementById('loginframe').style.display = 'block';
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            alert(`Registration failed: ${error.message}`);
            console.error('Registration error:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            registrationForm.addEventListener('submit', function(event) {
                event.preventDefault();
                handleRegistration(event);
            });
        }
    });

    function deleteRestaurant(restaurantId) {
        fetch(`http://localhost:3000/deleteRestaurant/${restaurantId}`, {
            method: "DELETE", //turn boolean value isActive to false ${isActive}.val(false)
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to delete restaurant");
                }
                return response.json();
            })
            .then(data => {
                console.log("Restaurant deleted:", data);
                loadRestaurants();
            })
            .catch(error => console.error("Error deleting restaurant:", error));
    }

    document.addEventListener("DOMContentLoaded", function () {
        const buttons = document.querySelectorAll(".category-btn");

        buttons.forEach(button => {
            button.addEventListener("click", function () {
                const selectedCategory = this.getAttribute("data-category");
                filterRestaurants(selectedCategory);
            });
        });
    });

    function filterRestaurants(selectedCategory) {
        const filtered = restaurants.filter(restaurant =>
            restaurant.category.toLowerCase().split(",").includes(selectedCategory.toLowerCase())
        );

        displayRestaurants(filtered);
    }

    function displayRestaurants(filteredRestaurants) {
        const restaurantContainer = document.getElementById("restaurant-list");
        restaurantContainer.innerHTML = ""; // Clear previous results

        if (filteredRestaurants.length === 0) {
            restaurantContainer.innerHTML = "<p>No restaurants found.</p>";
            return;
        }

        filteredRestaurants.forEach(restaurant => {
            const div = document.createElement("div");
            div.classList.add("restaurant-item");
            div.textContent = restaurant.name;
            restaurantContainer.appendChild(div);
        });
    }
