package com.WebProject.Ecom_Project.Controller;

import com.WebProject.Ecom_Project.Service.ProductService;
import com.WebProject.Ecom_Project.model.Product;
import com.WebProject.Ecom_Project.model.AppUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts(){
        return new ResponseEntity<>(service.getAllProducts(), HttpStatus.OK );
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProducts(@PathVariable int id){

        Product product = service.getProductById(id);

        if(product!=null)
            return new ResponseEntity<>(product, HttpStatus.OK );
        else
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

    @PostMapping("/product")
    public ResponseEntity<?> addProduct(
            @AuthenticationPrincipal AppUser user,
            @RequestPart("product") Product product,
            @RequestPart("imageFile") MultipartFile imageFile) {
        if (product.getStockQuantity() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }
        try {
            product.setOwnerId(user.getId());
            product.setSellerName(user.getName());
            product.setInstitution(user.getInstitution());
            product.setSellerContact(user.getCollegeEmail() == null ? user.getEmail() : user.getCollegeEmail());
            product.setListingStatus("AVAILABLE");
            product.setAvailable(true);
            Product savedProduct = service.addProduct(product, imageFile);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId){

        Product product = service.getProductById(productId);
        if (product == null || product.getImageData() == null || product.getImageType() == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] imageFile = product.getImageData();

        return ResponseEntity.ok()
                .contentType(MediaType.valueOf(product.getImageType()))
                .body(imageFile);
    }

    @PutMapping("/product/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable int id,
                                                @AuthenticationPrincipal AppUser user,
                                                @RequestPart("product") Product product,
                                                @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        try {
            Product existing = service.getProductById(id);
            requireOwnerOrAdmin(existing, user);
            product.setOwnerId(existing.getOwnerId());
            Product updated = service.updateProduct(id, product, imageFile);
            if (updated != null)
                return new ResponseEntity<>("updated", HttpStatus.OK);
            else
                return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id, @AuthenticationPrincipal AppUser user) {
        Product product = service.getProductById(id);
        if (product != null) {
            requireOwnerOrAdmin(product, user);
            service.deleteProduct(id);
            return new ResponseEntity<>("Deleted", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword){
        System.out.println("searching with " + keyword);
        List<Product> products = service.searchProducts(keyword);
        return new ResponseEntity<>(products, HttpStatus.OK);

    }

    private void requireOwnerOrAdmin(Product product, AppUser user) {
        if (product == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        if (!user.getId().equals(product.getOwnerId()) && !"ADMIN".equals(user.effectiveRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own listing");
        }
    }

}
