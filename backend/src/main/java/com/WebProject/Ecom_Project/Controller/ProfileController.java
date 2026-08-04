package com.WebProject.Ecom_Project.Controller;

import com.WebProject.Ecom_Project.Repository.OrderRepo;
import com.WebProject.Ecom_Project.Repository.ProductRepo;
import com.WebProject.Ecom_Project.Repository.StudyMaterialRepo;
import com.WebProject.Ecom_Project.Repository.UserRepo;
import com.WebProject.Ecom_Project.model.AppUser;
import com.WebProject.Ecom_Project.model.OrderLine;
import com.WebProject.Ecom_Project.model.Product;
import com.WebProject.Ecom_Project.model.PurchaseOrder;
import com.WebProject.Ecom_Project.model.StudyMaterial;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final UserRepo users;
    private final ProductRepo products;
    private final OrderRepo orders;
    private final StudyMaterialRepo materials;

    public ProfileController(UserRepo users, ProductRepo products, OrderRepo orders, StudyMaterialRepo materials) {
        this.users = users;
        this.products = products;
        this.orders = orders;
        this.materials = materials;
    }

    @GetMapping
    public AppUser profile(@AuthenticationPrincipal AppUser user) { return user; }

    @PatchMapping
    public AppUser update(@AuthenticationPrincipal AppUser user, @RequestBody Map<String, String> changes) {
        if (changes.containsKey("name") && !changes.get("name").isBlank()) user.setName(changes.get("name").trim());
        if (changes.containsKey("phone")) user.setPhone(changes.get("phone").trim());
        if (changes.containsKey("bio")) user.setBio(changes.get("bio").trim());
        return users.save(user);
    }

    @GetMapping("/listings")
    public List<Product> listings(@AuthenticationPrincipal AppUser user) {
        return products.findByOwnerIdOrderByIdDesc(user.getId());
    }

    @GetMapping("/purchases")
    public List<PurchaseOrder> purchases(@AuthenticationPrincipal AppUser user) {
        return orders.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @GetMapping("/sales")
    public List<PurchaseOrder> sales(@AuthenticationPrincipal AppUser user) { return orders.findSalesFor(user.getId()); }

    @GetMapping("/materials")
    public List<StudyMaterial> materials(@AuthenticationPrincipal AppUser user) {
        return materials.findByOwnerIdOrderByCreatedAtDesc(user.getId());
    }

    @PatchMapping("/sales/status")
    @Transactional
    public PurchaseOrder updateRequest(@AuthenticationPrincipal AppUser user, @RequestBody RequestStatus request) {
        PurchaseOrder order = orders.findById(request.orderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        OrderLine line = order.getLines().stream()
                .filter(item -> item.getProductId() == request.productId() && user.getId().equals(item.getSellerId()))
                .findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN));
        String status = request.status().toUpperCase();
        if (!List.of("ACCEPTED", "DECLINED", "COMPLETED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported request status");
        }
        String previousStatus = line.getRequestStatus();
        if (status.equals("COMPLETED") && !status.equals(previousStatus)) {
            if (!"ACCEPTED".equals(previousStatus)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Accept the request before marking it completed");
            }
            Product product = products.findById(request.productId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
            if (line.getQuantity() > product.getStockQuantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Not enough stock remains to complete this purchase");
            }
            int remaining = product.getStockQuantity() - line.getQuantity();
            product.setStockQuantity(remaining);
            product.setAvailable(remaining > 0);
            product.setListingStatus(remaining == 0 ? "SOLD" : "AVAILABLE");
            products.save(product);
        }
        line.setRequestStatus(status);
        order.setStatus(summarizeStatus(order.getLines()));
        return orders.save(order);
    }

    static String summarizeStatus(List<OrderLine> lines) {
        List<String> statuses = lines.stream()
                .map(OrderLine::getRequestStatus)
                .filter(Objects::nonNull)
                .map(String::toUpperCase)
                .distinct()
                .toList();
        if (statuses.isEmpty()) return "REQUESTED";
        return statuses.size() == 1 ? statuses.getFirst() : "PARTIALLY_UPDATED";
    }

    public record RequestStatus(Long orderId, int productId, String status) {}
}
