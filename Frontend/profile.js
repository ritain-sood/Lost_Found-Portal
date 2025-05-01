document.addEventListener("DOMContentLoaded", () => {
  const navButtons = document.querySelectorAll(".nav-btn");
  const mainContent = document.getElementById("main-content");
  const logoutBtn = document.querySelector(".logout-btn");
  let currentUserEmail = ""; // Variable to hold the user's email
  let initialValues = {};

  // Check URL parameters for tab
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');

  // Function to switch to a specific tab
  const switchToTab = (tabName) => {
    const targetButton = Array.from(navButtons).find(btn => btn.getAttribute('data-tab') === tabName);
    if (targetButton) {
      navButtons.forEach(b => b.classList.remove("active"));
      targetButton.classList.add("active");
      
      if (tabName === "items") {
        // Trigger items tab content
        handleItemsTab();
      } else if (tabName === "profile") {
        setupProfileContent();
      } else if (tabName === "dashboard") {
        window.location.href = "/";
      }
    }
  };

  // Function to handle items tab content
  const handleItemsTab = async () => {
    try {
      const response = await fetch("/user/items", {
        credentials: "include",
      });
      const data = await response.json();
      currentUserEmail = data.userEmail;

      if (data.message === "No Items Listed") {
        mainContent.innerHTML = `<p>No Items Listed</p>`;
      } else {
        let itemsHTML = "";
        data.items.forEach((item) => {
          const isResolved = item.status === "Resolved";
          itemsHTML += `
          <div class="item-card">
            <img src="${item.image}" class="item-image" alt="Item">
            <div class="item-info">
              <h3 class="font-bold">${item.item_name}</h3>
              <p>${item.item_description}</p>
            </div>
            <span class="status-tag ${item.status.toLowerCase()}">● ${item.status}</span>
            <button class="resolved-btn ml-2 ${isResolved ? 'disabled' : ''}" 
                    data-id="${item._id}"
                    ${isResolved ? 'hidden' : ''}>
              Resolved
            </button>
            <div class="card-actions">
              <button class="edit-btn ${isResolved ? 'disabled' : ''}" 
                    data-id="${item._id}"
                    ${isResolved ? 'hidden' : ''}>
                Edit
              </button>
              <button class="delete-btn ${isResolved ? 'disabled' : ''}" 
                    data-id="${item._id}"
                    ${isResolved ? 'hidden' : ''}>
                Delete
              </button>
            </div>
          </div>
        `;
        });
        mainContent.innerHTML = itemsHTML;
        
        // Re-attach event listeners for the buttons
        attachItemButtonListeners();
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      mainContent.innerHTML = `<p>Error loading items. Please try again later.</p>`;
    }
  };

  // Function to attach event listeners to item buttons
  const attachItemButtonListeners = () => {
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this item?")) {
          try {
            const response = await fetch(`/user/items/${id}`, {
              method: "DELETE",
              credentials: "include",
            });
            const result = await response.json();
            alert(result.message || "Item deleted");
            button.closest(".item-card").remove();
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete item.");
          }
        }
      });
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const itemId = button.getAttribute("data-id");
        openEditForm(itemId);
      });
    });

    document.querySelectorAll(".resolved-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        if (confirm('Are you sure you want to update the status to "Resolved"?')) {
          try {
            const response = await fetch(`/user/resolved/${id}`, {
              method: "PUT",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "Resolved"
              })
            });
            const result = await response.json();
            if (result.success) {
              alert(result.message || "Item Status Updated");
              const itemCard = button.closest(".item-card");
              if (itemCard) {
                const statusTag = itemCard.querySelector(".status-tag");
                const editBtn = itemCard.querySelector(".edit-btn");
                const deleteBtn = itemCard.querySelector(".delete-btn");
                
                if (statusTag) {
                  statusTag.textContent = "● Resolved";
                  statusTag.className = "status-tag resolved";
                }
                // Hide all the buttons
                button.style.display = "none";
                if (editBtn) editBtn.style.display = "none";
                if (deleteBtn) deleteBtn.style.display = "none";
              }
            } else {
              alert(result.message || "Failed to update status");
            }
          } catch (err) {
            console.error("Status Update failed:", err);
            alert("Status Update failed. Please try again.");
          }
        }
      });
    });
  };

  // Select the form and elements
  const editItemForm = document.getElementById("edit-item-form-content");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  let currentItemId = ""; 

  // Function to open and the edit form with item details
  function openEditForm(itemId) {
    currentItemId = itemId;

    console.log("Opening edit form for item ID:", itemId);

    fetch(`user/items/${itemId}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.item) {
          // The form fields with the fetched item details
          document.getElementById("item-name").value = data.item.item_name;
          document.getElementById("item-description").value =
            data.item.item_description;
          document.getElementById("item-status").value = data.item.status;

          // Show the edit form
          document.getElementById("edit-item-form").classList.remove("hidden");
        } else {
          alert("Item not found!");
        }
      })
      .catch((error) => {
        console.error("Error fetching item details:", error);
        alert("Error loading item details.");
      });
  }

  // Handle the form submission
  editItemForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const updatedItem = {
      item_name: document.getElementById("item-name").value,
      item_description: document.getElementById("item-description").value,
      status: document.getElementById("item-status").value,
    };

    console.log("Updated item data:", updatedItem);

    fetch(`/user/items/${currentItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Item updated successfully!");

          // Update the UI for the edited item
          const itemCard = document
            .querySelector(`[data-id="${currentItemId}"]`)
            .closest(".item-card");
          if (itemCard) {
            const itemInfo = itemCard.querySelector(".item-info");
            itemInfo.innerHTML = `
              <h3 class="font-bold">${updatedItem.item_name}</h3>
              <p>${updatedItem.item_description}</p>
            `;
          }

          closeEditForm();
        } else {
          alert(data.message || "Failed to update item. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error updating item:", error);
        alert("An error occurred while updating the item.");
      });
  });

  // Add CSS for disabled button
  const style = document.createElement('style');
  style.textContent = `
    .resolved-btn.disabled,.edit-btn.disabled,.delete-btn.disabled {
      background-color: #cccccc;
      cursor: not-allowed;
      opacity: 0.6;
    }
    .status-tag.resolved {
      background-color: #2196F3;
    }
  `;
  document.head.appendChild(style);

  // Handle navigation button clicks
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      switchToTab(tab);
    });
  });

  // Initial tab handling based on URL parameter
  if (tabParam) {
    switchToTab(tabParam);
  } else {
    setupProfileContent();   
  }

  // Function to set up the profile content HTML
  function setupProfileContent() {
    mainContent.innerHTML = `
      <div class="bg-gray-100 p-6 rounded-lg shadow-sm">
        <h2 class="text-2xl font-bold mb-6">User Settings</h2>
      
        <!-- Tabs and Edit Button Container -->
        <div class="flex justify-between mb-6">
          <div class="flex space-x-2">
            <button id="personalInfoBtn" class="bg-red-600 text-white px-4 py-2 rounded font-semibold">Personal Information</button>
            <button id="passwordBtn" class="bg-gray-800 text-white px-4 py-2 rounded font-semibold">Password</button>
          </div>
          <button id="edit-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Edit</button>
        </div>
      
        <!-- Personal Info Form -->
        <div id="personalInfo" class="tab-content">
          <form id="profile-form" class="space-y-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" id="firstName" placeholder="First Name" disabled
                class="w-full border border-gray-300 rounded px-4 py-2 bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
        
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" id="lastName" placeholder="Last Name" disabled
                class="w-full border border-gray-300 rounded px-4 py-2 bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
        
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" placeholder="Email" disabled
                class="w-full border border-gray-300 rounded px-4 py-2 bg-gray-100 focus:outline-none cursor-not-allowed" />
            </div>
        
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" id="phone" placeholder="Enter Phone Number" disabled
                class="w-full border border-gray-300 rounded px-4 py-2 bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
        
            <button type="submit" id="update-btn"
              class="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded shadow-sm hidden">
              Update My Details
            </button>
          </form>
        </div>

        <!-- Password Form -->
        <div id="password" class="tab-content hidden">
          <form id="password-form" class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" id="currentPassword" placeholder="Enter current password" required
                class="w-full border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" id="newPassword" placeholder="Enter new password" required
                class="w-full border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" id="confirmPassword" placeholder="Confirm new password" required
                class="w-full border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button type="submit" id="change-password-btn"
              class="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded shadow-sm">
              Change Password
            </button>
          </form>
        </div>
      </div>`;

    // Initialize the page after setting up content
    initializeProfilePage();
    loadProfile();
  }

  // Function to load profile data
  async function loadProfile() {
    try {
      console.log("Starting profile fetch...");
      const res = await fetch("/user/profile", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Response not OK:", {
          status: res.status,
          statusText: res.statusText,
        });
        const text = await res.text();
        console.error("Error response body:", text);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Profile data:", data);

      // Set form values
      document.getElementById("firstName").value = data.firstName || "";
      document.getElementById("lastName").value = data.lastName || "";
      document.getElementById("email").value = data.email || "";
      document.getElementById("phone").value = data.phone || "";

      // Ensure all fields are disabled initially
      ["firstName", "lastName", "phone"].forEach((id) => {
        document.getElementById(id).disabled = true;
      });
      // Email should always be disabled
      document.getElementById("email").disabled = true;
    } catch (err) {
      console.error("Failed to load profile:", err);
      alert("Failed to load profile data. Please try refreshing the page.");
    }
  }

  // Function to initialize all profile page event listeners
  function initializeProfilePage() {
    const editBtn = document.getElementById("edit-btn");
    const updateBtn = document.getElementById("update-btn");
    const profileForm = document.getElementById("profile-form");
    const personalInfoBtn = document.getElementById("personalInfoBtn");
    const passwordBtn = document.getElementById("passwordBtn");
    const personalInfoSection = document.getElementById("personalInfo");
    const passwordSection = document.getElementById("password");
    const passwordForm = document.getElementById("password-form");

    // Initialize edit button functionality
    editBtn.addEventListener("click", () => {
      // Store current values
      initialValues = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        phone: document.getElementById("phone").value,
      };

      // Enable editable fields
      ["firstName", "lastName", "phone"].forEach((id) => {
        const input = document.getElementById(id);
        input.disabled = false;
        input.classList.remove("bg-gray-100");
        input.classList.add("bg-white");
      });

      // Show update button and hide edit button
      updateBtn.classList.remove("hidden");
      editBtn.classList.add("hidden");
    });

    // Initialize form submission
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedValues = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        phone: document.getElementById("phone").value,
      };

      // Check if any values have changed
      const hasChanges = Object.keys(updatedValues).some(
        (key) => updatedValues[key] !== initialValues[key]
      );

      if (!hasChanges) {
        alert("No changes detected");
        return;
      }

      try {
        const response = await fetch("/user/update-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedValues),
        });

        const result = await response.json();

        if (result.success) {
          alert("Profile updated successfully!");

          // Disable fields and restore styling
          ["firstName", "lastName", "phone"].forEach((id) => {
            const input = document.getElementById(id);
            input.disabled = true;
            input.classList.remove("bg-white");
            input.classList.add("bg-gray-100");
          });

          // Hide update button and show edit button
          updateBtn.classList.add("hidden");
          editBtn.classList.remove("hidden");

          // Update initial values
          initialValues = { ...updatedValues };
        } else {
          alert(result.message || "Failed to update profile");
        }
      } catch (err) {
        console.error("Error updating profile:", err);
        alert("Failed to update profile. Please try again.");
      }
    });

    // Initialize tab switching
    personalInfoBtn.addEventListener("click", () => {
      // Update button styles
      personalInfoBtn.classList.remove("bg-gray-800");
      personalInfoBtn.classList.add("bg-red-600");
      passwordBtn.classList.remove("bg-red-600");
      passwordBtn.classList.add("bg-gray-800");

      // Show/hide sections
      personalInfoSection.classList.remove("hidden");
      passwordSection.classList.add("hidden");

      // Show edit button
      editBtn.classList.remove("hidden");
    });

    passwordBtn.addEventListener("click", () => {
      // Update button styles
      passwordBtn.classList.remove("bg-gray-800");
      passwordBtn.classList.add("bg-red-600");
      personalInfoBtn.classList.remove("bg-red-600");
      personalInfoBtn.classList.add("bg-gray-800");

      // Show/hide sections
      passwordSection.classList.remove("hidden");
      personalInfoSection.classList.add("hidden");

      // Hide edit button
      editBtn.classList.add("hidden");
    });

    // Initialize password form submission
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Validate passwords
      if (newPassword !== confirmPassword) {
        alert("New password & Confirm password do not match!");
        return;
      }

      if (newPassword.length < 6) {
        alert("New password must be at least 6 characters long!");
        return;
      }

      try {
        const response = await fetch("/user/change-password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        });

        const result = await response.json();

        if (result.success) {
          alert("Password changed successfully!");
          passwordForm.reset();
          // Switch back to personal info tab
          personalInfoBtn.click();
        } else {
          alert(result.message || "Failed to change password");
        }
      } catch (err) {
        console.error("Error changing password:", err);
        alert("Failed to change password. Please try again.");
      }
    });
  }

  // Function to close edit form
  function closeEditForm() {
    const editForm = document.getElementById("edit-item-form");
    if (editForm) {
      document.getElementById("edit-item-form-content").reset();
      editForm.classList.add("hidden");
    }
  }

  // Add event listener for cancel button
  document.addEventListener("click", function (event) {
    if (
      event.target.id === "cancel-edit-btn" ||
      (event.target.onclick &&
        event.target.onclick.toString().includes("closeEditForm"))
    ) {
      closeEditForm();
    }
  });

  // Logout button functionality
  logoutBtn.addEventListener("click", () => {
    window.location.href = "/logout";
  });

  // Initial setup - Load profile content immediately
  setupProfileContent();
});
