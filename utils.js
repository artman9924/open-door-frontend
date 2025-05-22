// 🧠 UTILITY FUNCTIONS
function formatTimestamp(timestamp) {
  const messageTime = new Date(timestamp.replace(" ", "T") + "Z");
  const now = new Date();
  const diffMs = now - messageTime;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  return messageTime.toLocaleString();
}

function isFavorite(msg) {
  return localStorage.getItem(`favorite-${msg.id}`);
}
