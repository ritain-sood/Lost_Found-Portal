const navButtons = document.querySelectorAll('.nav-btn');
  const mainContent = document.getElementById('main-content');
  const logoutBtn = document.querySelector('.logout-btn');
  let currentUserEmail = ''; // Variable to hold the user's email

  // Handle navigation button clicks
  navButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Remove active class from all buttons and add to the clicked one
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tab = btn.getAttribute('data-tab');

      if (tab === 'profile') {
        mainContent.innerHTML = `
        <h2>Welcome to your Profile</h2>
        <p>This is where your profile information will appear.</p>
      `;
      }

      if (tab === 'items') {
        try {
          // Fetch items from the API and get the user's email as part of the response
          const response = await fetch("http://localhost:3000/user/items", {
            credentials: "include" // Send cookies!
          });
          const data = await response.json();
          currentUserEmail = data.userEmail; // Capture the user's email from the response

          // Check if there's a message saying "No Items Listed"
          if (data.message === 'No Items Listed') {
            mainContent.innerHTML = `<p>No Items Listed</p>`;
          } else {
            let itemsHTML = '';
            data.items.forEach(item => {
              itemsHTML += `
              <div class="item-card">
                <img src="${item.image}" class="item-image" alt="Item">
                <div class="item-info">
                  <h3 class="font-bold">${item.item_name}</h3>
                  <p>${item.item_description}</p>
                </div>
                <span class="status-tag ${item.status.toLowerCase()}">● ${item.status}</span>
                <div class="card-actions">
                  <button class="edit-btn" data-id="${item._id}">Edit</button>
                  <button class="delete-btn" data-id="${item._id}">Delete</button>
                </div>
              </div>
            `;
            });
            mainContent.innerHTML = itemsHTML;

            // Attach event listeners to dynamically created buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
              button.addEventListener('click', async () => {
                const id = button.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this item?')) {
                  try {
                    const response = await fetch(`http://localhost:3000/user/items/${id}`, {
                      method: 'DELETE',
                      credentials: 'include',
                    });
                    const result = await response.json();
                    alert(result.message || 'Item deleted');
                    button.closest('.item-card').remove(); // Remove the card from DOM
                  } catch (err) {
                    console.error('Delete failed:', err);
                    alert('Failed to delete item.');
                  }
                }
              });
            });

            // Edit button functionality
            document.querySelectorAll('.edit-btn').forEach(button => {
              button.addEventListener('click', () => {
                const itemId = button.getAttribute('data-id');
                openEditForm(itemId); // Open the edit form for the selected item
              });
            });
          }
        } catch (error) {
          console.error('Error fetching items:', error);
          mainContent.innerHTML = `<p>Error loading items. Please try again later.</p>`;
        }
      }

      if (tab === 'dashboard') {
        window.location.href = '/'; // Navigate to dashboard
      }
    });
  });

  // Select the form and relevant elements
  const editItemForm = document.getElementById('edit-item-form-content');
  let currentItemId = ''; // Variable to store the current item ID being edited

  // Function to open and populate the edit form with item details
  function openEditForm(itemId) {
    currentItemId = itemId;

    console.log('Opening edit form for item ID:', itemId);
    

    fetch(`http://localhost:3000/user/items/${itemId}`, {
      method: 'GET',
      credentials: 'include', // Ensure the session is sent
    })
      .then(response => response.json())
      .then(data => {
        if (data.item) {
          // Populate the form fields with the fetched item details
          document.getElementById('item-name').value = data.item.item_name;
          document.getElementById('item-description').value = data.item.item_description;
          document.getElementById('item-status').value = data.item.status;

          // Show the edit form (make sure to remove 'hidden' class or set display to block)
          document.getElementById('edit-item-form').classList.remove('hidden'); // Show the form
        } else {
          alert('Item not found!');
        }
      })
      .catch(error => {
        console.error('Error fetching item details:', error);
        alert('Error loading item details.');
      });
  }

  // Handle the form submission
  editItemForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const updatedItem = {
      item_name: document.getElementById('item-name').value,
      item_description: document.getElementById('item-description').value,
      status: document.getElementById('item-status').value, // Status remains read-only
    };

    console.log('Updated item data:', updatedItem);

    // Send the updated data to the backend to update the item
    fetch(`http://localhost:3000/user/items/${currentItemId}`, {
      method: 'PUT', // Use PUT to update the item
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedItem),
      credentials: 'include', // Include cookies for session management
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Item updated successfully!');
          closeEditForm(); // Close the form after updating
          // Optionally, refresh the page or the list of items
        } else {
          alert('Failed to update item. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error updating item:', error);
        alert('An error occurred while updating the item.');
      });
  });

  // Cancel button to close the form
  function closeEditForm() {
  document.getElementById('edit-item-form-content').reset(); // Reset the form
  document.getElementById('edit-item-form').classList.add('hidden'); // Hide the form
}
  // Logout button functionality
  logoutBtn.addEventListener('click', () => {
    window.location.href = '/logout';
  });