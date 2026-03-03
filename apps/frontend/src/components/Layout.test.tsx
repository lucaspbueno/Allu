import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Layout from "./Layout";

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("Layout", () => {
  it("renderiza o cabeçalho com o título Allu", () => {
    renderWithRouter(<Layout>content</Layout>);
    expect(screen.getByRole("heading", { name: /allu/i })).toBeInTheDocument();
  });

  it("renderiza os filhos dentro do main", () => {
    renderWithRouter(
      <Layout>
        <span data-testid="child">child content</span>
      </Layout>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toHaveTextContent("child content");
  });

  it("renderiza o rodapé", () => {
    renderWithRouter(<Layout>content</Layout>);
    expect(screen.getByText(/desafio técnico allu - full-stack/i)).toBeInTheDocument();
  });
});
