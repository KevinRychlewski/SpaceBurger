import React from "react";
import ProductCard from "../components/ProductCard";

function ProductsPage({ products, addToCart }) {
  if (!products || products.length === 0) {
    return <p>Nenhum produto cadastrado.</p>;
  }

  return (
    <div className="products-page">
      <h1>Todos os Produtos</h1>
      <div className="category-products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;
