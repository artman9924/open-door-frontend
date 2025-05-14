function goToPost() {
  document.querySelector(".button-group").style.display = "none";
  document.getElementById("postForm").style.display = "block";
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
    body: JSON.stringify({ content: message }),
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

      messages.forEach((msg, index) => {
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

        // Message content
        const messageText = document.createElement("p");
        messageText.style.fontSize = "1.2em";
        messageText.style.marginTop = "10px";
        messageText.textContent = msg.content;

        const reactionRow = document.createElement("div");
        reactionRow.style.marginTop = "10px";
        reactionRow.style.display = "flex";
        reactionRow.style.flexWrap = "nowrap";
        reactionRow.style.gap = "8px";
        reactionRow.style.justifyContent = "flex-start";
        reactionRow.style.overflowX = "auto";

        ["💛", "🙏", "🌱"].forEach((emoji) => {
          const btn = document.createElement("button");
          btn.textContent = emoji;
          btn.style.marginRight = "8px";
          btn.style.fontSize = "1.2em";
          btn.style.padding = "4px 8px";
          btn.style.whiteSpace = "nowrap";
          btn.onclick = () => {
            const reactionKey = `reacted-${msg.id}-${emoji}`;
            if (localStorage.getItem(reactionKey)) {
              alert("You already sent this reaction.");
              return;
            }
            fetch(`${BASE_URL}/react/${msg.id}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ emoji }),
            })
              .then((res) => res.json())
              .then((data) => {
                alert("Reaction sent!");
                localStorage.setItem(reactionKey, "true");
              })
              .catch(() => alert("Could not send reaction"));
          };
          reactionRow.appendChild(btn);
        });

        messageCard.appendChild(reactionRow);

        // Attach to message card
        messageCard.appendChild(timestamp);
        messageCard.appendChild(messageText);

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
      });

      // Add card to messages-container
      container.appendChild(messageCard);

      const backButton = document.createElement("button");
      backButton.textContent = "Back to Home";
      backButton.style.marginTop = "20px";
      backButton.onclick = () => window.location.reload();
      container.appendChild(backButton);
    })
    .catch((error) => {
      document.getElementById("loading-spinner").style.display = "none";
      console.error("Error fetching messages:", error);
      alert("Couldn't load messages. Please try again.");
    });
}
