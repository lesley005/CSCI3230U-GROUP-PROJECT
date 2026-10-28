import { useState } from "react";

// Reusable Save/Unsave toggle. onToggle is optional: it gets the new saved value.
function SaveButton({ initialSaved = false, onToggle }) {
  const [saved, setSaved] = useState(initialSaved);

  function handleClick() {
    const next = !saved;
    setSaved(next);
    if (onToggle) onToggle(next);
  }

  return (
    <button
      type="button"
      className="save-button"
      aria-pressed={saved}
      onClick={handleClick}
    >
      {saved ? "♥ Saved" : "♡ Save"}
    </button>
  );
}

export default SaveButton;