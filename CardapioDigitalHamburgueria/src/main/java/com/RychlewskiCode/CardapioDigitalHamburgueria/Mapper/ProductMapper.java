package com.RychlewskiCode.CardapioDigitalHamburgueria.Mapper;

import com.RychlewskiCode.CardapioDigitalHamburgueria.DTO.ProductCreateDTO;
import com.RychlewskiCode.CardapioDigitalHamburgueria.DTO.ProductDTO;
import com.RychlewskiCode.CardapioDigitalHamburgueria.entity.ProductEntity;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public  ProductDTO toDTO(ProductEntity entity) {
        ProductDTO dto = new ProductDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        dto.setImgUrl(entity.getImgUrl());
        dto.setCategory(entity.getCategory());
        return dto;
    }

    public  ProductEntity toEntity(ProductCreateDTO dto) {
        ProductEntity entity = new ProductEntity();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setImgUrl(dto.getImgUrl());
        entity.setCategory(dto.getCategory());
        return entity;
    }


}
