import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cart from "./Cart";
import { useCart } from "@/hooks/useCart";

jest.mock("@/config/api", () => ({
  CATALOG_API_BASE: "http://localhost:3001",
  SEARCH_API_BASE: "http://localhost:3002",
  CART_API_BASE: "http://localhost:3003",
}));
jest.mock("@/hooks/useCart");

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;

const carrinhoComItens = {
  id: 1,
  sessionId: "sess_1",
  items: [
    {
      id: 1,
      cartId: 1,
      productId: 10,
      name: "Produto A",
      price: "29.90",
      quantity: 2,
    },
    {
      id: 2,
      cartId: 1,
      productId: 20,
      name: "Produto B",
      price: "15.00",
      quantity: 1,
    },
  ],
  createdAt: "",
  updatedAt: "",
};

function renderCart() {
  return render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>
  );
}

describe("Cart", () => {
  beforeEach(() => {
    mockUseCart.mockReturnValue({
      cart: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
      addItem: jest.fn(),
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
    });
  });

  describe("estado de carregamento", () => {
    it("exibe mensagem de carregamento quando loading é true", () => {
      mockUseCart.mockReturnValue({
        cart: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
        addItem: jest.fn(),
        updateQuantity: jest.fn(),
        removeItem: jest.fn(),
      });

      renderCart();

      expect(screen.getByText(/carregando carrinho…/i)).toBeInTheDocument();
    });
  });

  describe("estado de erro", () => {
    it("exibe mensagem de erro e link para o catálogo", () => {
      mockUseCart.mockReturnValue({
        cart: null,
        loading: false,
        error: "Falha ao carregar carrinho",
        refetch: jest.fn(),
        addItem: jest.fn(),
        updateQuantity: jest.fn(),
        removeItem: jest.fn(),
      });

      renderCart();

      expect(screen.getByRole("alert")).toHaveTextContent("Falha ao carregar carrinho");
      expect(screen.getByRole("link", { name: /ir ao catálogo/i })).toHaveAttribute(
        "href",
        "/catalog"
      );
    });
  });

  describe("carrinho vazio", () => {
    it("exibe mensagem de carrinho vazio e link para catálogo", () => {
      mockUseCart.mockReturnValue({
        cart: { id: 1, sessionId: "s", items: [], createdAt: "", updatedAt: "" },
        loading: false,
        error: null,
        refetch: jest.fn(),
        addItem: jest.fn(),
        updateQuantity: jest.fn(),
        removeItem: jest.fn(),
      });

      renderCart();

      expect(screen.getByText(/seu carrinho está vazio/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /ver catálogo/i })).toHaveAttribute(
        "href",
        "/catalog"
      );
    });
  });

  describe("carrinho com itens", () => {
    it("exibe título Carrinho, lista de itens e total", () => {
      mockUseCart.mockReturnValue({
        cart: carrinhoComItens,
        loading: false,
        error: null,
        refetch: jest.fn(),
        addItem: jest.fn(),
        updateQuantity: jest.fn(),
        removeItem: jest.fn(),
      });

      renderCart();

      expect(screen.getByRole("heading", { name: /carrinho/i })).toBeInTheDocument();
      expect(screen.getByText("Produto A")).toBeInTheDocument();
      expect(screen.getByText("Produto B")).toBeInTheDocument();
      expect(screen.getByText(/R\$ 29,90 × 2 = R\$ 59,80/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 15,00 × 1 = R\$ 15,00/)).toBeInTheDocument();
      expect(screen.getByText(/total: R\$ 74,80/i)).toBeInTheDocument();
    });

    it("exibe link do item para a página do produto", () => {
      mockUseCart.mockReturnValue({
        cart: carrinhoComItens,
        loading: false,
        error: null,
        refetch: jest.fn(),
        addItem: jest.fn(),
        updateQuantity: jest.fn(),
        removeItem: jest.fn(),
      });

      renderCart();

      const linkA = screen.getByRole("link", { name: "Produto A" });
      expect(linkA).toHaveAttribute("href", "/produto/10");
      const linkB = screen.getByRole("link", { name: "Produto B" });
      expect(linkB).toHaveAttribute("href", "/produto/20");
    });

    it("chama updateQuantity ao alterar quantidade no input", async () => {
      const updateQuantity = jest.fn();
      mockUseCart.mockReturnValue({
        cart: carrinhoComItens,
        loading: false,
        error: null,
        refetch: jest.fn(),
        addItem: jest.fn(),
        updateQuantity,
        removeItem: jest.fn(),
      });

      renderCart();

      const inputs = screen.getAllByRole("spinbutton");
      const inputProdutoA = inputs[0];
      fireEvent.change(inputProdutoA, { target: { value: "5" } });

      expect(updateQuantity).toHaveBeenCalledWith(10, 5);
    });

    it("chama removeItem ao clicar em Remover", async () => {
      const removeItem = jest.fn();
      mockUseCart.mockReturnValue({
        cart: carrinhoComItens,
        loading: false,
        error: null,
        refetch: jest.fn(),
        addItem: jest.fn(),
        updateQuantity: jest.fn(),
        removeItem,
      });

      renderCart();

      const botoesRemover = screen.getAllByRole("button", { name: /remover/i });
      fireEvent.click(botoesRemover[0]);

      expect(removeItem).toHaveBeenCalledWith(10);
    });
  });
});
