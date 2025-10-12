// Get DOM elements
const editBtn = document.getElementById("editBtn");
const editForm = document.getElementById("editForm");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const nameDisplay = document.getElementById("name");
const emailDisplay = document.getElementById("email");
const phoneDisplay = document.getElementById("phone");
const orgDisplay = document.getElementById("organization");

const editNameInput = document.getElementById("editName");
const editEmailInput = document.getElementById("editEmail");
const editPhoneInput = document.getElementById("editPhone");
const editOrgInput = document.getElementById("editOrg");

// Show edit form when Edit button is clicked
editBtn.addEventListener("click", () => {
    editForm.style.display = "flex"; // show the form
    editBtn.style.display = "none";  // hide edit button
});

// Cancel editing
cancelBtn.addEventListener("click", () => {
    editForm.style.display = "none"; // hide form
    editBtn.style.display = "inline-block"; // show edit button
    // Reset input values to current profile values
    editNameInput.value = nameDisplay.textContent;
    editEmailInput.value = emailDisplay.textContent;
    editPhoneInput.value = phoneDisplay.textContent;
    editOrgInput.value = orgDisplay.textContent;
});

// Save profile changes (frontend only)
saveBtn.addEventListener("click", () => {
    // Update profile card with new values
    nameDisplay.textContent = editNameInput.value;
    emailDisplay.textContent = editEmailInput.value;
    phoneDisplay.textContent = editPhoneInput.value;
    orgDisplay.textContent = editOrgInput.value;

    // Hide edit form and show edit button
    editForm.style.display = "none";
    editBtn.style.display = "inline-block";

    // Optionally: send updated data to backend via fetch/AJAX
    // Example (pseudo-code):
    /*
    fetch('/update_profile', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            fullname: editNameInput.value,
            email: editEmailInput.value,
            phone: editPhoneInput.value,
            organization: editOrgInput.value
        })
    })
    .then(res => res.json())
    .then(data => console.log('Profile updated:', data));
    */
});
