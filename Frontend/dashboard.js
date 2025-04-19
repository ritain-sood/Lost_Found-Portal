// let index = 0;

// function slideTestimonials() {
//     const slider = document.getElementById('slider');
//     const testimonials = document.querySelectorAll('.testimonial').length;

//     index = (index + 1) % testimonials; // Loop back to start after last
//     slider.style.transform = translateX(-${index * 50}%);

// }

// setInterval(slideTestimonials, 3000);

document.addEventListener("DOMContentLoaded", async () => {
  async function checkLoginStatus() {
    try {
      const response = await fetch("/auth/check-login", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User logged in:", data);

        // Ensure the dropdown exists
        let accountMenu = document.getElementById("accountDropdown");
        if (!accountMenu) {
          console.error("Account dropdown not found!");
          return;
        }

        // Update dropdown content
        accountMenu.innerHTML = `
                    <a href="/profile" class="block px-4 py-3 text-[#8697C4] hover:bg-[#ADBBDA] hover:text-[#7091E6] rounded-t-lg">
                        Profile
                    </a>
                    <a href="/chat" class="block px-4 py-3 text-[#8697C4] hover:bg-[#ADBBDA] hover:text-[#7091E6] rounded-t-lg">
                        My Messages
                    </a>
                    <a href="/auth/logout"  class="block px-4 py-3 text-[#8697C4] hover:bg-[#ADBBDA] hover:text-[#7091E6] rounded-b-lg">
                        Logout
                    </a>
                `;
      } else {
        console.warn("User not logged in. Redirecting to login...");
        const loginPrompt = document.getElementById("loginPrompt");
        if (loginPrompt) {
          loginPrompt.classList.remove("hidden");
        }
      }
    } catch (error) {
      console.error("Error checking login:", error);
      alert(
        "Unable to verify login status. Please check your network connection."
      );
    }
  }

  // Wait for the DOM to be fully loaded before checking login
  checkLoginStatus();
});