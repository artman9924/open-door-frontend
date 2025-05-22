// 💬 RENDER MESSAGES
function renderMessages(messages) {
  const container = document.getElementById("message-list");
  if (!container) return;
  container.innerHTML = "";

  messages.forEach((msg) => {
    const headerRow = document.createElement("div");
    headerRow.className = "card-header";

    const favKey = `favorite-${msg.id}`;
    if (showingFavorites && !localStorage.getItem(favKey)) return;

    const messageCard = document.createElement("div");
    messageCard.className = "message-card";

    const moodSpan = document.createElement("span");
    moodSpan.className = "emoji";
    moodSpan.textContent = msg.mood || "";

    const timestamp = document.createElement("span");
    timestamp.className = "timestamp";
    timestamp.innerHTML = `<strong>Posted:</strong> ${
      msg.timestamp ? formatTimestamp(msg.timestamp) : "Unknown time"
    }`;

    const favBtn = document.createElement("button");
    const isSaved = localStorage.getItem(favKey);
    favBtn.textContent = isSaved ? "★ Saved" : "★ Save";
    favBtn.className = isSaved ? "fav-btn saved" : "fav-btn";
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

    headerRow.appendChild(moodSpan);
    headerRow.appendChild(timestamp);

    messageCard.appendChild(headerRow);
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

function showGentleWelcome() {
  console.log("🌿 Welcome to Open Door");
}
