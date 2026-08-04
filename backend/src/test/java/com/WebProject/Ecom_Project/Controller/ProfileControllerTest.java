package com.WebProject.Ecom_Project.Controller;

import com.WebProject.Ecom_Project.Repository.OrderRepo;
import com.WebProject.Ecom_Project.Repository.ProductRepo;
import com.WebProject.Ecom_Project.Repository.StudyMaterialRepo;
import com.WebProject.Ecom_Project.Repository.UserRepo;
import com.WebProject.Ecom_Project.model.AppUser;
import com.WebProject.Ecom_Project.model.OrderLine;
import com.WebProject.Ecom_Project.model.Product;
import com.WebProject.Ecom_Project.model.PurchaseOrder;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProfileControllerTest {
    @Test
    void sellerDecisionUpdatesLineAndBuyerOrderStatus() {
        OrderRepo orders = mock(OrderRepo.class);
        ProductRepo products = mock(ProductRepo.class);
        ProfileController controller = new ProfileController(
                mock(UserRepo.class), products, orders, mock(StudyMaterialRepo.class));
        AppUser seller = new AppUser();
        seller.setId(7L);
        OrderLine line = new OrderLine(42, "Calculator", BigDecimal.TEN, 1, 7L, "REQUESTED");
        PurchaseOrder order = order(12L, line);
        when(orders.findById(12L)).thenReturn(Optional.of(order));
        when(orders.save(order)).thenReturn(order);
        when(products.findById(42)).thenReturn(Optional.empty());

        PurchaseOrder updated = controller.updateRequest(
                seller, new ProfileController.RequestStatus(12L, 42, "accepted"));

        assertThat(updated.getLines().getFirst().getRequestStatus()).isEqualTo("ACCEPTED");
        assertThat(updated.getStatus()).isEqualTo("ACCEPTED");
        verify(orders).save(order);
    }

    @Test
    void mixedSellerDecisionsProducePartialOrderStatus() {
        OrderLine accepted = new OrderLine(42, "Calculator", BigDecimal.TEN, 1, 7L, "ACCEPTED");
        OrderLine requested = new OrderLine(43, "Textbook", BigDecimal.TEN, 1, 8L, "REQUESTED");

        assertThat(ProfileController.summarizeStatus(List.of(accepted, requested)))
                .isEqualTo("PARTIALLY_UPDATED");
    }

    @Test
    void completingTheLastAvailableQuantityMarksListingSold() {
        OrderRepo orders = mock(OrderRepo.class);
        ProductRepo products = mock(ProductRepo.class);
        ProfileController controller = new ProfileController(
                mock(UserRepo.class), products, orders, mock(StudyMaterialRepo.class));
        AppUser seller = new AppUser();
        seller.setId(7L);
        OrderLine line = new OrderLine(42, "Calculator", BigDecimal.TEN, 2, 7L, "ACCEPTED");
        PurchaseOrder order = order(13L, line);
        Product product = new Product();
        product.setId(42);
        product.setStockQuantity(2);
        product.setAvailable(true);
        when(orders.findById(13L)).thenReturn(Optional.of(order));
        when(orders.save(order)).thenReturn(order);
        when(products.findById(42)).thenReturn(Optional.of(product));

        controller.updateRequest(seller, new ProfileController.RequestStatus(13L, 42, "COMPLETED"));

        assertThat(product.getStockQuantity()).isZero();
        assertThat(product.isAvailable()).isFalse();
        assertThat(product.getListingStatus()).isEqualTo("SOLD");
        assertThat(order.getStatus()).isEqualTo("COMPLETED");
        verify(products).save(product);
    }

    private PurchaseOrder order(Long id, OrderLine... lines) {
        return new PurchaseOrder(id, 3L, "Buyer", "buyer@college.edu", "9999999999",
                "Campus pickup", "Library", "Pay in person", BigDecimal.TEN,
                "REQUESTED", Instant.now(), new ArrayList<>(List.of(lines)));
    }
}
