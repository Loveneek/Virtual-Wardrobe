package com.virtualtryon.Backend.tryon;

import com.virtualtryon.Backend.user.User;
import com.virtualtryon.Backend.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tryon")
@CrossOrigin(origins = "*")
public class TryOnController {

    private final TryOnService tryOnService;
    private final UserRepository userRepository;

    public TryOnController(TryOnService tryOnService, UserRepository userRepository) {
        this.tryOnService = tryOnService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<TryOnResult> runTryOn(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) throws Exception {
        User user = getCurrentUser(userDetails);
        Long clothingItemId = Long.valueOf(body.get("clothingItemId").toString());
        return ResponseEntity.ok(tryOnService.runTryOn(user, clothingItemId));
    }

    @GetMapping
    public ResponseEntity<List<TryOnResult>> getTryOnResults(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(tryOnService.getUserTryOnResults(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTryOnResult(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getCurrentUser(userDetails);
        tryOnService.deleteTryOnResult(id, user.getId());
        return ResponseEntity.ok().build();
    }
}
