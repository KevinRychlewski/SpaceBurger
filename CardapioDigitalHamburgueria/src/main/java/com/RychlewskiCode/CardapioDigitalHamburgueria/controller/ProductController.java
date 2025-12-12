package com.RychlewskiCode.CardapioDigitalHamburgueria.controller;

import com.RychlewskiCode.CardapioDigitalHamburgueria.DTO.ProductCreateDTO;
import com.RychlewskiCode.CardapioDigitalHamburgueria.DTO.ProductDTO;
import com.RychlewskiCode.CardapioDigitalHamburgueria.Mapper.ProductCreateMapper;
import com.RychlewskiCode.CardapioDigitalHamburgueria.Mapper.ProductMapper;
import com.RychlewskiCode.CardapioDigitalHamburgueria.entity.ProductEntity;
import com.RychlewskiCode.CardapioDigitalHamburgueria.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private ProductService productService;

    public ProductController(ProductService productService, ProductMapper productMapper, ProductCreateMapper productCreateMapper) {
        this.productService = productService;
    }


    // GET ALL PRODUCTS
    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // GET PRODUCT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        if (productService.getProductById(id) != null) {
            ProductDTO product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Produto com ID: " + id + " não encontrado, informe outro id");
        }
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteById(@PathVariable Long id) {
        if (productService.getProductById(id) != null) {
            productService.deleteProduct(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Produto com ID: " + id + " não encontrado, informe outro id");
        }
    }

    // CREATE
    @PostMapping("/create")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductCreateDTO dto) {
        ProductDTO createdProduct = productService.createProduct(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable Long id, @Valid @RequestBody ProductCreateDTO dto) {
        if (productService.getProductById(id) != null) {
            ProductDTO updatedProduct = productService.updateProduct(id, dto);
            return ResponseEntity.ok(updatedProduct);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
