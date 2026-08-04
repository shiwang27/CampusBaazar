package com.WebProject.Ecom_Project.Repository;

import com.WebProject.Ecom_Project.model.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyMaterialRepo extends JpaRepository<StudyMaterial, Long> {
    List<StudyMaterial> findAllByOrderByCreatedAtDesc();
    List<StudyMaterial> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}
