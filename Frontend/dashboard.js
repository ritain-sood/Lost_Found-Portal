const reviewsWrapper = document.getElementById('reviews-wrapper');
    const dotsContainer = document.getElementById('dots-container');

    let currentIndex = 0;
    const totalReviews = reviewsWrapper.children.length;
    const cardsToShow = 4; // Number of cards to show at a time

    // Function to slide reviews
    const slideReviews = (index) => {
      currentIndex = index;
      const offset = -currentIndex * (100 / cardsToShow);
      reviewsWrapper.style.transform = `translateX(${offset}%)`;
      updateDots();
    };
    // Automatic sliding
    const autoSlideInterval = 3000; // 3 seconds
    let autoSlide = setInterval(() => {
      if (currentIndex <= totalReviews - cardsToShow) {
        currentIndex++;
      } else {
        currentIndex = 0; // Reset to the first card
      }
      slideReviews(currentIndex);
    }, autoSlideInterval);

    // Pause auto-slide on hover
    reviewsWrapper.addEventListener('mouseenter', () => clearInterval(autoSlide));
    reviewsWrapper.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => {
        if (currentIndex < totalReviews - cardsToShow) {
          currentIndex++;
        } else {
          currentIndex = 0; // Reset to the first card
        }
        slideReviews(currentIndex);
      }, autoSlideInterval);
    });

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
                    <a href="/profile?tab=items" class="block px-4 py-3 text-[#8697C4] hover:bg-[#ADBBDA] hover:text-[#7091E6] rounded-t-lg">
                        Listed Items
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