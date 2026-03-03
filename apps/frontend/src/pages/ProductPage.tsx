import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { ImageCarousel } from "@/components/ImageCarousel";

function formatPrice(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export default function ProductPage() {
  const { id } = useParams<"id">();
  const numericId = id != null ? Number(id) : null;
  const { product, loading, error } = useProduct(
    numericId != null && !Number.isNaN(numericId) ? numericId : null
  );
  const { addItem } = useCart();
  const [addMessage, setAddMessage] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!product) return;
    const priceNum = parseFloat(product.price);
    if (Number.isNaN(priceNum)) return;
    setAddMessage(null);
    addItem({
      productId: product.id,
      name: product.name,
      price: priceNum,
      quantity: 1,
    })
      .then(() => {
        setAddMessage("Adicionado ao carrinho");
        setTimeout(() => setAddMessage(null), 3000);
      })
      .catch(() => setAddMessage("Erro ao adicionar"));
  };

  if (loading) {
    return (
      <div className="product-page">
        <p className="product-page__loading" aria-live="polite">
          Carregando…
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page">
        <p className="product-page__error" role="alert">
          {error ?? "Produto não encontrado"}
        </p>
        <Link to="/catalog" className="product-page__back">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const priceNum = parseFloat(product.price);
  const priceMonthly = Number.isNaN(priceNum) ? null : priceNum / 12;
  const images = product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="product-page">
      <Link to="/catalog" className="product-page__back">
        ← Voltar ao catálogo
      </Link>

      <article className="product-detail">
        <ImageCarousel images={images} alt={product.name} />

        <div className="product-detail__info">
          <p className="product-detail__category">{product.category}</p>
          <h1 className="product-detail__title">{product.name}</h1>

          <div className="product-detail__prices">
            <p className="product-detail__price">
              R$ {product.price.replace(".", ",")}
              <span className="product-detail__price-label"> (valor à vista)</span>
            </p>
            {priceMonthly !== null && (
              <p className="product-detail__price-monthly">
                Ou R$ {formatPrice(priceMonthly)}/mês
                <span className="product-detail__price-label">
                  {" "}
                  (valor mensal equivalente em 12x)
                </span>
              </p>
            )}
          </div>

          {product.description && (
            <div className="product-detail__description">
              <h2 className="product-detail__section-title">Descrição</h2>
              <p>{product.description}</p>
            </div>
          )}

          {product.stock > 0 && (
            <p className="product-detail__stock">Disponível: {product.stock} un.</p>
          )}

          <div className="product-detail__actions">
            <button
              type="button"
              onClick={handleAddToCart}
              className="product-detail__add-cart"
              disabled={product.stock < 1}
            >
              Adicionar ao carrinho
            </button>
            {addMessage && (
              <p className="product-detail__add-message" role="status">
                {addMessage}
              </p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
