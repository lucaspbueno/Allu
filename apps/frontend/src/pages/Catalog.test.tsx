import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Catalog from "./Catalog";
import { useCatalogInfinite } from "@/hooks/useCatalogInfinite";

jest.mock("@/config/api", () => ({ CATALOG_API_BASE: "http://localhost:3001" }));
jest.mock("@/hooks/useCatalogInfinite");

const mockUseCatalogInfinite = useCatalogInfinite as jest.MockedFunction<typeof useCatalogInfinite>;

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

function renderCatalog() {
  return render(
    <MemoryRouter>
      <Catalog />
    </MemoryRouter>
  );
}

describe("Catalog", () => {
  beforeEach(() => {
    mockUseCatalogInfinite.mockReturnValue({
      products: [],
      loading: true,
      hasMore: false,
      error: null,
      loadMore: jest.fn(),
    });
  });

  describe("renderização", () => {
    it("renderiza o título Catálogo", () => {
      mockUseCatalogInfinite.mockReturnValue({
        products: [],
        loading: false,
        hasMore: false,
        error: null,
        loadMore: jest.fn(),
      });

      renderCatalog();

      expect(screen.getByRole("heading", { name: /catálogo/i })).toBeInTheDocument();
    });

    it("exibe mensagem de carregamento quando loading é true", () => {
      renderCatalog();

      expect(screen.getByText(/carregando…/i)).toBeInTheDocument();
    });

    it("exibe mensagem de erro quando error está preenchido", () => {
      mockUseCatalogInfinite.mockReturnValue({
        products: [],
        loading: false,
        hasMore: false,
        error: "Falha ao carregar produtos",
        loadMore: jest.fn(),
      });

      renderCatalog();

      expect(screen.getByRole("alert")).toHaveTextContent("Falha ao carregar produtos");
    });

    it("exibe mensagem de lista vazia quando não há produtos e não está carregando", () => {
      mockUseCatalogInfinite.mockReturnValue({
        products: [],
        loading: false,
        hasMore: false,
        error: null,
        loadMore: jest.fn(),
      });

      renderCatalog();

      expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
    });

    it("renderiza os cards de produto quando há products", () => {
      mockUseCatalogInfinite.mockReturnValue({
        products: [produtoFake],
        loading: false,
        hasMore: false,
        error: null,
        loadMore: jest.fn(),
      });

      renderCatalog();

      expect(screen.getByText("Produto Teste")).toBeInTheDocument();
      expect(screen.getByText("Categoria")).toBeInTheDocument();
      expect(screen.getByText(/R\$ 29\.90/)).toBeInTheDocument();
      const link = screen.getByRole("link", { name: /produto teste/i });
      expect(link).toHaveAttribute("href", "/produto/1");
    });
  });
});
