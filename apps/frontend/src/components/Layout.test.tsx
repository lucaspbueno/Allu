import { render, screen } from "@testing-library/react";
import Layout from "./Layout";

describe("Layout", () => {
  it("renderiza o cabeçalho com o título Allu", () => {
    render(<Layout>content</Layout>);
    expect(screen.getByRole("heading", { name: /allu/i })).toBeInTheDocument();
  });

  it("renderiza os filhos dentro do main", () => {
    render(
      <Layout>
        <span data-testid="child">child content</span>
      </Layout>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toHaveTextContent("child content");
  });

  it("renderiza o rodapé", () => {
    render(<Layout>content</Layout>);
    expect(screen.getByText(/desafio técnico allu - full-stack/i)).toBeInTheDocument();
  });
});
