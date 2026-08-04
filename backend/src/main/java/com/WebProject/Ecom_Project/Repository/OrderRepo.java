package com.WebProject.Ecom_Project.Repository;

import com.WebProject.Ecom_Project.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepo extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    @Query("select distinct o from PurchaseOrder o join o.lines l where l.sellerId = :sellerId order by o.createdAt desc")
    List<PurchaseOrder> findSalesFor(@Param("sellerId") Long sellerId);
}
