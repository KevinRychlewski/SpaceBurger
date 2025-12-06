// components/ProductListItem.jsx
import React, { useState } from "react";
import "./ProductListItem.css";

function ProductListItem({ product, addToCart, delay = 0 }) {
  const [open, setOpen] = useState(false);
  const [pontoCarne, setPontoCarne] = useState("");
  const [observacao, setObservacao] = useState("");
  const imgRef = React.useRef(null);

  const showPontoCarne = String(product.category).toUpperCase() === "LANCHES";

  const handleAdd = (e) => {
    // escolhe a melhor imagem fonte: se modal aberto, a imagem grande (.modal-img),
    // caso contrário a imagem do card (imgRef)
    let sourceElem = null;
    if (open) {
      sourceElem = document.querySelector(".modal-img");
    }
    if (!sourceElem) {
      sourceElem = imgRef.current;
    }
    // fallback: elemento clicado (não ideal, mas evita null)
    if (!sourceElem) {
      sourceElem = e?.currentTarget || null;
    }

    const item = {
      ...product,
      ...(showPontoCarne ? { pontoCarne } : {}),
      ...(observacao ? { observacao } : {}),
    };

    // Passa a sourceElem para o addToCart do App (App irá animar via animateFlyToCart)
    if (typeof addToCart === "function") {
      addToCart(item, sourceElem);
    } else {
      // fallback: apenas adiciona sem anim
      addToCart(item);
    }

    // fecha modal e reseta campos
    setOpen(false);
    setPontoCarne("");
    setObservacao("");
  };

  return (
    <>
      <div
        className="list-item"
        onClick={() => setOpen(true)}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="list-left">
          <div className="list-title-row">
            <h3 className="list-name">{product.name}</h3>
            <span className="list-price">
              R$ {Number(product.price).toFixed(2)}
            </span>
          </div>
          <p className="list-desc">{product.description}</p>
        </div>

        <div className="list-right">
          <img
            ref={imgRef}
            className="list-img"
            src={product.imgUrl || product.img || product.image || "https://via.placeholder.com/150x110"}
            alt={product.name}
          />
        </div>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="modal-left">
                <h2>{product.name}</h2>
                <p className="modal-full-desc">{product.description}</p>

                {showPontoCarne && (
                  <>
                    <div className="section-title">Ponto da carne</div>

                    <div className="meat-options">
                      <div
                        className={`meat-card ${pontoCarne === "Mal passada" ? "selected" : ""}`}
                        onClick={() => setPontoCarne("Mal passada")}
                      >
                        <span className="meat-icon">🩸</span>
                        <span className="meat-label">Mal passada</span>
                      </div>

                      <div
                        className={`meat-card ${pontoCarne === "Ao ponto" ? "selected" : ""}`}
                        onClick={() => setPontoCarne("Ao ponto")}
                      >
                        <span className="meat-icon">🍔</span>
                        <span className="meat-label">Ao ponto</span>
                      </div>

                      <div
                        className={`meat-card ${pontoCarne === "Bem passada" ? "selected" : ""}`}
                        onClick={() => setPontoCarne("Bem passada")}
                      >
                        <span className="meat-icon">🔥</span>
                        <span className="meat-label">Bem passada</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="section-title" style={{ marginTop: "18px" }}>
                  Observações
                </div>

                <textarea
                  className="obs-area"
                  placeholder="Ex.: tirar cebola, ponto do pão, molho separado..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />

                <p className="modal-price">
                  Total: R$ {Number(product.price).toFixed(2)}
                </p>

                <div className="modal-actions">
                  <button className="btn-primary" onClick={handleAdd}>
                    Adicionar ao carrinho
                  </button>
                  <button className="btn-outline" onClick={() => setOpen(false)}>
                    Fechar
                  </button>
                </div>
              </div>

              <div className="modal-right">
                <img
                  className="modal-img"
                  src={product.imgUrl || product.img || product.image || "https://via.placeholder.com/420x300"}
                  alt={product.name}
                />
              </div>
            </div>

            <button className="modal-close" onClick={() => setOpen(false)}>
              ✖
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductListItem;
