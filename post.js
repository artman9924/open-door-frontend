// 📝 POST LOGIC
window.goToPost = function () {
  if (homeIntro) homeIntro.style.display = "none";
  document.querySelector(".button-group").style.display = "none";
  document.getElementById("postForm").style.display = "block";

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
        const alreadySelected = btn.classList.contains("selected");
        document.querySelectorAll(".mood-emoji").forEach((b) => b.classList.remove("selected"));
        selectedMood = !alreadySelected ? emoji : null;
        if (!alreadySelected) btn.classList.add("selected");
      };

      moodBar.appendChild(btn);
    });

    form.insertBefore(moodBar, textarea);
  }
};

window.cancelPost = function () {
  document.getElementById("postForm").style.display = "none";
  document.querySelector(".button-group").style.display = "block";
  if (homeIntro) homeIntro.style.display = "block";
};
