package com.virtualtryon.Backend.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserId(Long userId);

    int countByUserId(Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);
}
