import { renderHook, waitFor, act } from "@testing-library/react";
import { useSearchSuggestions } from "./useSearchSuggestions";

const mockFetchSuggestions = jest.fn();
jest.mock("@/api/search", () => ({
  fetchSuggestions: (...args: unknown[]) => mockFetchSuggestions(...args),
}));

describe("useSearchSuggestions", () => {
  beforeEach(() => {
    mockFetchSuggestions.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("query vazia", () => {
    it("retorna sugestões vazias e não chama a API", () => {
      const { result } = renderHook(() => useSearchSuggestions(""));

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(mockFetchSuggestions).not.toHaveBeenCalled();
    });

    it("retorna sugestões vazias quando só há espaços", () => {
      const { result } = renderHook(() => useSearchSuggestions("   "));

      expect(result.current.suggestions).toEqual([]);
      expect(mockFetchSuggestions).not.toHaveBeenCalled();
    });
  });

  describe("query preenchida", () => {
    it("chama a API após o debounce e preenche sugestões", async () => {
      const sugestoes = [{ id: 1, name: "iPhone", category: "Smartphones" }];
      mockFetchSuggestions.mockResolvedValueOnce({ data: sugestoes });

      const { result } = renderHook(() => useSearchSuggestions("iph", 5));

      expect(mockFetchSuggestions).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.suggestions).toHaveLength(1);
      expect(result.current.suggestions[0].name).toBe("iPhone");
      expect(mockFetchSuggestions).toHaveBeenCalledWith("iph", 5);
    });

    it("passa o limit para fetchSuggestions", async () => {
      mockFetchSuggestions.mockResolvedValueOnce({ data: [] });

      renderHook(() => useSearchSuggestions("x", 8));

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockFetchSuggestions).toHaveBeenCalledWith("x", 8);
      });
    });

    it("preenche error quando a API falha", async () => {
      mockFetchSuggestions.mockRejectedValueOnce(new Error("Falha na rede"));

      const { result } = renderHook(() => useSearchSuggestions("termo"));

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Falha na rede");
      expect(result.current.suggestions).toEqual([]);
    });
  });
});
