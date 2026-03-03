import { useState, useEffect, useRef } from "react";
import { fetchSuggestions } from "@/api/search";
import type { SuggestionItem } from "@/types/search";

const DEBOUNCE_MS = 300;

export function useSearchSuggestions(query: string, limit: number = 5) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchSuggestions(trimmed, limit)
        .then((res) => setSuggestions(res.data))
        .catch((e) => setError(e instanceof Error ? e.message : "Erro ao buscar sugestões"))
        .finally(() => {
          setLoading(false);
          timeoutRef.current = null;
        });
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, limit]);

  return { suggestions, loading, error };
}
