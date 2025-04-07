/**
 * Main file for review deletion
 */

document.addEventListener("DOMContentLoaded", function() {
    let currentReviewId = null;
    const deletePopup = document.getElementById("deleteReviewConfirmPopup");
    const backdrop = document.getElementById("backdrop");
    
    // Show/hide delete confirmation popup
    function toggleDeleteReviewPopup(show) {
        deletePopup.style.display = show ? "block" : "none";
        backdrop.style.display = show ? "block" : "none";
    }
    
    // For adding event listeners for delete buttons in reviews
    document.querySelectorAll(".delete-review").forEach(button => {
        button.addEventListener("click", function() {
            currentReviewId = this.getAttribute("data-id");
            toggleDeleteReviewPopup(true);
        });
    });
    
    // Close popup upon clicking  X button
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
            const response = await fetch(`/api/reviews/archivereview`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    review_id: currentReviewId,
                    isAlive: false 
                })
            });

            if (response.ok) {
                // Upon deletion, find and remove the review from the DOM
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