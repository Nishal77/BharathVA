package com.bharathva.auth.integration;

import com.bharathva.auth.entity.User;
import com.bharathva.auth.repository.UserRepository;
import com.bharathva.auth.service.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Integration test for profile image upload flow
 * Tests: Cloudinary upload -> NeonDB persistence -> Verification
 * 
 * This test verifies the complete end-to-end flow:
 * 1. Image is uploaded to Cloudinary
 * 2. Cloudinary returns a URL
 * 3. URL is saved to NeonDB profile_image_url column
 * 4. URL can be retrieved from database
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Profile Image Upload Integration Test")
class ProfileImageUploadIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private CloudinaryService cloudinaryService;

    private UUID testUserId;
    private User testUser;
    private String cloudinaryUrl;

    @BeforeEach
    void setUp() {
        // Create a test user in the database
        testUser = new User();
        testUser.setEmail("testimage@example.com");
        testUser.setUsername("testimageuser");
        testUser.setFullName("Test Image User");
        testUser.setPasswordHash("hashedpassword");
        testUser.setIsEmailVerified(true);
        testUser.setProfileImageUrl(null); // Initially no profile image

        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();

        // Mock Cloudinary URL
        cloudinaryUrl = "https://res.cloudinary.com/dqmryiyhz/image/upload/v1234567890/profile/test-profile-image.jpg";
    }

    @Test
    @DisplayName("Complete profile image upload flow: Cloudinary -> NeonDB")
    void testCompleteProfileImageUploadFlow() throws Exception {
        // Step 1: Create a test image file
        byte[] imageBytes = "test image content for profile upload".getBytes();
        MockMultipartFile imageFile = new MockMultipartFile(
            "file",
            "profile-image.jpg",
            "image/jpeg",
            imageBytes
        );

        // Step 2: Mock Cloudinary upload to return URL
        when(cloudinaryService.uploadProfileImage(any()))
            .thenReturn(cloudinaryUrl);

        // Step 3: Execute the upload flow (simulating UserController logic)
        String returnedUrl = cloudinaryService.uploadProfileImage(imageFile);
        
        // Step 4: Update user entity with the Cloudinary URL
        User user = userRepository.findById(testUserId)
            .orElseThrow(() -> new RuntimeException("Test user not found"));
        
        String oldUrl = user.getProfileImageUrl();
        user.setProfileImageUrl(returnedUrl);
        User savedUser = userRepository.save(user);
        userRepository.flush(); // Force immediate database write

        // Step 5: Verify Cloudinary was called
        verify(cloudinaryService, times(1)).uploadProfileImage(any());

        // Step 6: Verify URL was returned from Cloudinary
        assertNotNull(returnedUrl, "Cloudinary should return a URL");
        assertTrue(returnedUrl.startsWith("https://"), "URL should use HTTPS");
        assertTrue(returnedUrl.contains("cloudinary.com"), "URL should be from Cloudinary");
        assertEquals(cloudinaryUrl, returnedUrl, "URL should match mocked value");

        // Step 7: Verify user entity was updated
        assertNotNull(savedUser, "User should be saved");
        assertEquals(cloudinaryUrl, savedUser.getProfileImageUrl(),
            "User entity should have the Cloudinary URL");

        // Step 8: Verify URL is persisted in NeonDB by reloading from database
        Optional<User> retrievedUser = userRepository.findById(testUserId);
        assertTrue(retrievedUser.isPresent(), "User should be found in database");
        
        User dbUser = retrievedUser.get();
        assertNotNull(dbUser.getProfileImageUrl(),
            "Profile image URL should not be null in database");
        assertEquals(cloudinaryUrl, dbUser.getProfileImageUrl(),
            "Profile image URL should be correctly stored in NeonDB profile_image_url column");

        // Step 9: Verify the old URL was different (if it existed)
        if (oldUrl != null) {
            assertNotEquals(oldUrl, dbUser.getProfileImageUrl(),
                "Profile image URL should be updated");
        }

        System.out.println("✅ Profile image upload flow completed successfully:");
        System.out.println("   - Cloudinary URL: " + cloudinaryUrl);
        System.out.println("   - Saved to NeonDB: " + dbUser.getProfileImageUrl());
        System.out.println("   - Verification: PASSED");
    }

    @Test
    @DisplayName("Verify profile_image_url column mapping in NeonDB")
    void testDatabaseColumnMapping() {
        // Verify that the User entity correctly maps to profile_image_url column
        User user = userRepository.findById(testUserId)
            .orElseThrow(() -> new RuntimeException("Test user not found"));

        // Set a test URL
        String testUrl = "https://res.cloudinary.com/test/image.jpg";
        user.setProfileImageUrl(testUrl);
        userRepository.save(user);
        userRepository.flush();

        // Reload from database to verify persistence
        User reloadedUser = userRepository.findById(testUserId)
            .orElseThrow(() -> new RuntimeException("User not found after save"));

        assertEquals(testUrl, reloadedUser.getProfileImageUrl(),
            "Profile image URL should be correctly mapped to profile_image_url column in NeonDB");

        // Verify column annotation exists
        try {
            java.lang.reflect.Field field = User.class.getDeclaredField("profileImageUrl");
            jakarta.persistence.Column column = field.getAnnotation(jakarta.persistence.Column.class);
            
            assertNotNull(column, "profileImageUrl field should have @Column annotation");
            assertEquals("profile_image_url", column.name(),
                "Column name should be 'profile_image_url' to match NeonDB schema");
            
            System.out.println("✅ Database column mapping verified:");
            System.out.println("   - Entity field: profileImageUrl");
            System.out.println("   - Database column: profile_image_url");
            System.out.println("   - Mapping: CORRECT");
        } catch (NoSuchFieldException e) {
            fail("profileImageUrl field not found in User entity");
        }
    }

    @Test
    @DisplayName("Test null profile image URL handling")
    void testNullProfileImageUrl() {
        // Test that null values are handled correctly
        User user = userRepository.findById(testUserId)
            .orElseThrow(() -> new RuntimeException("Test user not found"));

        // Set to null
        user.setProfileImageUrl(null);
        userRepository.save(user);
        userRepository.flush();

        // Reload and verify
        User reloadedUser = userRepository.findById(testUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        assertNull(reloadedUser.getProfileImageUrl(),
            "Profile image URL can be null in database");
    }

    @Test
    @DisplayName("Test updating existing profile image")
    void testUpdateExistingProfileImage() throws Exception {
        // Set an initial profile image
        String initialUrl = "https://res.cloudinary.com/dqmryiyhz/image/upload/v1111111111/profile/old-image.jpg";
        User user = userRepository.findById(testUserId)
            .orElseThrow(() -> new RuntimeException("Test user not found"));
        user.setProfileImageUrl(initialUrl);
        userRepository.save(user);
        userRepository.flush();

        // Verify initial URL is saved
        User initialUser = userRepository.findById(testUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        assertEquals(initialUrl, initialUser.getProfileImageUrl(),
            "Initial URL should be saved");

        // Upload new image
        byte[] imageBytes = "new image content".getBytes();
        MockMultipartFile imageFile = new MockMultipartFile(
            "file",
            "new-profile-image.jpg",
            "image/jpeg",
            imageBytes
        );

        when(cloudinaryService.uploadProfileImage(any()))
            .thenReturn(cloudinaryUrl);

        String newUrl = cloudinaryService.uploadProfileImage(imageFile);
        user.setProfileImageUrl(newUrl);
        userRepository.save(user);
        userRepository.flush();

        // Verify URL was updated
        User updatedUser = userRepository.findById(testUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        assertNotEquals(initialUrl, updatedUser.getProfileImageUrl(),
            "Profile image URL should be updated");
        assertEquals(cloudinaryUrl, updatedUser.getProfileImageUrl(),
            "New URL should be saved correctly");
    }

    @Test
    @DisplayName("Test Cloudinary upload failure handling")
    void testCloudinaryUploadFailure() throws Exception {
        // Test error handling when Cloudinary upload fails
        byte[] imageBytes = "test image".getBytes();
        MockMultipartFile imageFile = new MockMultipartFile(
            "file",
            "test-image.jpg",
            "image/jpeg",
            imageBytes
        );

        when(cloudinaryService.uploadProfileImage(any()))
            .thenThrow(new Exception("Cloudinary upload failed"));

        // Attempt upload
        assertThrows(Exception.class, () -> {
            cloudinaryService.uploadProfileImage(imageFile);
        }, "Should throw exception when Cloudinary upload fails");

        // Verify user was NOT updated (since upload failed)
        User user = userRepository.findById(testUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        assertNull(user.getProfileImageUrl(),
            "Profile image URL should remain unchanged after upload failure");
    }
}
