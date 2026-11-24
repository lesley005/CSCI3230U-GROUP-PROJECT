
import { useSavedDestinations } from "../hooks/useSavedDestinations.js";   // use the shared hook

// Reusable Save/Unsave toggle. onToggle is optional: it gets the new saved value.
function SaveButton({ destination }) {                      
  const { isSaved, toggleSaved } = useSavedDestinations();
  const saved = isSaved(destination.id); 
  
// AI-assisted - see AI-USAGE.md #1
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
      onClick={() => toggleSaved(destination)}
      aria-label={saved ? `Remove ${destination.name} from saved` : `Save ${destination.name}`}
    >
      {saved ? "♥ Saved" : "♡ Save"}
    </button>
  );
}

export default SaveButton;