document.addEventListener("DOMContentLoaded", () => {
  const cancelButtons = document.querySelectorAll(".cancel-btn");
  const modal = document.getElementById("cancelModal");
  const closeModal = document.querySelector(".close");
  const confirmCancelBtn = document.getElementById("confirmCancelBtn");
  const cancelReasonInput = document.getElementById("cancelReason");

  let currentOrderId = null;

  // Open modal when clicking Cancel
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentOrderId = btn.dataset.orderId;
      modal.style.display = "flex";
      cancelReasonInput.value = "";
    });
  });

  // Close modal
  closeModal.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Confirm cancellation
  confirmCancelBtn.addEventListener("click", async () => {
    const reason = cancelReasonInput.value.trim();
    if (!reason) {
      alert("Please provide a reason!");
      return;
    }

    try {
      const res = await fetch(`/cancel_order/${currentOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      alert(data.message);

      if (data.success) {
        location.reload(); // Refresh to update order list
      }
    } catch (err) {
      alert("Something went wrong while cancelling. Try again later.");
    }

    modal.style.display = "none";
  });
});
