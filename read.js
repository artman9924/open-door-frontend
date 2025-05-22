// 📖 READ & FILTER LOGIC
window.goToRead = function () {
  const buttonGroup = document.querySelector(".button-group");
  const postForm = document.getElementById("postForm");
  const readSection = document.getElementById("read-section");
  const spinner = document.getElementById("loading-spinner");
  const container = document.getElementById("messages-container");

  if (buttonGroup) buttonGroup.style.display = "none";
  if (postForm) postForm.style.display = "none";
  if (readSection) readSection.style.display = "block";
  if (spinner) spinner.style.display = "block";
  if (homeIntro) homeIntro.style.display = "none";

  // if (container) container.innerHTML = "";
  fetch(`${BASE_URL}/get-messages`)
    .then((response) => response.json())
    .then((messages) => {
      if (spinner) spinner.style.display = "none";
      if (!container) return;
      container.innerHTML = "";
      const title = document.createElement("h1");
      title.textContent = "Messages Shared on Open Door";
      container.appendChild(title);

      const moodFilter = document.createElement("div");
      moodFilter.id = "mood-filter";
      const moods = ["", "😔", "😐", "🙂", "😄"];
      moods.forEach((mood) => {
        const btn = document.createElement("button");
        btn.textContent = mood || "All";
        btn.dataset.mood = mood;
        btn.className = "mood-button";
        btn.addEventListener("click", () => {
          selectedMood = mood;
          renderMessages(filterMessages(messages));
        });
        moodFilter.appendChild(btn);
      });
      container.appendChild(moodFilter);

      const filterToggle = document.createElement("button");
      filterToggle.textContent = "🔍 View Favorites Only";
      filterToggle.className = "filter-toggle";
      filterToggle.addEventListener("click", () => {
        showingFavorites = !showingFavorites;
        filterToggle.textContent = showingFavorites
          ? "📜 Show All Messages"
          : "🔍 View Favorites Only";
        renderMessages(filterMessages(messages));
      });
      container.appendChild(filterToggle);

      // sub-container for message list
      const messageList = document.createElement("div");
      messageList.id = "message-list";
      container.appendChild(messageList);

      renderMessages(filterMessages(messages));
    })
    .catch((error) => {
      if (spinner) spinner.style.display = "none";
      console.error("Error fetching messages:", error);
      alert("Couldn't load messages. Please try again.");
    });
};

function filterMessages(messages) {
  return messages.filter((msg) => {
    const matchMood = selectedMood ? msg.mood === selectedMood : true;
    const matchFav = showingFavorites ? isFavorite(msg) : true;
    return matchMood && matchFav;
  });
}
