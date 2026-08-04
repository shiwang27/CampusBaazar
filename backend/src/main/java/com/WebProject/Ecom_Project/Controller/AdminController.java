package com.WebProject.Ecom_Project.Controller;

import com.WebProject.Ecom_Project.Repository.OrderRepo;
import com.WebProject.Ecom_Project.Repository.ProductRepo;
import com.WebProject.Ecom_Project.Repository.StudyMaterialRepo;
import com.WebProject.Ecom_Project.Repository.UserRepo;
import com.WebProject.Ecom_Project.model.AppUser;
import com.WebProject.Ecom_Project.model.Product;
import com.WebProject.Ecom_Project.model.PurchaseOrder;
import com.WebProject.Ecom_Project.model.StudyMaterial;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepo users;
    private final ProductRepo products;
    private final OrderRepo orders;
    private final StudyMaterialRepo materials;

    public AdminController(UserRepo users, ProductRepo products, OrderRepo orders, StudyMaterialRepo materials) {
        this.users = users; this.products = products; this.orders = orders; this.materials = materials;
    }

    @GetMapping("/summary")
    public Map<String, Long> summary() {
        return Map.of("users", users.count(), "listings", products.count(), "requests", orders.count(), "materials", materials.count());
    }
    @GetMapping("/users") public List<AppUser> users() { return users.findAll(); }
    @GetMapping("/products") public List<Product> products() { return products.findAll(); }
    @GetMapping("/orders") public List<PurchaseOrder> orders() { return orders.findAll(); }
    @GetMapping("/materials") public List<StudyMaterial> materials() { return materials.findAll(); }
    @DeleteMapping("/users/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteUser(@PathVariable Long id) { users.deleteById(id); }
    @DeleteMapping("/products/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteProduct(@PathVariable Integer id) { products.deleteById(id); }
    @DeleteMapping("/orders/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteOrder(@PathVariable Long id) { orders.deleteById(id); }
    @DeleteMapping("/materials/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteMaterial(@PathVariable Long id) { materials.deleteById(id); }
}
