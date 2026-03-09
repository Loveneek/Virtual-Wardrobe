package com.virtualtryon.Backend.user;

import com.virtualtryon.Backend.shared.cloudinary.CloudinaryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.virtualtryon.Backend.auth.JwtService;
import java.io.IOException;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final JwtService jwtService;

    public UserController(UserRepository userRepository,
            CloudinaryService cloudinaryService,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
        this.jwtService = jwtService;
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

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean emailChanged = false;
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent()) {
                return ResponseEntity.badRequest().body("Email is already in use.");
            }
            user.setEmail(request.getEmail());
            emailChanged = true;
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }

        userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("user", user);

        if (emailChanged) {
            String newToken = jwtService.generateToken(user.getEmail());
            response.put("token", newToken);
        }

        return ResponseEntity.ok(response);
    }
}
