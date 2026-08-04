package com.WebProject.Ecom_Project.Controller;

import com.WebProject.Ecom_Project.Repository.OrderRepo;
import com.WebProject.Ecom_Project.Repository.ProductRepo;
import com.WebProject.Ecom_Project.model.AppUser;
import com.WebProject.Ecom_Project.model.OrderLine;
import com.WebProject.Ecom_Project.model.Product;
import com.WebProject.Ecom_Project.model.PurchaseOrder;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderRepo orderRepo;
    private final ProductRepo productRepo;

    public OrderController(OrderRepo orderRepo, ProductRepo productRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseOrder create(@AuthenticationPrincipal AppUser user, @Valid @RequestBody CheckoutRequest request) {
        List<OrderLine> lines = new ArrayList<>();
        Set<Integer> productIds = new HashSet<>();
        BigDecimal total = BigDecimal.ZERO;
        for (CheckoutItem item : request.items()) {
            if (!productIds.add(item.productId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each listing can only appear once per request");
            }
            Product product = productRepo.findById(item.productId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "A listing is no longer available"));
            if (!product.isAvailable()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, product.getName() + " is no longer available");
            }
            if (item.quantity() > product.getStockQuantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Only " + product.getStockQuantity() + " available for " + product.getName());
            }
            if (product.getOwnerId() != null && product.getOwnerId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You cannot request your own listing");
            }
            lines.add(new OrderLine(product.getId(), product.getName(), product.getPrice(), item.quantity(),
                    product.getOwnerId(), "REQUESTED"));
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
        }

        PurchaseOrder order = new PurchaseOrder(null, user.getId(), user.getName(), user.getEmail(),
                request.phone(), request.fulfillmentMethod(), request.meetingPoint(), request.paymentMethod(),
                total, "REQUESTED", Instant.now(), lines);
        return orderRepo.save(order);
    }

    @GetMapping("/me")
    public List<PurchaseOrder> mine(@AuthenticationPrincipal AppUser user) {
        return orderRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public record CheckoutItem(int productId, @Min(1) int quantity) {}
    public record CheckoutRequest(
            @NotEmpty List<@Valid CheckoutItem> items,
            @NotBlank String phone,
            @NotBlank String fulfillmentMethod,
            @NotBlank String meetingPoint,
            @NotBlank String paymentMethod
    ) {}
}
