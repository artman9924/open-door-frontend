
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("postForm");
  const input = document.getElementById("postInput");
  const moodSelect = document.getElementById("postMood");
  const submitButton = form.querySelector("button[type='submit']");

  let cooldownTimeout;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = input.value.trim();
    const mood = moodSelect.value;

    if (!content) {
      alert("Please enter a message before submitting.");
      return;
    }

    try {
      const response = await fetch("/post-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content, mood })
      });

      if (response.status === 429) {
        alert("You're posting too quickly. Please wait 30 seconds before trying again.");
        startCooldown();
        return;
      }

      const data = await response.json();

      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        alert("Message posted successfully!");
        input.value = "";
        startCooldown();
        // Optionally refresh the message list here
      }
    } catch (err) {
      console.error("Post failed:", err);
      alert("A network or server error occurred. Please try again later.");
    }
  });

  function startCooldown() {
    submitButton.disabled = true;
    let secondsLeft = 30;
    submitButton.textContent = `Wait ${secondsLeft}s`;

    cooldownTimeout = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(cooldownTimeout);
        submitButton.disabled = false;
        submitButton.textContent = "Post";
      } else {
        submitButton.textContent = `Wait ${secondsLeft}s`;
      }
    }, 1000);
  }
});
