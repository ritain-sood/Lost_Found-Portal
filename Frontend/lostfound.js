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
  
  // Set default date to today on page load
  updateDate(0, document.getElementById("todayBtn"));
  
  // Category selection functionality
  document.querySelectorAll(".category").forEach((category) => {
    category.addEventListener("click", function () {
      let selectedCategoryText = this.dataset.category;
  
      // Update the hidden input field with the selected category
      document.getElementById("selectedCategoryInput").value =
        selectedCategoryText;
  
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
  
  // Form validation and submission (ENSURED STATUS UPDATES BEFORE SUBMISSION)
  document.querySelector(".btn").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default form submission
  
    let terms = document.getElementById("terms");
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let contact = document.getElementById("contactInfo").value.trim();
    let status = document.getElementById("status").value.trim();
  
    if (!name || !email || !contact) {
      alert("Please fill in all required fields: Name, Email, and Contact.");
      return;
    }
  
    if (!status) {
      alert("Please select the status (Lost or Found).");
      return;
    }
  
    if (!terms.checked) {
      alert("Please accept the terms and conditions before submitting.");
      return;
    }
  
    // Submit the form
    document.getElementById("reportForm").submit();
  });
  
  /// Function to update status selection
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
  