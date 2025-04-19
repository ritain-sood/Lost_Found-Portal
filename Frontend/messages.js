document.addEventListener("DOMContentLoaded", async () => {
  const chatList = document.getElementById("chatList");
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

  // Fetch chat users
  async function fetchChatUsers() {
    try {
      const response = await fetch("/chat/chatUsers");
      if (!response.ok) throw new Error("Failed to fetch chat users");

      const users = await response.json();
      renderChatList(users);
    } catch (error) {
      console.error("Error fetching chat users:", error);
      chatList.innerHTML =
        "<p class='text-red-500'>Failed to load chats.</p>";
    }
  }

  // Render the chat list
  function renderChatList(users) {
    chatList.innerHTML = users
      .map(
        (user) => `
        <li class="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
          <a href="/chat?senderId=${currentUserId}&receiverId=${user.userId}" class="flex justify-between items-center w-full">
            <div>
              <span class="font-bold text-gray-800">${user.fullName}</span>
              <p class="text-sm text-gray-500">${user.lastMessage}</p>
            </div>
            <span class="text-xs text-gray-400">${new Date(
              user.lastTimestamp
            ).toLocaleTimeString()}</span>
          </a>
        </li>
      `
      )
      .join("");
  }

  // Fetch the user ID and chat users
  await fetchUserId();
  if (currentUserId) {
    await fetchChatUsers();
  }

  // Listen for new messages
  const socket = io();
  socket.on("newMessage", ({ senderId, receiverId, message, timestamp }) => {
    // Check if the current user is involved in the conversation
    if (senderId === currentUserId || receiverId === currentUserId) {
      fetchChatUsers(); // Refresh the chat list
    }
  });
});