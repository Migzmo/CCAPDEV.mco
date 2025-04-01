// document.addEventListener("DOMContentLoaded", function() {
//     document.querySelectorAll(".delete-review").forEach(button => {
//         button.addEventListener("click", async function() {
//             const reviewID = this.getAttribute("data-id");
//             const confirmation = confirm("Are you sure you want to archive this review?");

//             if (!confirmation) return;

//             try {
//                 const response = await fetch(`/api/archivereview/${reviewID}`, {
//                     method: "PUT",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ isAlive: false })
//                 });

//                 if (response.ok) {
//                     alert("Review archived successfully.");
//                     this.closest(".scroll-obj").remove(); 
//                 } else {
//                     const errorData = await response.json();
//                     throw new Error(errorData.message || "Server error");
//                 }
//             } catch (error) {
//                 console.error("Error archiving review:", error);
//                 alert("Failed to archive the review! " + error.message);
//             }
//         });
//     });
// });

document.addEventListener("DOMContentLoaded", function() {
    let currentReviewId = null;
    const deletePopup = document.getElementById("deleteReviewConfirmPopup");
    const backdrop = document.getElementById("backdrop");
    
    // Show/hide delete confirmation popup
    function toggleDeleteReviewPopup(show) {
        deletePopup.style.display = show ? "block" : "none";
        backdrop.style.display = show ? "block" : "none";
    }
    
    // Add event listeners for delete buttons in reviews
    document.querySelectorAll(".delete-review").forEach(button => {
        button.addEventListener("click", function() {
            currentReviewId = this.getAttribute("data-id");
            toggleDeleteReviewPopup(true);
        });
    });
    
    // Close popup when clicking the X button
    document.getElementById("closeDeleteReviewConfirm").addEventListener("click", function() {
        toggleDeleteReviewPopup(false);
    });
    
    // Cancel button closes popup
    document.getElementById("cancelDeleteReview").addEventListener("click", function() {
        toggleDeleteReviewPopup(false);
    });
    
    // Confirm delete button
    document.getElementById("confirmDeleteReview").addEventListener("click", async function() {
        if (!currentReviewId) return;
        
        try {
            const response = await fetch(`/api/archivereview/${currentReviewId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isAlive: false })
            });

            if (response.ok) {
                // Find and remove the review from the DOM
                const reviewElement = document.querySelector(`.delete-review[data-id="${currentReviewId}"]`).closest(".scroll-obj");
                reviewElement.remove();
                toggleDeleteReviewPopup(false);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Server error");
            }
        } catch (error) {
            console.error("Error archiving review:", error);
            alert("Failed to archive the review! " + error.message);
        } finally {
            toggleDeleteReviewPopup(false);
        }
    });
});