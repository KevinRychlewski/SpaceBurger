// src/components/Cart.jsx
import React from "react";
import "./Cart.css";

/**
 * Cart (tabela limpa/quadrada).
 * Props:
 *  - cart: array de itens ({ name, price, imgUrl, pontoCarne, observacao })
 *  - removeFromCart(index)
 *  - onCheckout()  <-- novo: chamada quando o usuário clicar em Finalizar compra
 */
export default function Cart({ cart = [], removeFromCart, onCheckout = null }) {
  const total = cart.reduce((acc, item) => acc + Number(item.price || 0), 0);

  const handleCheckoutClick = () => {
    if (typeof onCheckout === "function") {
      onCheckout();
    } else {
      // fallback: comportamento padrão caso o App não passe a função
      if (cart.length === 0) {
        window.alert("Seu carrinho está vazio.");
        return;
      }
      const ok = window.confirm(
        `Confirmar compra de ${cart.length} item${cart.length !== 1 ? "s" : ""} por R$ ${total.toFixed(
          2
        )}?`
      );
      if (ok) {
        window.alert("Compra finalizada. Obrigado!");
      }
    }
  };

  return (
    <aside className="cart cart-card" data-cart aria-live="polite" role="region" aria-label="Sacola de compras">
      <header className="cart-header">
        <div className="cart-title">Sacola</div>
        <div className="cart-count">{cart.length} item{cart.length !== 1 ? "s" : ""}</div>
      </header>

      <div className="cart-body">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="ce-emoji">🧾</div>
            <div className="ce-text">Sua sacola está vazia</div>
            <div className="ce-sub">Adicione produtos para vê-los aqui</div>
          </div>
        ) : (
          <table className="cart-table" role="table" aria-label="Itens da sacola">
            <thead>
              <tr>
                <th className="col-thumb" scope="col" aria-hidden> </th>
                <th className="col-name" scope="col">Produto</th>
                <th className="col-meta" scope="col">Detalhes</th>
                <th className="col-price" scope="col">Preço</th>
                <th className="col-action" scope="col" aria-hidden> </th>
              </tr>
            </thead>

            <tbody>
              {cart.map((item, i) => (
                <tr key={i} className="cart-row" role="row">
                  <td className="col-thumb">
                    {item.imgUrl ? (
                      <img className="thumb" src={item.imgUrl} alt={item.name} />
                    ) : (
                      <div className="thumb-fallback">{(item.name && item.name.charAt(0)) || "?"}</div>
                    )}
                  </td>

                  <td className="col-name">
                    <div className="name">{item.name}</div>
                  </td>

                  <td className="col-meta">
                    <div className="meta">
                      {item.pontoCarne && <span className="meta-chip">Ponto: {item.pontoCarne}</span>}
                      {item.observacao && <span className="meta-note">{item.observacao}</span>}
                    </div>
                  </td>

                  <td className="col-price">R$ {Number(item.price || 0).toFixed(2)}</td>

                  <td className="col-action">
                    <button className="btn-remove" onClick={() => removeFromCart(i)} aria-label={`Remover ${item.name}`}>
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <footer className="cart-footer">
        <div className="footer-left">
          <div className="footer-label">Total</div>
          <div className="footer-sub">Inclui itens adicionados</div>
        </div>
        <div className="footer-right">
          <div className="total-value">R$ {total.toFixed(2)}</div>

          {/* Botão de checkout */}
          <button
            className="btn-checkout"
            onClick={handleCheckoutClick}
            disabled={cart.length === 0}
            aria-disabled={cart.length === 0}
          >
            Finalizar compra
          </button>
        </div>
      </footer>
    </aside>
  );
}
