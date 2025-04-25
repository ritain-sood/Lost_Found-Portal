// Function to load and pre-fill user data
async function loadUserData() {
  try {
    const response = await fetch("/auth/check-login", {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Pre-fill and disable the fields
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const contactInput = document.getElementById("contactInfo");

    console.log(data.user);

    // Set values from user data
    emailInput.value = data.user.username;
    nameInput.value = data.user.firstname + " " + data.user.lastname; // Use part before @ as name
    contactInput.value = data.user.phone; // We don't get phone from check-login

    // Disable the fields
    nameInput.disabled = true;
    emailInput.disabled = true;
    contactInput.disabled = true;

    // Add visual indication that fields are disabled
    [nameInput, emailInput, contactInput].forEach(input => {
      input.classList.add('bg-gray-100');
      input.classList.add('cursor-not-allowed');
    });
  } catch (err) {
    console.error("Error loading user data:", err);
    window.location.href = '/auth/login';
  }
}

// Function to update the date selection
function updateDate(daysAgo, btn) {
    let date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    document.getElementById("dateInput").value = date.toISOString().slice(0, 16);
  
    // Remove active styles from all date buttons
    document
      .querySelectorAll("#todayBtn, #yesterdayBtn, #dayBeforeBtn")
      .forEach((button) => {
        button.classList.remove("bg-teal-500", "text-white");
        button.classList.add("bg-gray-200");
      });
  
    // Add selected styling to clicked button
    btn.classList.add("bg-teal-500", "text-white");
    btn.classList.remove("bg-gray-200");
}

// Load user data when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  updateDate(0, document.getElementById("todayBtn")); // Set default date
});

// Event listeners for date selection buttons
document.getElementById("todayBtn").addEventListener("click", function () {
  updateDate(0, this);
});

document.getElementById("yesterdayBtn").addEventListener("click", function () {
  updateDate(1, this);
});

document.getElementById("dayBeforeBtn").addEventListener("click", function () {
  updateDate(2, this);
});

// Reset button styles when a custom date is selected manually
document.getElementById("dateInput").addEventListener("input", function () {
  document
    .querySelectorAll("#todayBtn, #yesterdayBtn, #dayBeforeBtn")
    .forEach((button) => {
      button.classList.remove("bg-teal-500", "text-white");
      button.classList.add("bg-gray-200");
    });
});

// Category selection functionality
document.querySelectorAll(".category").forEach((category) => {
  category.addEventListener("click", function () {
    let selectedCategoryText = this.dataset.category;

    // Update the hidden input field with the selected category
    document.getElementById("selectedCategoryInput").value = selectedCategoryText;

    // Display selected category
    document.getElementById("selectedCategory").textContent =
      "Selected Category: " + selectedCategoryText;

    // Ensure itemDetails is always shown
    let itemDetails = document.getElementById("itemDetails");
    if (itemDetails.classList.contains("hidden")) {
      itemDetails.classList.remove("hidden");
    }

    // Highlight selected category
    document
      .querySelectorAll(".category")
      .forEach((cat) => cat.classList.remove("bg-teal-500", "text-white"));
    this.classList.add("bg-teal-500", "text-white");
  });
});

// Form validation and submission
document.querySelector(".btn").addEventListener("click", function (event) {
  event.preventDefault();

  // Get all form values
  const formData = new FormData(document.getElementById("reportForm"));
  
  // Get user data from the pre-filled fields
  const reporterName = document.getElementById("name").value;
  const reporterEmail = document.getElementById("email").value;
  const reporterContact = document.getElementById("contactInfo").value;
  const description = formData.get("item_description");

  // Validate required fields
  if (!formData.get("item_name") || !description || 
      !formData.get("category") || !formData.get("location")) {
    alert("Please fill in all required fields: Item Name, Description, Location, and Category.");
    return;
  }

  // Validate description length
  if (description.length < 25 || description.length > 50) {
    alert("Description must be between 25 - 50 characters long.");
    return;
  }

  if (!formData.get("status")) {
    alert("Please select the status (Lost or Found).");
    return;
  }

  if (!document.getElementById("terms").checked) {
    alert("Please accept the terms and conditions before submitting.");
    return;
  }

  // Ensure user data is included
  formData.set("reporter_name", reporterName);
  formData.set("reporter_email", reporterEmail);
  formData.set("reporter_contact", reporterContact);

  // Log the form data for debugging
  console.log("Submitting form with data:", {
    reporterName,
    reporterEmail,
    reporterContact,
    itemName: formData.get("item_name"),
    category: formData.get("category"),
    status: formData.get("status"),
    location: formData.get("location"),
    date: formData.get("custom_date")
  });

  // Submit the form data
  fetch("/api/reports", {
    method: "POST",
    body: formData,
    credentials: "include"
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.message || 'Network response was not ok');
      });
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // alert("Item reported successfully!");
      window.location.href = "/auth/dashboard";
    } else {
      alert(data.message || "Failed to report item. Please try again.");
    }
  })
  .catch(error => {
    console.error("Error details:", error);
    alert(`Error submitting form: ${error.message}`);
  });
});

// Function to update status selection
function updateStatus(selectedBtn, otherBtn, statusValue) {
  document.getElementById("status").value = statusValue;

  selectedBtn.classList.add("bg-teal-500", "text-white");
  selectedBtn.classList.remove("text-gray-600");
  otherBtn.classList.remove("bg-teal-500", "text-white");
  otherBtn.classList.add("text-gray-600");
}

// Get buttons and input field
const lostBtn = document.getElementById("lostBtn");
const foundBtn = document.getElementById("foundBtn");
const statusInput = document.getElementById("status");

// Set the default selection based on the current status value
if (!statusInput.value || statusInput.value === "Lost") {
  updateStatus(lostBtn, foundBtn, "Lost");
} else {
  updateStatus(foundBtn, lostBtn, "Found");
}

// Event listeners for status buttons
lostBtn.addEventListener("click", function () {
  updateStatus(lostBtn, foundBtn, "Lost");
});

foundBtn.addEventListener("click", function () {
  updateStatus(foundBtn, lostBtn, "Found");
});

window.addEventListener("load", function () {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  if (status === "lost") {
    document.getElementById("lostBtn").click();
  } else if (status === "found") {
    document.getElementById("foundBtn").click();
  }
});
  