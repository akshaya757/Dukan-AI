package com.dukanai.service;

import com.dukanai.dto.request.ProductRequest;
import com.dukanai.dto.response.ProductResponse;
import com.dukanai.entity.Product;
import com.dukanai.entity.User;
import com.dukanai.exception.ProductNotFoundException;
import com.dukanai.repository.ProductRepository;
import com.dukanai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Autowired
    public ProductService(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByUser(Long userId) {
        return productRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> searchProducts(String query) {
        return productRepository.findByUserIdAndNameContainingIgnoreCase(1L, query).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return toResponse(product);
    }

    public ProductResponse createProduct(ProductRequest request) {
        User user = userRepository.findById(request.getUserId() != null ? request.getUserId() : 1L)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Product product = new Product();
        product.setUser(user);
        product.setName(request.getName().trim());
        product.setCategory(request.getCategory());
        product.setUnit(request.getUnit().trim().toLowerCase());
        product.setCurrentStock(request.getCurrentStock());
        product.setMinimumStock(request.getMinimumStock());
        product.setPrice(request.getPrice());

        return toResponse(productRepository.save(product));
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.setName(request.getName().trim());
        product.setCategory(request.getCategory());
        product.setUnit(request.getUnit().trim().toLowerCase());
        product.setCurrentStock(request.getCurrentStock());
        product.setMinimumStock(request.getMinimumStock());
        product.setPrice(request.getPrice());

        return toResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
    }

    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findAllLowStock().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse toResponse(Product product) {
        ProductResponse resp = new ProductResponse();
        resp.setId(product.getId());
        resp.setName(product.getName());
        resp.setCategory(product.getCategory());
        resp.setUnit(product.getUnit());
        resp.setCurrentStock(product.getCurrentStock());
        resp.setMinimumStock(product.getMinimumStock());
        resp.setPrice(product.getPrice());
        resp.setLowStock(product.isLowStock());
        resp.setUserId(product.getUser() != null ? product.getUser().getId() : null);
        resp.setCreatedAt(product.getCreatedAt());
        resp.setUpdatedAt(product.getUpdatedAt());
        return resp;
    }
}
