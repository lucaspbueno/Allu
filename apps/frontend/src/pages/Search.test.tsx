import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Search from "./Search";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useSearchResults } from "@/hooks/useSearchResults";

jest.mock("@/config/api", () => ({
  CATALOG_API_BASE: "http://localhost:3001",
  SEARCH_API_BASE: "http://localhost:3002",
}));
jest.mock("@/hooks/useSearchSuggestions");
jest.mock("@/hooks/useSearchResults");

const mockUseSearchSuggestions = useSearchSuggestions as jest.MockedFunction<
  typeof useSearchSuggestions
>;
const mockUseSearchResults = useSearchResults as jest.MockedFunction<typeof useSearchResults>;

const produtoFake = {
  id: 1,
  name: "Produto Teste",
  description: "Descrição",
  price: "29.90",
  imageUrl: "/img.jpg",
  category: "Categoria",
  stock: 5,
  active: true,
  createdAt: "",
  updatedAt: "",
};

function renderSearch() {
  return render(
    <MemoryRouter>
      <Search />
    </MemoryRouter>
  );
}

describe("Search", () => {
  beforeEach(() => {
    mockUseSearchSuggestions.mockReturnValue({
      suggestions: [],
      loading: false,
      error: null,
    });
    mockUseSearchResults.mockImplementation((query: string | null) => {
      if (!query || query.trim() === "") {
        return {
          data: [],
          total: 0,
          page: 1,
          totalPages: 0,
          loading: false,
          error: null,
        };
      }
      return {
        data: [produtoFake],
        total: 1,
        page: 1,
        totalPages: 1,
        loading: false,
        error: null,
      };
    });
  });

  describe("renderização inicial", () => {
    it("renderiza o título Busca", () => {
      renderSearch();
      expect(screen.getByRole("heading", { name: /busca/i })).toBeInTheDocument();
    });

    it("renderiza o input de busca e o botão Buscar", () => {
      renderSearch();
      expect(screen.getByRole("combobox", { name: /buscar produtos/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /buscar/i })).toBeInTheDocument();
    });

    it("exibe a dica quando não há busca submetida", () => {
      renderSearch();
      expect(
        screen.getByText(/digite um termo e pressione enter ou clique em buscar/i)
      ).toBeInTheDocument();
    });
  });

  describe("submissão da busca", () => {
    it("exibe resultados quando o usuário digita e clica em Buscar", () => {
      renderSearch();
      const input = screen.getByRole("combobox", { name: /buscar produtos/i });
      fireEvent.change(input, { target: { value: "termo" } });
      fireEvent.click(screen.getByRole("button", { name: /buscar/i }));

      expect(screen.getByText(/1 resultado\(s\) para "termo"/i)).toBeInTheDocument();
      expect(screen.getByText("Produto Teste")).toBeInTheDocument();
      expect(screen.getByText("Categoria")).toBeInTheDocument();
    });
  });

  describe("sugestões", () => {
    it("exibe sugestões no dropdown quando o hook retorna dados", () => {
      mockUseSearchSuggestions.mockReturnValue({
        suggestions: [{ id: 1, name: "iPhone", category: "Smartphones" }],
        loading: false,
        error: null,
      });

      renderSearch();
      const input = screen.getByRole("combobox", { name: /buscar produtos/i });
      fireEvent.change(input, { target: { value: "iph" } });

      expect(screen.getByText("iPhone")).toBeInTheDocument();
      expect(screen.getByText("Smartphones")).toBeInTheDocument();
    });

    it("ao clicar em uma sugestão, executa a busca com o nome e exibe resultados", () => {
      mockUseSearchSuggestions.mockReturnValue({
        suggestions: [{ id: 1, name: "iPhone", category: "Smartphones" }],
        loading: false,
        error: null,
      });

      renderSearch();
      const input = screen.getByRole("combobox", { name: /buscar produtos/i });
      fireEvent.change(input, { target: { value: "iph" } });
      fireEvent.click(screen.getByRole("option", { name: /iphone/i }));

      expect(screen.getByText(/1 resultado\(s\) para "iPhone"/i)).toBeInTheDocument();
    });
  });

  describe("estados de erro e vazio", () => {
    it("exibe mensagem de erro quando useSearchResults retorna error", () => {
      mockUseSearchResults.mockImplementation(() => ({
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
        loading: false,
        error: "Falha ao buscar",
      }));

      renderSearch();
      const input = screen.getByRole("combobox", { name: /buscar produtos/i });
      fireEvent.change(input, { target: { value: "x" } });
      fireEvent.click(screen.getByRole("button", { name: /buscar/i }));

      expect(screen.getByRole("alert")).toHaveTextContent("Falha ao buscar");
    });

    it("exibe mensagem de nenhum resultado quando total é 0", () => {
      mockUseSearchResults.mockImplementation((query: string | null) => {
        if (!query || query.trim() === "") {
          return { data: [], total: 0, page: 1, totalPages: 0, loading: false, error: null };
        }
        return {
          data: [],
          total: 0,
          page: 1,
          totalPages: 0,
          loading: false,
          error: null,
        };
      });

      renderSearch();
      const input = screen.getByRole("combobox", { name: /buscar produtos/i });
      fireEvent.change(input, { target: { value: "xyz" } });
      fireEvent.click(screen.getByRole("button", { name: /buscar/i }));

      expect(screen.getByText(/nenhum resultado para "xyz"/i)).toBeInTheDocument();
    });
  });
});
