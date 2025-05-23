
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("postForm");
  const input = document.getElementById("postInput");
  const mood = document.getElementById("postMood");
  const submitButton = form.querySelector("button[type='submit']");
  let cooldownTimeout;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = input.value.trim();
    const moodValue = mood.value;

    if (!message) {
      alert("Please enter a message before submitting.");
      return;
    }

    try {
      const response = await fetch("/post-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message, mood: moodValue }),
      });

      if (response.status === 429) {
        alert("You're posting too quickly. Please wait 30 seconds before trying again.");
        startCooldown();
        return;
      }

      const data = await response.json();

      if (data.error) {
        alert("Error: " + data.error);
      } else {
        input.value = "";
        alert("Message posted successfully!");
        startCooldown();
      }
    } catch (error) {
      console.error("Error posting message:", error);
      alert("An error occurred. Please try again.");
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
