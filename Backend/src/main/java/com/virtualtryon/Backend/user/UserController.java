package com.virtualtryon.Backend.user;

import com.virtualtryon.Backend.shared.cloudinary.CloudinaryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public UserController(UserRepository userRepository,
                          CloudinaryService cloudinaryService) {
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping(value = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> uploadProfilePhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("photo") MultipartFile photo) throws IOException {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String photoUrl = cloudinaryService.uploadImage(photo);
        user.setProfilePhotoUrl(photoUrl);
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
}
