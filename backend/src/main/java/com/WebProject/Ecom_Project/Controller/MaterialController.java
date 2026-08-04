package com.WebProject.Ecom_Project.Controller;

import com.WebProject.Ecom_Project.Repository.StudyMaterialRepo;
import com.WebProject.Ecom_Project.model.AppUser;
import com.WebProject.Ecom_Project.model.StudyMaterial;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {
    private final StudyMaterialRepo repo;
    private final ObjectMapper objectMapper;

    public MaterialController(StudyMaterialRepo repo, ObjectMapper objectMapper) {
        this.repo = repo;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public List<StudyMaterial> list(@RequestParam(required = false) String subject,
                                    @RequestParam(required = false) String year,
                                    @RequestParam(required = false) String type) {
        return repo.findAllByOrderByCreatedAtDesc().stream()
                .filter(item -> subject == null || subject.isBlank() || item.getSubject().equalsIgnoreCase(subject))
                .filter(item -> year == null || year.isBlank() || item.getAcademicYear().equalsIgnoreCase(year))
                .filter(item -> type == null || type.isBlank() || item.getMaterialType().equalsIgnoreCase(type))
                .toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public StudyMaterial create(@AuthenticationPrincipal AppUser user,
                                @RequestPart("material") String materialJson,
                                @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        StudyMaterial material = objectMapper.readValue(materialJson, StudyMaterial.class);
        if (material.getTitle() == null || material.getTitle().isBlank() || material.getSubject() == null ||
                material.getSubject().isBlank() || material.getAcademicYear() == null || material.getAcademicYear().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title, subject and year are required");
        }
        if (file != null && !file.isEmpty()) {
            if (!MediaType.APPLICATION_PDF_VALUE.equals(file.getContentType())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF uploads are supported");
            }
            material.setFileName(file.getOriginalFilename());
            material.setFileType(file.getContentType());
            material.setFileData(file.getBytes());
            material.setMaterialType("PDF");
        } else if (material.getResourceUrl() == null || material.getResourceUrl().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add a PDF or resource link");
        }
        material.setId(null);
        material.setOwnerId(user.getId());
        material.setOwnerName(user.getName());
        material.setInstitution(user.getInstitution());
        material.setCreatedAt(Instant.now());
        return repo.save(material);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        StudyMaterial material = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (material.getFileData() == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This material is a link");
        material.setDownloads(material.getDownloads() + 1);
        repo.save(material);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "inline; filename=\"" + material.getFileName() + "\"")
                .body(material.getFileData());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        StudyMaterial material = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!material.getOwnerId().equals(user.getId()) && !"ADMIN".equals(user.effectiveRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        repo.delete(material);
    }
}
