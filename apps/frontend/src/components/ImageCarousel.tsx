import { useState, useRef } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

const SWIPE_THRESHOLD = 50;

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const hasMultiple = images.length > 1;

  if (images.length === 0) {
    return (
      <div className="product-carousel product-carousel--empty" aria-hidden="true">
        <div className="product-carousel__slide">Sem imagem</div>
      </div>
    );
  }

  const goPrev = () => setCurrent((i) => (i <= 0 ? images.length - 1 : i - 1));
  const goNext = () => setCurrent((i) => (i >= images.length - 1 ? 0 : i + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    if (start == null || !hasMultiple) return;
    const end = e.changedTouches[0].clientX;
    const delta = start - end;
    if (delta > SWIPE_THRESHOLD) goNext();
    else if (delta < -SWIPE_THRESHOLD) goPrev();
    touchStartX.current = null;
  };

  return (
    <div className="product-carousel" role="region" aria-label="Galeria do produto">
      <div
        className="product-carousel__viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="product-carousel__track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="product-carousel__slide" aria-hidden={i !== current}>
              <img
                src={src}
                alt={i === 0 ? alt : `${alt} - imagem ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>
      {hasMultiple && (
        <>
          <button
            type="button"
            className="product-carousel__btn product-carousel__btn--prev"
            onClick={goPrev}
            aria-label="Imagem anterior"
          />
          <button
            type="button"
            className="product-carousel__btn product-carousel__btn--next"
            onClick={goNext}
            aria-label="Próxima imagem"
          />
          <div className="product-carousel__dots" role="tablist" aria-label="Slides">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Imagem ${i + 1}`}
                className="product-carousel__dot"
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
