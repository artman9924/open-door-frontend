document.addEventListener("DOMContentLoaded", function () {
  // 🕊️ Anonymous Account System — Open Door
  function generateAnonId() {
    return (
      "anon-" +
      Math.random().toString(36).substring(2) +
      Date.now().toString(36)
    );
  }

  if (!localStorage.getItem("openDoorUserId")) {
    const anonId = generateAnonId();
    localStorage.setItem("openDoorUserId", anonId);
    console.log("New anonymous ID created:", anonId);
  } else {
    console.log(
      "Existing anonymous ID found:",
      localStorage.getItem("openDoorUserId")
    );
  }
  let selectedMood = null; //
  // post messages
  window.goToPost = function () {
    const homeIntro = document.getElementById("home-intro");
    if (homeIntro) homeIntro.style.display = "none";

    document.querySelector(".button-group").style.display = "none";
    document.getElementById("postForm").style.display = "block";

    // Only insert moodBar if it's not already there
    if (!document.querySelector(".mood-bar")) {
      const textarea = document.getElementById("messageInput");
      const form = document.getElementById("postForm");

      const moodBar = document.createElement("div");
      moodBar.className = "mood-bar";
      moodBar.textContent = "How are you feeling? ";

      const moods = ["😔", "😐", "🙂", "😄"];
      moods.forEach((emoji) => {
        const btn = document.createElement("button");
        btn.textContent = emoji;
        btn.className = "mood-emoji";

        btn.onclick = (e) => {
          e.preventDefault();
          document
            .querySelectorAll(".mood-emoji")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
          selectedMood = emoji;
        };

        moodBar.appendChild(btn);
      });

      form.insertBefore(moodBar, textarea);
    }
  };

  window.cancelPost = function () {
    document.getElementById("postForm").style.display = "none";
    document.querySelector(".button-group").style.display = "block";
  };
  // const BASE_URL = "http://127.0.0.1:5000"; // local version
  const BASE_URL = "https://open-door-backend.onrender.com"; // live version
  function formatTimestamp(timestamp) {
    const messageTime = new Date(timestamp.replace(" ", "T") + "Z");
    const now = new Date();
    const diffMs = now - messageTime;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  }
  window.submitMessage = function () {
    const message = document.getElementById("messageInput").value;

    if (message.trim() === "") {
      alert("Please write something before submitting!");
      return;
    }

    fetch(`${BASE_URL}/post-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message, mood: selectedMood || null }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error: " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        alert("Your message has been sent!");
        document.getElementById("messageInput").value = "";
        document.getElementById("postForm").style.display = "none";
        document.querySelector(".button-group").style.display = "block";
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error connecting to the server.");
      });
  };
  // Show welcome message when reading messages
  function showGentleWelcome() {
    const userId = localStorage.getItem("openDoorUserId");
    if (!userId) return;

    const welcome = document.createElement("div");
    welcome.textContent = "Welcome back, gentle soul.";
    welcome.style.fontSize = "1.1em";
    welcome.style.fontStyle = "italic";
    welcome.style.color = "#666";
    welcome.style.margin = "12px 0";
    welcome.style.padding = "8px";
    welcome.style.textAlign = "center";
    welcome.style.opacity = "0";
    welcome.style.transition = "opacity 1.5s ease";

    const container =
      document.getElementById("messages-container") || document.body;
    container.prepend(welcome);

    // Fade in gently
    setTimeout(() => {
      welcome.style.opacity = "1";
    }, 300);
    // Remove welcome message after timeout
    setTimeout(() => welcome.remove(), 10000);
  }

  // Show Favorites toggle for use in goToRead function
  let showingFavorites = localStorage.getItem("od_showingFavorites") === "true";

  // Read Messages
  window.goToRead = function () {
    const homeIntro = document.getElementById("home-intro");
    const buttonGroup = document.querySelector(".button-group");
    const postForm = document.getElementById("postForm");
    const readSection = document.getElementById("read-section");
    const spinner = document.getElementById("loading-spinner");
    // const backButton = document.getElementById("back-button");

    // Hide other UI parts
    if (buttonGroup) buttonGroup.style.display = "none";
    if (postForm) postForm.style.display = "none";
    if (readSection) readSection.style.display = "block";
    if (spinner) spinner.style.display = "block";
    if (homeIntro) homeIntro.style.display = "none";
    // if (backButton) backButton.style.display = "block";

    // Clear previous messages
    const container = document.getElementById("messages-container");
    if (container) container.innerHTML = "";

    // Fetch and display messages
    fetch(`${BASE_URL}/get-messages`)
      .then((response) => response.json())
      .then((messages) => {
        if (spinner) spinner.style.display = "none";
        if (container) {
          container.innerHTML = "";

          const title = document.createElement("h1");
          title.textContent = "Messages Shared on Open Door";
          container.appendChild(title);

          // View Favorites button
          const filterToggle = document.createElement("button");
          filterToggle.textContent = showingFavorites
            ? "📜 Show All Messages"
            : "🔍 View Favorites Only";
          filterToggle.className = "filter-toggle";
          container.appendChild(filterToggle);

          filterToggle.addEventListener("click", () => {
            //scanned
            if (!showingFavorites) {
              const hasFavorites = Object.keys(localStorage).some((key) =>
                key.startsWith("favorite-")
              );

              if (!hasFavorites) {
                const notice = document.createElement("div");
                notice.textContent =
                  "You haven’t saved any favorites yet. Showing all messages instead.";
                notice.className = "soft-notice";

                container.prepend(notice);
                setTimeout(() => notice.remove(), 5000);
                return;
              }
            }

            showingFavorites = !showingFavorites;
            localStorage.setItem("od_showingFavorites", showingFavorites);
            goToRead(); // re-render
          }); //scanned

          // Display messages
          messages.forEach((msg) => {
            const favKey = `favorite-${msg.id}`;
            if (showingFavorites && !localStorage.getItem(favKey)) return;

            const messageCard = document.createElement("div");
            messageCard.className = "message-card";

            const timestamp = document.createElement("p");
            timestamp.className = "timestamp";
            timestamp.innerHTML = `<strong>Posted:</strong> ${
              msg.timestamp ? formatTimestamp(msg.timestamp) : "Unknown time"
            }`;

            const favBtn = document.createElement("button");
            favBtn.textContent = localStorage.getItem(favKey)
              ? "★ Saved"
              : "★ Save";
            favBtn.className = localStorage.getItem(favKey)
              ? "fav-btn saved"
              : "fav-btn";

            favBtn.onclick = () => {
              if (localStorage.getItem(favKey)) {
                localStorage.removeItem(favKey);
                favBtn.textContent = "★ Save";
                favBtn.className = "fav-btn";
              } else {
                localStorage.setItem(favKey, "true");
                favBtn.textContent = "★ Saved";
                favBtn.className = "fav-btn saved";
              }
            };

            const messageText = document.createElement("p");
            messageText.className = "message-text";
            messageText.textContent = msg.content;

            messageCard.appendChild(timestamp);
            messageCard.appendChild(messageText);
            messageCard.appendChild(favBtn);
            container.appendChild(messageCard);
          });

          const backButton = document.createElement("button");
          backButton.textContent = "← Back";
          backButton.className = "back-button-alt";
          backButton.onclick = () => window.location.reload();

          container.appendChild(backButton);
          showGentleWelcome();
        }
      })
      .catch((error) => {
        if (spinner) spinner.style.display = "none";
        console.error("Error fetching messages:", error);
        alert("Couldn't load messages. Please try again.");
      });
  };
});
