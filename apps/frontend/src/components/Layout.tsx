import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-header__title">
          <Link to="/">Allu</Link>
        </h1>
        <nav className="app-nav" aria-label="Principal">
          <Link to="/" className="app-nav__link">
            Início
          </Link>
          <Link to="/catalog" className="app-nav__link">
            Catálogo
          </Link>
          <Link to="/search" className="app-nav__link">
            Busca
          </Link>
          <Link to="/cart" className="app-nav__link">
            Carrinho
          </Link>
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">Desafio Técnico Allu - Full-Stack</footer>
    </div>
  );
}
