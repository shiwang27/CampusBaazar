package com.WebProject.Ecom_Project.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String description;
    private String brand;
    private BigDecimal price;
    private String category;
    private String itemCondition;
    private String sellerName;
    private String sellerContact;
    private String institution;
    private String location;
    private Long ownerId;
    private String listingStatus;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date releaseDate;
    private boolean available;
    private int stockQuantity;

    private String imageName;
    private String imageType;
    @JsonIgnore
    @Lob
    private byte[] imageData;
}
