package com.virtualtryon.Backend.category;

import com.virtualtryon.Backend.user.User;
import com.virtualtryon.Backend.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService categoryService;
    private final UserRepository userRepository;

    public CategoryController(CategoryService categoryService, UserRepository userRepository) {
        this.categoryService = categoryService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Category>> getCategories(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(categoryService.getUserCategories(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@AuthenticationPrincipal UserDetails userDetails,
                                                    @RequestBody Map<String, String> body) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(categoryService.createCategory(user, body.get("name")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> renameCategory(@AuthenticationPrincipal UserDetails userDetails,
                                                    @PathVariable Long id,
                                                    @RequestBody Map<String, String> body) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(categoryService.renameCategory(id, user.getId(), body.get("name")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@AuthenticationPrincipal UserDetails userDetails,
                                                @PathVariable Long id) {
        User user = getCurrentUser(userDetails);
        categoryService.deleteCategory(id, user.getId());
        return ResponseEntity.ok().build();
    }
}
