import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

jest.mock("@/config/api", () => ({
  CATALOG_API_BASE: "http://localhost:3001",
  SEARCH_API_BASE: "http://localhost:3002",
  CART_API_BASE: "http://localhost:3003",
}));

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
}

describe("App", () => {
  it("renderiza o layout com o cabeçalho Allu", () => {
    renderWithRouter();
    expect(screen.getByRole("heading", { name: /allu/i })).toBeInTheDocument();
  });

  it("renderiza a home em /", () => {
    renderWithRouter();
    expect(screen.getByRole("heading", { name: /bem-vindo/i })).toBeInTheDocument();
    expect(screen.getByText(/página inicial do desafio técnico allu/i)).toBeInTheDocument();
  });

  it("renderiza o texto do rodapé", () => {
    renderWithRouter();
    expect(screen.getByText(/desafio técnico allu - full-stack/i)).toBeInTheDocument();
  });
});
