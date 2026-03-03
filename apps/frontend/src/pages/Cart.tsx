import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

function formatPrice(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export default function Cart() {
  const { cart, loading, error, updateQuantity, removeItem } = useCart();

  if (loading) {
    return (
      <div className="cart-page">
        <p className="cart-page__loading" aria-live="polite">
          Carregando carrinho…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <p className="cart-page__error" role="alert">
          {error}
        </p>
        <Link to="/catalog" className="cart-page__back">
          Ir ao catálogo
        </Link>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  const total = items.reduce((acc, item) => {
    const price = parseFloat(item.price);
    return acc + (Number.isNaN(price) ? 0 : price * item.quantity);
  }, 0);

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Carrinho</h1>

      {isEmpty ? (
        <div className="cart-page__empty">
          <p>Seu carrinho está vazio.</p>
          <Link to="/catalog" className="cart-page__link">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <>
          <ul className="cart-list" aria-label="Itens do carrinho">
            {items.map((item) => {
              const priceNum = parseFloat(item.price);
              const subtotal = Number.isNaN(priceNum) ? 0 : priceNum * item.quantity;
              return (
                <li key={item.id} className="cart-item">
                  {item.imageUrl && (
                    <div className="cart-item__image-wrap">
                      <Link to={`/produto/${item.productId}`} aria-hidden="true" tabIndex={-1}>
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="cart-item__image"
                          loading="lazy"
                        />
                      </Link>
                    </div>
                  )}
                  <div className="cart-item__info">
                    <Link to={`/produto/${item.productId}`} className="cart-item__name">
                      {item.name}
                    </Link>
                    <p className="cart-item__price">
                      R$ {item.price.replace(".", ",")} × {item.quantity} = R${" "}
                      {formatPrice(subtotal)}
                    </p>
                  </div>
                  <div className="cart-item__actions">
                    <label className="cart-item__qty-label">
                      <span className="visually-hidden">Quantidade para {item.name}</span>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const v = Math.max(1, Math.floor(Number(e.target.value) || 1));
                          if (v !== item.quantity) updateQuantity(item.productId, v);
                        }}
                        className="cart-item__qty-input"
                        aria-label={`Quantidade de ${item.name}`}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="cart-item__remove"
                      aria-label={`Remover ${item.name} do carrinho`}
                    >
                      Remover
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="cart-page__total">
            <strong>Total: R$ {formatPrice(total)}</strong>
          </div>
        </>
      )}
    </div>
  );
}
