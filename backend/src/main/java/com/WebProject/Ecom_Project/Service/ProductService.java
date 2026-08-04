package com.WebProject.Ecom_Project.Service;

import com.WebProject.Ecom_Project.Repository.ProductRepo;
import com.WebProject.Ecom_Project.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    public List<Product>  getAllProducts() {
        return repo.findAll();
    }

    public Product getProductById(int id) {
        return repo.findById(id).orElse(null);
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImageData(imageFile.getBytes());
        return repo.save(product);
    }

    public Product updateProduct(int id, Product product, MultipartFile imageFile) throws IOException {
        Product existing = getProductById(id);
        if (existing == null) {
            return null;
        }

        product.setId(id);
        product.setOwnerId(existing.getOwnerId());
        product.setListingStatus(existing.getListingStatus());
        product.setSellerName(existing.getSellerName());
        product.setSellerContact(existing.getSellerContact());
        product.setInstitution(existing.getInstitution());
        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageData(imageFile.getBytes());
            product.setImageName(imageFile.getOriginalFilename());
            product.setImageType(imageFile.getContentType());
        } else {
            product.setImageData(existing.getImageData());
            product.setImageName(existing.getImageName());
            product.setImageType(existing.getImageType());
        }
        return repo.save(product);
    }

    public void deleteProduct(int id) {
        repo.deleteById(id);
    }


    public List<Product> searchProducts(String keyword) {
        return repo.searchProducts(keyword);
    }
}
