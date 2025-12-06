import React, { useState } from "react";
import "./ProductCard.css";

function ProductCard({ product, addToCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);

  const handleAddToCart = () => {
    setAnimateCart(true);
    setTimeout(() => {
      addToCart(product);
      setIsOpen(false);
      setAnimateCart(false);
    }, 300);
  };

  return (
    <>
      {/* Card do produto */}
      <div className="product-card" onClick={() => setIsOpen(true)}>
        <img src={product.imgUrl} alt={product.name} />
        <h3>{product.name}</h3>
        <p className="card-description">{product.description}</p>
        <p className="price">R$ {product.price.toFixed(2)}</p>
      </div>

      {/* Modal do produto */}
      {isOpen && (
        <div
          className={`modal-overlay ${animateCart ? "animate-cart" : ""}`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={product.imgUrl} alt={product.name} />
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p className="price">R$ {product.price.toFixed(2)}</p>
            <button className="add-to-cart" onClick={handleAddToCart}>
              Adicionar ao carrinho
            </button>
            <button className="close-modal" onClick={() => setIsOpen(false)}>
              ✖
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;
