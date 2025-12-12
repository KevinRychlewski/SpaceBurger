package com.RychlewskiCode.CardapioDigitalHamburgueria.DTO;

import com.RychlewskiCode.CardapioDigitalHamburgueria.enums.Categoria;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.*;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class ProductCreateDTO {

    @NotBlank(message = "O nome é obrigatório.")
    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O nome deve conter apenas letras.")
    private String name;

    @NotBlank(message = "A descrição é obrigatória.")
    private String description;

    @NotNull(message = "O preço é obrigatório.")
    @Positive(message = "O preço deve ser maior que zero.")
    private Double price;


    @Nullable
    private String imgUrl;

    @NotNull(message = "A categoria é obrigatória.")
    private Categoria category;

}
