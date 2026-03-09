package com.virtualtryon.Backend.clothing;

import com.virtualtryon.Backend.category.Category;
import com.virtualtryon.Backend.category.CategoryRepository;
import com.virtualtryon.Backend.shared.cloudinary.CloudinaryService;
import com.virtualtryon.Backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@Service
public class ClothingItemService {

    private final ClothingItemRepository clothingItemRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;

    public ClothingItemService(ClothingItemRepository clothingItemRepository,
            CategoryRepository categoryRepository,
            CloudinaryService cloudinaryService) {
        this.clothingItemRepository = clothingItemRepository;
        this.categoryRepository = categoryRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public List<ClothingItem> getUserClothing(Long userId, Long categoryId) {
        if (categoryId != null) {
            return clothingItemRepository.findByUserIdAndCategoryId(userId, categoryId);
        }
        return clothingItemRepository.findByUserId(userId);
    }

    public ClothingItem getClothingItem(Long id, Long userId) {
        return clothingItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Clothing item not found"));
    }

    public ClothingItem uploadClothingItem(User user, Long categoryId,
            String name, String bodyPart, MultipartFile image) throws IOException {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        String imageUrl = cloudinaryService.uploadImage(image);

        ClothingItem item = new ClothingItem();
        item.setUser(user);
        item.setCategory(category);
        item.setName(name);
        item.setImageUrl(imageUrl);

        if (bodyPart == null || bodyPart.trim().isEmpty()) {
            bodyPart = "upper_body"; // fallback
        }
        item.setBodyPart(bodyPart);

        return clothingItemRepository.save(item);
    }

    public ClothingItem updateClothingItem(Long id, Long userId,
            Long categoryId, String name, String bodyPart) {
        ClothingItem item = clothingItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Clothing item not found"));

        if (name != null)
            item.setName(name);
        if (bodyPart != null)
            item.setBodyPart(bodyPart);

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            item.setCategory(category);
        }

        return clothingItemRepository.save(item);
    }

    public void deleteClothingItem(Long id, Long userId) throws IOException {
        ClothingItem item = clothingItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Clothing item not found"));
        cloudinaryService.deleteImage(item.getImageUrl());
        clothingItemRepository.delete(item);
    }
}
