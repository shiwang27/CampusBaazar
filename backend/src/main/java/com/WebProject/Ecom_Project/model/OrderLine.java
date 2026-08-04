package com.WebProject.Ecom_Project.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderLine {
    private int productId;
    private String productName;
    private BigDecimal unitPrice;
    private int quantity;
    private Long sellerId;
    private String requestStatus;
}
