document.addEventListener("DOMContentLoaded", () => {
    // Modal elements
    const cancelModal = document.getElementById('cancel-modal');
    const modalOrderIdSpan = document.getElementById('modal-order-id');
    const reasonTextarea = document.getElementById('cancel-reason');
    const modalError = document.getElementById('modal-error');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const closeBtn = document.getElementById('modal-close-btn');

    // Notification elements
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');

    let currentOrderId = null;

    // --- Show/Hide Functions ---

    function showModal(orderId) {
        currentOrderId = orderId;
        modalOrderIdSpan.textContent = currentOrderId;
        reasonTextarea.value = ''; // Clear previous reason
        modalError.classList.add('hidden');
        cancelModal.classList.remove('hidden');
    }

    function hideModal() {
        cancelModal.classList.add('hidden');
    }

    function showNotification(message, isSuccess) {
        notificationMessage.textContent = message;
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;

        // Make it visible
        notification.classList.remove('hidden');

        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    // --- Event Listeners ---

    // Add click listeners to all "Cancel" buttons in the table
    document.querySelectorAll(".cancel-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const row = button.closest("tr");
            if (!row) return;

            // The first `<td>` in the row contains the Order ID
            const orderId = row.querySelector("td").textContent.trim();
            showModal(orderId);
        });
    });
    
    // Close modal when "Go Back" is clicked or when clicking the overlay
    closeBtn.addEventListener('click', hideModal);
    cancelModal.addEventListener('click', (e) => {
        if (e.target === cancelModal) {
            hideModal();
        }
    });


    // Handle the final confirmation and server request
    confirmBtn.addEventListener('click', async () => {
        const reason = reasonTextarea.value.trim();

        if (reason === "") {
            modalError.classList.remove('hidden');
            return;
        }

        modalError.classList.add('hidden');

        try {
            const response = await fetch(`/cancel_order/${currentOrderId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reason })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification(data.message, true);
                setTimeout(() => location.reload(), 2000);
            } else {
                showNotification(`Error: ${data.message}`, false);
            }

        } catch (error) {
            console.error("Error cancelling order:", error);
            showNotification("A server error occurred. Please try again later.", false);
        } finally {
            hideModal();
        }
    });
});
