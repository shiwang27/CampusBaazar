package com.WebProject.Ecom_Project.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Data
@NoArgsConstructor
public class StudyMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String subject;
    private String academicYear;
    private String materialType;
    private String resourceUrl;
    private String fileName;
    private String fileType;
    @JsonIgnore
    @Lob
    private byte[] fileData;
    private Long ownerId;
    private String ownerName;
    private String institution;
    private Instant createdAt;
    private int downloads;
}
