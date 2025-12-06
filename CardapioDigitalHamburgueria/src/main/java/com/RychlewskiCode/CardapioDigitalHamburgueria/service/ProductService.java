package com.RychlewskiCode.CardapioDigitalHamburgueria.service;

import com.RychlewskiCode.CardapioDigitalHamburgueria.DTO.ProductCreateDTO;
import com.RychlewskiCode.CardapioDigitalHamburgueria.DTO.ProductDTO;
import com.RychlewskiCode.CardapioDigitalHamburgueria.Mapper.ProductCreateMapper;
import com.RychlewskiCode.CardapioDigitalHamburgueria.Mapper.ProductMapper;
import com.RychlewskiCode.CardapioDigitalHamburgueria.entity.ProductEntity;
import com.RychlewskiCode.CardapioDigitalHamburgueria.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ProductCreateMapper productCreateMapper;

    public ProductService(ProductRepository productRepository, ProductMapper productMapper, ProductCreateMapper productCreateMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.productCreateMapper = productCreateMapper;
    }

    // GET ALL PRODUCTS
    public List<ProductDTO> getAllProducts() {
        List<ProductEntity> productEntities = productRepository.findAll();
        return productEntities.stream()
                .map(productMapper::toDTO)
                .toList();
    }

    // GET PRODUCT BY ID
    public ProductDTO getProductById(Long id) {
        Optional<ProductEntity> product = productRepository.findById(id);
        return product.map(productMapper::toDTO).orElse(null);
    }

    // CREATE PRODUCT
    public ProductDTO createProduct(ProductCreateDTO dto) {
        ProductEntity entity = productCreateMapper.toEntity(dto);
        ProductEntity saved = productRepository.save(entity);
        return productMapper.toDTO(saved);
    }

    // DELETE
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // UPDATE PRODUCT
    public ProductDTO updateProduct(Long id, ProductCreateDTO dto) {
        Optional<ProductEntity> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            ProductEntity updatedProduct = productMapper.toEntity(dto);
            updatedProduct.setId(id);
            ProductEntity savedProduct = productRepository.save(updatedProduct);
            return productMapper.toDTO(savedProduct);
        } else {
            return null;
        }
    }

}
