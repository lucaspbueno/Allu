import { render, screen } from "@testing-library/react";
import Home from "./Home";

describe("Home", () => {
  it("renderiza o título de boas-vindas", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /bem-vindo/i })).toBeInTheDocument();
  });

  it("renderiza o parágrafo de introdução", () => {
    render(<Home />);
    expect(screen.getByText(/página inicial do desafio técnico allu/i)).toBeInTheDocument();
  });
});
