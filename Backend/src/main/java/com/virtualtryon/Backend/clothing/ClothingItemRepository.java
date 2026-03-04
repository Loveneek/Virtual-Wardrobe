package com.virtualtryon.Backend.clothing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClothingItemRepository extends JpaRepository<ClothingItem, Long> {

    List<ClothingItem> findByUserId(Long userId);

    List<ClothingItem> findByUserIdAndCategoryId(Long userId, Long categoryId);

    Optional<ClothingItem> findByIdAndUserId(Long id, Long userId);

    boolean existsByCategoryId(Long categoryId);
}
