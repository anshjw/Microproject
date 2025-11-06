document.addEventListener("DOMContentLoaded", () => {
  const cancelButtons = document.querySelectorAll(".cancel-btn");
  const modal = document.getElementById("cancel-modal");
  const modalOrderId = document.getElementById("modal-order-id");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalConfirmBtn = document.getElementById("modal-confirm-btn");
  const cancelReasonInput = document.getElementById("cancel-reason");
  const modalError = document.getElementById("modal-error");

  let currentOrderId = null;

  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentOrderId = btn.dataset.orderId;
      modalOrderId.textContent = currentOrderId;
      cancelReasonInput.value = "";
      modal.classList.remove("hidden");
    });
  });

  modalCloseBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modalConfirmBtn.addEventListener("click", () => {
    const reason = cancelReasonInput.value.trim();
    if (!reason) {
      modalError.classList.remove("hidden");
      return;
    }

    modalError.classList.add("hidden");

    fetch(`/cancel_order/${currentOrderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reason })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          location.reload(); // ✅ refresh after success
        } else {
          alert(`❌ ${data.message}`);
        }
      })
      .catch((err) => {
        console.error("Cancel order error:", err);
        alert("Error cancelling order.");
      });
  });
});
