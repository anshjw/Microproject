document.addEventListener("DOMContentLoaded", () => {
    // Select all cancel buttons
    const cancelButtons = document.querySelectorAll(".cancel-btn");

    cancelButtons.forEach(button => {
        button.addEventListener("click", async (e) => {
            e.preventDefault();

            const row = button.closest("tr");
            if (!row) return;

            const orderId = row.querySelector("td").textContent.trim();

            // Ask user for confirmation
            const confirmCancel = confirm(`Are you sure you want to cancel Order #${orderId}?`);
            if (!confirmCancel) return;

            // Ask user for reason
            const reason = prompt("Please enter the reason for cancelling this order:");
            if (!reason) return alert("Cancellation reason is required!");

            // Update status visually in table
            const statusCell = row.querySelector(".status");
            statusCell.textContent = "Cancelled";
            statusCell.classList.remove("pending", "shipped", "delivered");
            statusCell.classList.add("cancelled");

            // Disable the cancel button
            button.disabled = true;
            button.classList.add("disabled-btn");

            // Send cancellation request to server
            try {
                const response = await fetch(`/cancel_order/${orderId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: reason })
                });
                const data = await response.json();

                if (data.success) {
                    alert(`Order #${orderId} cancelled successfully!`);
                    // Redirect to cancel page if needed
                    window.location.href = `/cancel/${orderId}`;
                } else {
                    alert("Failed to cancel order. Please try again.");
                    // Revert button status if failed
                    button.disabled = false;
                    statusCell.textContent = "Pending";
                    statusCell.classList.remove("cancelled");
                }
            } catch (error) {
                console.error("Error cancelling order:", error);
                alert("Server error. Please try again later.");
                button.disabled = false;
                statusCell.textContent = "Pending";
                statusCell.classList.remove("cancelled");
            }
        });
    });
});
