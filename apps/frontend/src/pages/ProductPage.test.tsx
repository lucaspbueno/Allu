import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductPage from "./ProductPage";
import { useProduct } from "@/hooks/useProduct";

jest.mock("@/config/api", () => ({
  CATALOG_API_BASE: "http://localhost:3001",
  SEARCH_API_BASE: "http://localhost:3002",
  CART_API_BASE: "http://localhost:3003",
}));
jest.mock("@/hooks/useProduct");
const mockAddItem = jest.fn();
jest.mock("@/hooks/useCart", () => ({
  useCart: () => ({
    cart: null,
    loading: false,
    error: null,
    refetch: jest.fn(),
    addItem: mockAddItem,
    updateQuantity: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

const mockUseProduct = useProduct as jest.MockedFunction<typeof useProduct>;

const produtoFake = {
  id: 1,
  name: "Produto Teste",
  description: "Descrição do produto",
  price: "119.90",
  imageUrl: "/img.jpg",
  category: "Eletrônicos",
  stock: 10,
  active: true,
  createdAt: "",
  updatedAt: "",
};

function renderProductPage(routeId: string) {
  return render(
    <MemoryRouter initialEntries={[`/produto/${routeId}`]}>
      <Routes>
        <Route path="/produto/:id" element={<ProductPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProductPage", () => {
  beforeEach(() => {
    mockAddItem.mockReset();
    mockUseProduct.mockReturnValue({
      product: null,
      loading: false,
      error: null,
    });
  });

  describe("estado de carregamento", () => {
    it("exibe mensagem de carregamento quando loading é true", () => {
      mockUseProduct.mockReturnValue({
        product: null,
        loading: true,
        error: null,
      });

      renderProductPage("1");

      expect(screen.getByText(/carregando…/i)).toBeInTheDocument();
    });
  });

  describe("estado de erro", () => {
    it("exibe mensagem de erro e link para o catálogo quando há error", () => {
      mockUseProduct.mockReturnValue({
        product: null,
        loading: false,
        error: "Produto não encontrado",
      });

      renderProductPage("999");

      expect(screen.getByRole("alert")).toHaveTextContent("Produto não encontrado");
      expect(screen.getByRole("link", { name: /voltar ao catálogo/i })).toHaveAttribute(
        "href",
        "/catalog"
      );
    });
  });

  describe("produto carregado", () => {
    it("renderiza nome, categoria, preço à vista e preço mensal", () => {
      mockUseProduct.mockReturnValue({
        product: produtoFake,
        loading: false,
        error: null,
      });

      renderProductPage("1");

      expect(screen.getByText("Produto Teste")).toBeInTheDocument();
      expect(screen.getByText("Eletrônicos")).toBeInTheDocument();
      expect(screen.getByText(/R\$ 119,90/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 9,99\/mês/)).toBeInTheDocument();
      expect(screen.getByText(/valor à vista/)).toBeInTheDocument();
      expect(screen.getByText(/valor mensal equivalente em 12x/)).toBeInTheDocument();
    });

    it("renderiza descrição quando presente", () => {
      mockUseProduct.mockReturnValue({
        product: produtoFake,
        loading: false,
        error: null,
      });

      renderProductPage("1");

      expect(screen.getByText("Descrição")).toBeInTheDocument();
      expect(screen.getByText("Descrição do produto")).toBeInTheDocument();
    });

    it("renderiza estoque quando maior que zero", () => {
      mockUseProduct.mockReturnValue({
        product: produtoFake,
        loading: false,
        error: null,
      });

      renderProductPage("1");

      expect(screen.getByText(/disponível: 10 un\./i)).toBeInTheDocument();
    });

    it("passa o id numérico da rota para useProduct", () => {
      mockUseProduct.mockReturnValue({
        product: produtoFake,
        loading: false,
        error: null,
      });

      renderProductPage("42");

      expect(mockUseProduct).toHaveBeenCalledWith(42);
    });

    it("chama addItem ao clicar em Adicionar ao carrinho e exibe mensagem de sucesso", async () => {
      mockAddItem.mockResolvedValueOnce(undefined);
      mockUseProduct.mockReturnValue({
        product: produtoFake,
        loading: false,
        error: null,
      });

      renderProductPage("1");

      const botao = screen.getByRole("button", {
        name: /adicionar ao carrinho/i,
      });
      await act(async () => {
        fireEvent.click(botao);
        await Promise.resolve();
      });

      expect(mockAddItem).toHaveBeenCalledWith({
        productId: 1,
        name: "Produto Teste",
        price: 119.9,
        quantity: 1,
        imageUrl: "/img.jpg",
      });

      expect(await screen.findByText("Adicionado ao carrinho")).toBeInTheDocument();
    });

    it("botão Adicionar ao carrinho está desabilitado quando estoque é zero", () => {
      mockUseProduct.mockReturnValue({
        product: { ...produtoFake, stock: 0 },
        loading: false,
        error: null,
      });

      renderProductPage("1");

      const botao = screen.getByRole("button", {
        name: /adicionar ao carrinho/i,
      });
      expect(botao).toBeDisabled();
    });
  });
});
