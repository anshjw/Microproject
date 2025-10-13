document.addEventListener("DOMContentLoaded", () => {
    const cancelButtons = document.querySelectorAll(".cancel-btn");

    cancelButtons.forEach(button => {
        button.addEventListener("click", async (e) => {
            e.preventDefault();

            const row = button.closest("tr");
            if (!row) return;

            const orderId = row.querySelector("td").textContent.trim();
            
            // Ask for a reason using the prompt dialog
            const reason = prompt("Please enter the reason for cancelling this order:");
            
            // Stop if the user clicks "Cancel" or leaves the reason empty
            if (reason === null || reason.trim() === "") {
                if (reason !== null) { // Only show alert if they entered empty space
                   alert("Cancellation reason is required!");
                }
                return; 
            }

            // Send cancellation request to server
            try {
                const response = await fetch(`/cancel_order/${orderId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // Send the reason in the request body
                    body: JSON.stringify({ reason: reason }) 
                });

                const data = await response.json(); // Always expect a JSON response

                if (response.ok) { // Check if the HTTP status is 2xx (e.g., 200 OK)
                    alert(data.message); // Show success message from server
                    location.reload();   // Reload the page to see the changes
                } else {
                    // Show the error message from the server (e.g., "Cannot cancel after 10 days")
                    alert(`Error: ${data.message}`);
                }

            } catch (error) {
                console.error("Error cancelling order:", error);
                alert("A server error occurred. Please try again later.");
            }
        });
    });
});