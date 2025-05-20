// 🕊️ Anonymous Account System — Open Door
function generateAnonId() {
  return (
    "anon-" + Math.random().toString(36).substring(2) + Date.now().toString(36)
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

function goToPost() {
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
}

function cancelPost() {
  document.getElementById("postForm").style.display = "none";
  document.querySelector(".button-group").style.display = "block";
}
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
function submitMessage() {
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
}
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

// Show Favorites toggle
let showingFavorites = localStorage.getItem("od_showingFavorites") === "true";

// Read Messages
function goToRead() {
  document.getElementById("postForm").style.display = "none";
  document.getElementById("messages-container").innerHTML = ""; // Clear old messages
  document.getElementById("loading-spinner").style.display = "block"; // Show loading spinner

  fetch(`${BASE_URL}/get-messages`)
    .then((response) => response.json())
    .then((messages) => {
      document.getElementById("loading-spinner").style.display = "none"; // Hide spinner once loaded

      const container = document.getElementById("messages-container");

      const title = document.createElement("h1");
      title.textContent = "Messages Shared on Open Door";
      container.appendChild(title);

      // View Favorites button
      const filterToggle = document.createElement("button");
      filterToggle.textContent = showingFavorites
        ? "📜 Show All Messages"
        : "🔍 View Favorites Only";
      filterToggle.className = "filter-toggle";
      filterToggle.addEventListener("click", () => {
        showingFavorites = !showingFavorites;
        localStorage.setItem("od_showingFavorites", showingFavorites);
        goToRead(); // re-renders view
      });

      container.appendChild(filterToggle);

      // View messages, default or favorites
      messages.forEach((msg, index) => {
        const favKey = `favorite-${msg.id}`;
        if (showingFavorites && !localStorage.getItem(favKey)) return;

        const messageCard = document.createElement("div");
        messageCard.className = "message-card";

        // Timestamp
        const timestamp = document.createElement("p");
        timestamp.className = "timestamp";
        if (msg.timestamp) {
          timestamp.innerHTML = `<strong>Posted:</strong> ${formatTimestamp(
            msg.timestamp
          )}`;
        } else {
          timestamp.innerHTML = "<strong>Posted:</strong> Unknown time";
        }
        // Favorite button
        const favBtn = document.createElement("button");
        favBtn.textContent = "★ Save";
        favBtn.className = "fav-btn";

        if (localStorage.getItem(favKey)) {
          favBtn.textContent = "★ Saved";
          favBtn.style.color = "#f5b301";
        }

        favBtn.onclick = () => {
          if (localStorage.getItem(favKey)) {
            localStorage.removeItem(favKey);
            favBtn.textContent = "★ Save";
            favBtn.style.color = "#888";
          } else {
            localStorage.setItem(favKey, "true");
            favBtn.textContent = "★ Saved";
            favBtn.style.color = "#f5b301";
          }
        };

        // Message content
        // Attach to message card
        messageCard.appendChild(timestamp);
        const messageText = document.createElement("p");
        messageText.style.fontSize = "1.2em";
        messageText.style.marginTop = "10px";
        messageText.textContent = msg.content;

        messageCard.appendChild(messageText);
        messageCard.appendChild(favBtn);

        if (msg.reactions) {
          const reactionDisplay = document.createElement("div");
          reactionDisplay.style.display = "flex";
          reactionDisplay.style.gap = "8px";
          reactionDisplay.style.marginTop = "10px";
          reactionDisplay.style.flexWrap = "wrap";

          const label = document.createElement("span");
          label.textContent = "Reactions:";
          label.style.fontWeight = "bold";
          label.style.fontSize = "0.9em";
          reactionDisplay.appendChild(label);

          try {
            const reactionData = JSON.parse(msg.reactions);
            Object.entries(reactionData).forEach(([emoji, count]) => {
              const tag = document.createElement("span");
              tag.textContent = `${emoji} ${count}`;
              tag.style.fontSize = "1.1em";
              tag.style.padding = "2px 8px";
              tag.style.borderRadius = "8px";
              tag.style.background = "#eee";
              tag.style.boxShadow = "inset 0 0 3px rgba(0,0,0,0.05)";
              reactionDisplay.appendChild(tag);
            });
          } catch (err) {
            console.error("Invalid reactions format", err);
          }

          messageCard.appendChild(reactionDisplay);
        }
        // Add card to messages-container
        container.appendChild(messageCard);
      });

      const backButton = document.createElement("button");
      backButton.textContent = "Back to Home";
      backButton.style.marginTop = "20px";
      backButton.onclick = () => window.location.reload();
      container.appendChild(backButton);

      showGentleWelcome();
    })
    .catch((error) => {
      document.getElementById("loading-spinner").style.display = "none";
      console.error("Error fetching messages:", error);
      alert("Couldn't load messages. Please try again.");
    });
}
