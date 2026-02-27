import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Allu</h1>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">Desafio Técnico Allu - Full-Stack</footer>
    </div>
  );
}
