package com.RychlewskiCode.CardapioDigitalHamburgueria.repository;

import com.RychlewskiCode.CardapioDigitalHamburgueria.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
}
