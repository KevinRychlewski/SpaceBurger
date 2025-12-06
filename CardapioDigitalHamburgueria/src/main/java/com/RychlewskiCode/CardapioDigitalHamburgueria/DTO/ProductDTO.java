package com.RychlewskiCode.CardapioDigitalHamburgueria.DTO;

import com.RychlewskiCode.CardapioDigitalHamburgueria.enums.Categoria;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class ProductDTO {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imgUrl;
    private Categoria category;

}
