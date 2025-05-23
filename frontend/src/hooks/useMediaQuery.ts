// src/hooks/useMediaQuery.ts
import { useEffect, useState } from "react";

export const useMediaQuery = (query: string) => {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatch(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return match;
};
