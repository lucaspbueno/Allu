import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCatalogInfinite } from "@/hooks/useCatalogInfinite";
import type { Product } from "@/types/product";

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="catalog-card">
      <Link to={`/produto/${product.id}`} className="catalog-card__link">
        <div className="catalog-card__image-wrap">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="catalog-card__image"
            loading="lazy"
          />
        </div>
        <div className="catalog-card__body">
          <h3 className="catalog-card__title">{product.name}</h3>
          <p className="catalog-card__category">{product.category}</p>
          <p className="catalog-card__price">R$ {product.price}</p>
        </div>
      </Link>
    </article>
  );
}

export default function Catalog() {
  const { products, loading, hasMore, error, loadMore } = useCatalogInfinite();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const el = sentinelRef.current;

    if (!el) return;

    /* rootMargin maior em viewports pequenas para carregar antes no scroll (mobile) */
    const rootMargin = typeof window !== "undefined" && window.innerWidth < 768 ? "200px" : "100px";

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <div className="catalog-page">
      <h2 className="catalog-page__title">Catálogo</h2>

      {error && (
        <p className="catalog-page__error" role="alert">
          {error}
        </p>
      )}

      {!error && products.length === 0 && !loading && (
        <p className="catalog-page__empty">Nenhum produto encontrado.</p>
      )}

      <div className="catalog-grid" role="list">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div ref={sentinelRef} className="catalog-sentinel" aria-hidden="true" />

      {loading && (
        <p className="catalog-page__loading" aria-live="polite">
          Carregando…
        </p>
      )}
    </div>
  );
}
