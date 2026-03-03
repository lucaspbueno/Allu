import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useSearchResults } from "@/hooks/useSearchResults";
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

export default function Search() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { suggestions, loading: suggestionsLoading } = useSearchSuggestions(inputValue, 8);
  const {
    data: results,
    total,
    loading: resultsLoading,
    error: resultsError,
  } = useSearchResults(submittedQuery);

  const showDropdown = inputValue.trim().length > 0 && dropdownOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (q) {
      setSubmittedQuery(q);
      setDropdownOpen(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setInputValue(name);
    setSubmittedQuery(name);
    setDropdownOpen(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    function isOutsideInputAndDropdown(target: EventTarget | null) {
      const node = target as Node | null;
      return (
        dropdownRef.current &&
        !dropdownRef.current.contains(node) &&
        inputRef.current &&
        !inputRef.current.contains(node)
      );
    }
    function handleClickOutside(event: MouseEvent) {
      if (isOutsideInputAndDropdown(event.target)) setDropdownOpen(false);
    }
    function handleTouchOutside(event: TouchEvent) {
      if (isOutsideInputAndDropdown(event.target)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleTouchOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleTouchOutside);
    };
  }, []);

  return (
    <div className="search-page">
      <h2 className="search-page__title">Busca</h2>

      <form className="search-form" onSubmit={handleSubmit} role="search">
        <div className="search-form__wrap" ref={dropdownRef}>
          <input
            ref={inputRef}
            type="search"
            className="search-form__input"
            placeholder="Digite para buscar produtos..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            aria-label="Buscar produtos"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showDropdown}
            role="combobox"
          />
          {showDropdown && (
            <div
              id="search-suggestions"
              className="search-dropdown"
              role="listbox"
              aria-label="Sugestões de busca"
            >
              {suggestionsLoading && <div className="search-dropdown__loading">Carregando…</div>}
              {!suggestionsLoading && suggestions.length === 0 && (
                <div className="search-dropdown__empty">Nenhuma sugestão</div>
              )}
              {!suggestionsLoading &&
                suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="search-dropdown__item"
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSuggestionClick(s.name)}
                  >
                    <span className="search-dropdown__item-name">{s.name}</span>
                    <span className="search-dropdown__item-category">{s.category}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
        <button type="submit" className="search-form__submit">
          Buscar
        </button>
      </form>

      {resultsError && (
        <p className="search-page__error" role="alert">
          {resultsError}
        </p>
      )}

      {submittedQuery && !resultsError && (
        <>
          {resultsLoading && <p className="search-page__loading">Buscando…</p>}
          {!resultsLoading && (
            <>
              <p className="search-page__meta">
                {total === 0
                  ? `Nenhum resultado para "${submittedQuery}"`
                  : `${total} resultado(s) para "${submittedQuery}"`}
              </p>
              {results.length > 0 && (
                <div className="catalog-grid" role="list">
                  {results.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {!submittedQuery && !resultsLoading && (
        <p className="search-page__hint">Digite um termo e pressione Enter ou clique em Buscar.</p>
      )}
    </div>
  );
}
