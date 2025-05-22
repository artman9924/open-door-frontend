// ✅ SETUP & CONSTANTS
const BASE_URL = "https://open-door-backend.onrender.com";
const homeIntro = document.getElementById("home-intro");
let selectedMood = null;
let showingFavorites = false;

if (!localStorage.getItem("openDoorUserId")) {
  const anonId = "anon-" + Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem("openDoorUserId", anonId);
  console.log("New anonymous ID created:", anonId);
} else {
  console.log("Existing anonymous ID found:", localStorage.getItem("openDoorUserId"));
}
