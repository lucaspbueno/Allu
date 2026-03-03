import { render, screen, fireEvent } from "@testing-library/react";
import { ImageCarousel } from "./ImageCarousel";

describe("ImageCarousel", () => {
  describe("sem imagens", () => {
    it("renderiza mensagem quando images está vazio", () => {
      render(<ImageCarousel images={[]} alt="Produto" />);

      expect(screen.getByText("Sem imagem")).toBeInTheDocument();
    });
  });

  describe("uma imagem", () => {
    it("renderiza a imagem e não exibe botões prev/next nem dots", () => {
      render(<ImageCarousel images={["/img1.jpg"]} alt="Produto A" />);

      const img = screen.getByRole("img", { name: "Produto A" });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "/img1.jpg");

      expect(screen.queryByRole("button", { name: /imagem anterior/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /próxima imagem/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    });
  });

  describe("múltiplas imagens", () => {
    it("renderiza as imagens e exibe botões e dots", () => {
      render(<ImageCarousel images={["/a.jpg", "/b.jpg", "/c.jpg"]} alt="Produto" />);

      expect(screen.getByRole("img", { name: "Produto" })).toHaveAttribute("src", "/a.jpg");
      expect(screen.getByRole("button", { name: /imagem anterior/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /próxima imagem/i })).toBeInTheDocument();

      const dots = screen.getAllByRole("tab");
      expect(dots).toHaveLength(3);
      expect(dots[0]).toHaveAttribute("aria-selected", "true");
    });

    it("avança para a próxima imagem ao clicar em próximo", () => {
      render(<ImageCarousel images={["/a.jpg", "/b.jpg"]} alt="Produto" />);

      const dotSegundo = screen.getByRole("tab", { name: /imagem 2/i });
      expect(dotSegundo).toHaveAttribute("aria-selected", "false");

      fireEvent.click(screen.getByRole("button", { name: /próxima imagem/i }));

      expect(dotSegundo).toHaveAttribute("aria-selected", "true");
    });

    it("muda de slide ao clicar em um dot", () => {
      render(<ImageCarousel images={["/a.jpg", "/b.jpg"]} alt="Produto" />);

      const dots = screen.getAllByRole("tab");
      fireEvent.click(dots[1]);

      expect(dots[1]).toHaveAttribute("aria-selected", "true");
    });
  });
});
