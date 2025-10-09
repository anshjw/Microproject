document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector(".orders-table tbody");
  const modal = document.getElementById("cancelModal");
  const closeModal = document.querySelector(".close");
  const confirmCancelBtn = document.getElementById("confirmCancelBtn");
  const cancelReasonInput = document.getElementById("cancelReason");

  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  let currentCancelIndex = null;

  function renderOrders() {
    tbody.innerHTML = "";
    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">No orders found.</td></tr>`;
      return;
    }

    orders.forEach((order, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${order.name}</td>
        <td>${order.quantity}</td>
        <td>₹${order.price}</td>
        <td>${order.date}</td>
        <td>
          <span class="status ${order.status.toLowerCase()}">${order.status}</span>
          ${order.reason ? `<br><em style="color:#ffb74d;">Reason: ${order.reason}</em>` : ""}
        </td>
        <td>
          ${order.status === "Pending" ? `<button class="cancel-btn">Cancel</button>` : "-"}
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach cancel button events
    const cancelButtons = document.querySelectorAll(".cancel-btn");
    cancelButtons.forEach((btn, idx) => {
      btn.addEventListener("click", () => openCancelModal(idx));
    });
  }

  function openCancelModal(index) {
    currentCancelIndex = index;
    cancelReasonInput.value = "";
    modal.style.display = "flex";
  }

  confirmCancelBtn.addEventListener("click", () => {
    const reason = cancelReasonInput.value.trim();
    if (!reason) {
      alert("Please provide a reason!");
      return;
    }

    orders[currentCancelIndex].status = "Cancelled";
    orders[currentCancelIndex].reason = reason;
    localStorage.setItem("orders", JSON.stringify(orders));
    modal.style.display = "none";
    renderOrders();
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  renderOrders();
});
