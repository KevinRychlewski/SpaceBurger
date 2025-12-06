package com.RychlewskiCode.CardapioDigitalHamburgueria.entity;

import com.RychlewskiCode.CardapioDigitalHamburgueria.enums.Categoria;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "produto")
@RequiredArgsConstructor
@Getter
@Setter
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String imgUrl;

    @Enumerated(EnumType.STRING)
    private Categoria category;
}
