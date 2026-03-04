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

    public TryOnResult runTryOn(User user, Long clothingItemId) throws Exception {
        if (user.getProfilePhotoUrl() == null) {
            throw new RuntimeException("Please upload a profile photo first");
        }

        ClothingItem clothingItem = clothingItemRepository.findByIdAndUserId(clothingItemId, user.getId())
                .orElseThrow(() -> new RuntimeException("Clothing item not found"));

        String resultImageUrl = replicateService.runTryOn(
                user.getProfilePhotoUrl(),
                clothingItem.getImageUrl()
        );

        TryOnResult result = new TryOnResult();
        result.setUser(user);
        result.setClothingItem(clothingItem);
        result.setResultImageUrl(resultImageUrl);

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
