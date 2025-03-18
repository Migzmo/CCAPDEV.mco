document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, looking for delete buttons");
    
    document.querySelector(".delete-review").forEach(button =>{
        button.addEventListener("click", async function(){ 
            const reviewID = this.getAttribute("data-id");
            const confirmation = confirm ("Are you sure you want to delete this review?");

            if(!confirmation) return;
            
            try{
                const response = await fetch('/api/deletereview/${reviewId', {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }
                });

                if (response.ok) {
                    console.log("Review deleted successfully.");
                    alert("Review deleted successfully.");
                    this.closest(".scroll-obj").remove(); 
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Server error");
                }
            } catch (error){
                console.error("Error deleting the review: ", error);
                alert("Failed to delete the review!  D:" + error.message);
            }
            
        });
    });
});