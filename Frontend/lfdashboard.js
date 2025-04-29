let currentUserId = null;
let allItems = [];
const backBtn = document.querySelector(".back-button");

// Fetch the logged-in user's ID
async function fetchUserId() {
  try {
    const response = await fetch("/auth/getUserId");
    if (!response.ok) {
      throw new Error("Failed to fetch user ID");
    }
    const data = await response.json();
    currentUserId = data.userId;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    alert("Unable to fetch your user ID. Please log in again.");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await fetchUserId();

  const itemsContainer = document.getElementById("itemsContainer");
  const searchInput = document.getElementById("itemSearchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  try {
    const response = await fetch("/api/items");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    allItems = await response.json();
    renderItems(allItems);

    // Unified filter function
    function filterAndRender() {
      const query = searchInput.value.toLowerCase();
      const selectedCategory = categoryFilter.value;
      const filtered = allItems.filter((item) => {
        const matchesCategory =
          !selectedCategory || item.category === selectedCategory;
        const matchesQuery =
          item.item_name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.item_description.toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
      });
      renderItems(filtered);
    }

    searchInput.addEventListener("input", filterAndRender);
    categoryFilter.addEventListener("change", filterAndRender);
  } catch (error) {
    console.error("Error fetching items:", error);
    itemsContainer.innerHTML =
      "<p class='text-red-500'>Failed to load items. Please try again later.</p>";
  }

  backBtn.addEventListener("click", () => {
    window.location.href = "/";
  });
});

// Helper function to render items
function renderItems(items) {
  const itemsContainer = document.getElementById("itemsContainer");
  itemsContainer.innerHTML = "";

  if (items.length === 0) {
    itemsContainer.innerHTML =
      "<p class='text-gray-500'>No lost or found items reported yet.</p>";
    return;
  }

  // Sort items: Lost and Found first, then Resolved
  const sortedItems = items.sort((a, b) => {
    const aResolved = a.status === "Resolved";
    const bResolved = b.status === "Resolved";

    if (aResolved === bResolved) return 0;
    return aResolved ? 1 : -1;
  });

  sortedItems.forEach((item) => {
    const isResolved = item.status === "Resolved";
    const card = document.createElement("div");
    card.className = `lost-found-card border rounded-lg ${
      item.status === "Lost"
        ? "bg-red-50 hover:shadow-red-400"
        : item.status === "Found"
        ? "bg-green-50 hover:shadow-green-400"
        : "bg-blue-50 hover:shadow-blue-400"
    } hover:shadow-lg transition-shadow relative`;

    card.innerHTML = `
      <div class="absolute top-2 right-2 bg-${
        item.status === "Lost"
          ? "red"
          : item.status === "Found"
          ? "green"
          : "blue"
      }-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
        <span class="w-2 h-2 bg-${
          item.status === "Lost"
            ? "red"
            : item.status === "Found"
            ? "green"
            : "blue"
        }-700 rounded-full mr-1"></span> ${item.status}
      </div>
      <div class="w-full h-54">
        <img src="${
          item.image
            ? `/uploads/${item.image.split("/").pop()}`
            : "https://via.placeholder.com/150"
        }" 
        alt="Image not uploaded" 
        class="w-full h-52 object-cover rounded-lg">
      </div>
      <div class="border p-4 rounded-lg bg-white m-4">
        <p><strong>Item name:</strong> ${item.item_name}</p>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Where:</strong> ${item.location}</p>
        <p><strong>When:</strong> ${item.reportedDate.split("T")[0]}</p>
        <p><strong>Description:</strong> ${
          item.item_description.length > 50
            ? item.item_description.substring(0, 47) + "..."
            : item.item_description
        }</p>
        <p><strong>Name:</strong> ${item.reporter_name}</p>
      </div>
      <div class="m-4">
        <button class="contact-btn w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition ${
          isResolved ? "disabled" : ""
        }" 
          data-item-id="${item._id}" 
          data-owner-id="${item.reporter_email}"
          ${isResolved ? "disabled" : ""}>
          ${isResolved ? "Item Resolved" : "Contact"}
        </button>
      </div>
    `;

    itemsContainer.appendChild(card);
  });

  // Add CSS for disabled button
  const style = document.createElement("style");
  style.textContent = `
    .contact-btn.disabled {
      background-color: #cccccc !important;
      cursor: not-allowed;
      opacity: 0.6;
    }
  `;
  document.head.appendChild(style);

  // Add event listeners to "Contact" buttons

  // ...existing code...
  document.querySelectorAll(".contact-btn").forEach((button) => {
    if (!button.disabled) {
      button.addEventListener("click", async function () {
        const receiverId = this.getAttribute("data-owner-id");
        const itemId = this.getAttribute("data-item-id");

        if (!currentUserId) {
          alert("Unable to fetch your user ID. Please log in again.");
          return;
        }

        try {
          // Create a new chat (if it doesn't already exist)
          const response = await fetch("/chat/createChat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ senderId: currentUserId, receiverId }),
          });

          if (!response.ok) {
            throw new Error("Failed to create chat");
          }

          // Send the email notification and wait for it to finish (but don't block UI)
          fetch("/notify/notify-owner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId, contactUserEmail: currentUserId }),
          }).finally(() => {
            // Redirect to the chat page after the request is sent (success or fail)
            window.location.href = `/chat?receiverId=${receiverId}`;
          });
        } catch (error) {
          alert("Unable to create chat or notify owner. Please try again.");
        }
      });
    }
  });
}