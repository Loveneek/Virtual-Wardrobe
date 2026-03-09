package com.virtualtryon.Backend.tryon;

import com.virtualtryon.Backend.clothing.ClothingItem;
import com.virtualtryon.Backend.clothing.ClothingItemRepository;
import com.virtualtryon.Backend.shared.cloudinary.CloudinaryService;
import com.virtualtryon.Backend.shared.replicate.ReplicateService;
import com.virtualtryon.Backend.user.User;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TryOnService {

    private final TryOnRepository tryOnRepository;
    private final ClothingItemRepository clothingItemRepository;
    private final ReplicateService replicateService;
    private final CloudinaryService cloudinaryService;

    public TryOnService(TryOnRepository tryOnRepository,
            ClothingItemRepository clothingItemRepository,
            ReplicateService replicateService,
            CloudinaryService cloudinaryService) {
        this.tryOnRepository = tryOnRepository;
        this.clothingItemRepository = clothingItemRepository;
        this.replicateService = replicateService;
        this.cloudinaryService = cloudinaryService;
    }

    public TryOnResult runTryOn(User user, List<Long> clothingItemIds) throws Exception {
        if (user.getProfilePhotoUrl() == null) {
            throw new RuntimeException("Please upload a profile photo first");
        }

        if (clothingItemIds == null || clothingItemIds.isEmpty()) {
            throw new RuntimeException("No clothing items selected");
        }

        String currentPersonImage = user.getProfilePhotoUrl();
        ClothingItem firstClothingItem = null;

        for (Long clothingItemId : clothingItemIds) {
            ClothingItem clothingItem = clothingItemRepository.findByIdAndUserId(clothingItemId, user.getId())
                    .orElseThrow(() -> new RuntimeException("Clothing item not found: " + clothingItemId));

            if (firstClothingItem == null) {
                firstClothingItem = clothingItem; // Save the first one to link in DB
            }

            String bodyPart = clothingItem.getBodyPart();
            if (bodyPart == null || bodyPart.isEmpty()) {
                bodyPart = "upper_body";
            }

            // Ensure mapping to what IDM-VTON typically supports ("upper_body",
            // "lower_body", "dresses")
            if (bodyPart.equals("footwear") || bodyPart.equals("other") || bodyPart.equals("full_body")) {
                bodyPart = "upper_body"; // Fallback for unsupported categories by this specific AI model
            }

            // Run Replicate for this specific item
            System.out.println("🤖 Running Try-On for item: " + clothingItem.getName() + " | Category: " + bodyPart);
            currentPersonImage = replicateService.runTryOn(
                    currentPersonImage,
                    clothingItem.getImageUrl(),
                    bodyPart);
        }

        TryOnResult result = new TryOnResult();
        result.setUser(user);
        result.setClothingItem(firstClothingItem); // Tie result to the first item for database schema constraints
        result.setResultImageUrl(currentPersonImage);

        return tryOnRepository.save(result);
    }

    public List<TryOnResult> getUserTryOnResults(Long userId) {
        return tryOnRepository.findByUserId(userId);
    }

    public void deleteTryOnResult(Long id, Long userId) {
        TryOnResult result = tryOnRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Try-on result not found"));
        if (!result.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        tryOnRepository.delete(result);
    }
}
