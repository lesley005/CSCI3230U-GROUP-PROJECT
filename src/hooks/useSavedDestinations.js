// AI-assisted (Claude) - see AI-USAGE.md
import { useEffect, useState } from "react";
import {
  loadSaved,
  writeSaved,
  isInList,
  toggleInList,
  removeFromList,
} from "../utils/savedStorage.js";

// Custom hook: saved destinations shared across pages via localStorage
export function useSavedDestinations() {
  // Read localStorage once, when the component first loads
  const [saved, setSaved] = useState(() => loadSaved());

  // Write to localStorage whenever the list changes
  useEffect(() => {
    writeSaved(saved);
  }, [saved]);

  return {
    saved,
    isSaved: (id) => isInList(saved, id),
    toggleSaved: (destination) => setSaved((prev) => toggleInList(prev, destination)),
    removeSaved: (id) => setSaved((prev) => removeFromList(prev, id)),
  };
}