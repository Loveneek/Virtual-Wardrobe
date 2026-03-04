package com.virtualtryon.Backend.tryon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TryOnRepository extends JpaRepository<TryOnResult, Long> {

    List<TryOnResult> findByUserId(Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);
}
