let currentUserId = null;

// Fetch the logged-in user's ID
async function fetchUserId() {
  try {
    const response = await fetch("/auth/getUserId");
    if (!response.ok) {
      throw new Error("Failed to fetch user ID");
    }
    const data = await response.json();
    console.log("Fetched user ID:", data.userId); // Debugging
    currentUserId = data.userId; // Store the user ID
  } catch (error) {
    console.error("Error fetching user ID:", error);
    alert("Unable to fetch your user ID. Please log in again.");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await fetchUserId(); // Fetch the user ID before loading items

  const itemsContainer = document.getElementById("itemsContainer");

  try {
    const response = await fetch("/api/items");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const items = await response.json();
    itemsContainer.innerHTML = ""; // Clear existing content

    if (items.length === 0) {
      itemsContainer.innerHTML =
        "<p class='text-gray-500'>No lost or found items reported yet.</p>";
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = `lost-found-card border rounded-lg ${
        item.status === "Lost"
          ? "bg-red-50 hover:shadow-red-400"
          : "bg-green-50 hover:shadow-green-400"
      } hover:shadow-lg transition-shadow relative`;

      card.innerHTML = `
        <div class="absolute top-2 right-2 bg-${
          item.status === "Lost" ? "red" : "green"
        }-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
          <span class="w-2 h-2 bg-${
            item.status === "Lost" ? "red" : "green"
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
          <p><strong>Description:</strong> ${item.item_description}</p>
          <p><strong>Name:</strong> ${item.reporter_name}</p>
          <p><strong>Email:</strong> ${item.reporter_email}</p>
          <p><strong>Contact:</strong> ${item.reporter_contact}</p>
        </div>
        <div class="m-4">
          <button class="contact-btn w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition" 
            data-item-id="${item._id}" 
            data-owner-id="${item.reporter_email}"> <!-- Use reporter_email as the unique identifier -->
            Contact
          </button>
        </div>
      `;

      itemsContainer.appendChild(card);
    });

    // Add event listeners to "Contact" buttons
    document.querySelectorAll(".contact-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const receiverId = this.getAttribute("data-owner-id"); // Owner's email or unique ID

        if (!currentUserId) {
          console.error("Current user ID is null. Please log in again.");
          alert("Unable to fetch your user ID. Please log in again.");
          return;
        }

        // Redirect to the chat page with senderId and receiverId
        window.location.href = `/chat?senderId=${currentUserId}&receiverId=${receiverId}`;
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    itemsContainer.innerHTML =
      "<p class='text-red-500'>Failed to load items.</p>";
  }
});