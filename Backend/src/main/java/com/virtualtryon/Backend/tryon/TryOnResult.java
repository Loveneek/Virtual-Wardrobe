package com.virtualtryon.Backend.tryon;

import com.virtualtryon.Backend.clothing.ClothingItem;
import com.virtualtryon.Backend.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tryon_results")
public class TryOnResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "clothing_item_id", nullable = false)
    private ClothingItem clothingItem;

    @Column(nullable = false)
    private String resultImageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public ClothingItem getClothingItem() { return clothingItem; }
    public void setClothingItem(ClothingItem clothingItem) { this.clothingItem = clothingItem; }

    public String getResultImageUrl() { return resultImageUrl; }
    public void setResultImageUrl(String resultImageUrl) { this.resultImageUrl = resultImageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
