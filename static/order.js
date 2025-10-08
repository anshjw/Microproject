document.addEventListener("DOMContentLoaded", () => {
  const cancelButtons = document.querySelectorAll(".cancel-btn");

  cancelButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      const row = button.closest("tr");
      if (!row) return;

      const orderId = row.querySelector("td").textContent.trim();

      const confirmCancel = confirm(`Are you sure you want to cancel Order #${orderId}?`);
      if (!confirmCancel) return;

      // Update status visually
      const statusCell = row.querySelector(".status");
      statusCell.textContent = "Cancelled";
      statusCell.classList.remove("pending");
      statusCell.classList.add("cancelled");

      // Disable the cancel button
      button.disabled = true;
      button.classList.add("disabled-btn");

      // Optional: send request to server
      /*
      fetch(`/cancel_order/${orderId}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if(data.success){
            alert(`Order #${orderId} cancelled successfully!`);
          }
        });
      */
    });
  });
});
