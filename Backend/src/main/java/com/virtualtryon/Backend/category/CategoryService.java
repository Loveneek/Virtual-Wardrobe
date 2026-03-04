package com.virtualtryon.Backend.category;

import com.virtualtryon.Backend.user.User;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public void createDefaultCategories(User user) {
        List<String> defaults = List.of("Shirts", "T-Shirts", "Pants", "Shoes", "Jackets");
        for (String name : defaults) {
            Category category = new Category();
            category.setUser(user);
            category.setName(name);
            category.setDefault(true);
            categoryRepository.save(category);
        }
    }

    public List<Category> getUserCategories(Long userId) {
        return categoryRepository.findByUserId(userId);
    }

    public Category createCategory(User user, String name) {
        int count = categoryRepository.countByUserId(user.getId());
        if (count >= 15) {
            throw new RuntimeException("Maximum 15 categories allowed");
        }
        Category category = new Category();
        category.setUser(user);
        category.setName(name);
        category.setDefault(false);
        return categoryRepository.save(category);
    }

    public Category renameCategory(Long categoryId, Long userId, String newName) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        category.setName(newName);
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        categoryRepository.delete(category);
    }
}
