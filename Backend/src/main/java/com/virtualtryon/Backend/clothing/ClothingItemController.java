package com.virtualtryon.Backend.clothing;

import com.virtualtryon.Backend.shared.gemini.GeminiService;
import com.virtualtryon.Backend.user.User;
import com.virtualtryon.Backend.user.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clothing")
@CrossOrigin(origins = "*")
public class ClothingItemController {

    private final ClothingItemService clothingItemService;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    public ClothingItemController(ClothingItemService clothingItemService,
            UserRepository userRepository,
            GeminiService geminiService) {
        this.clothingItemService = clothingItemService;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping(value = "/detect-category", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> detectCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("image") MultipartFile image) throws IOException {
        String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
        Map<String, String> detectionResult = geminiService.detectCategory(image.getBytes(), mimeType);
        return ResponseEntity.ok(detectionResult);
    }

    @GetMapping
    public ResponseEntity<List<ClothingItem>> getClothing(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long categoryId) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(clothingItemService.getUserClothing(user.getId(), categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClothingItem> getClothingItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(clothingItemService.getClothingItem(id, user.getId()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClothingItem> uploadClothing(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long categoryId,
            @RequestParam String name,
            @RequestParam(required = false) String bodyPart,
            @RequestPart("image") MultipartFile image) throws IOException {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(
                clothingItemService.uploadClothingItem(user, categoryId, name, bodyPart, image));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClothingItem> updateClothing(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String bodyPart) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(
                clothingItemService.updateClothingItem(id, user.getId(), categoryId, name, bodyPart));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClothing(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) throws IOException {
        User user = getCurrentUser(userDetails);
        clothingItemService.deleteClothingItem(id, user.getId());
        return ResponseEntity.ok().build();
    }
}
