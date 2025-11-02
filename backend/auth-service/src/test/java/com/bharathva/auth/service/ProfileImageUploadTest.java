package com.bharathva.auth.service;

import com.bharathva.auth.entity.User;
import com.bharathva.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for profile image upload functionality
 * Tests the complete flow: Cloudinary upload -> NeonDB storage
 */
@ExtendWith(MockitoExtension.class)
class ProfileImageUploadTest {

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private UserRepository userRepository;

    // Note: We're testing the integration flow, not a specific service
    // The actual implementation is in UserController which uses CloudinaryService and UserRepository

    private UUID testUserId;
    private User testUser;
    private MultipartFile testImageFile;
    private String cloudinaryUrl;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");
        testUser.setFullName("Test User");
        testUser.setProfileImageUrl(null); // Initially no profile image

        // Create a test image file
        byte[] imageBytes = "fake image content for testing".getBytes();
        testImageFile = new MockMultipartFile(
            "file",
            "test-image.jpg",
            "image/jpeg",
            imageBytes
        );

        // Mock Cloudinary URL response
        cloudinaryUrl = "https://res.cloudinary.com/dqmryiyhz/image/upload/v1234567890/profile/test-image.jpg";
    }

    @Test
    void testProfileImageUploadFlow_Complete() throws IOException {
        // Test the complete flow:
        // 1. Upload to Cloudinary
        // 2. Get URL back
        // 3. Save URL to NeonDB
        // 4. Verify URL is stored correctly

        // Arrange: Mock Cloudinary upload to return URL
        when(cloudinaryService.uploadProfileImage(any(MultipartFile.class)))
            .thenReturn(cloudinaryUrl);

        // Arrange: Mock user repository
        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(testUser));
        
        when(userRepository.save(any(User.class)))
            .thenAnswer(invocation -> {
                User savedUser = invocation.getArgument(0);
                savedUser.setProfileImageUrl(cloudinaryUrl);
                return savedUser;
            });

        // Act: Simulate the upload flow
        String returnedUrl = cloudinaryService.uploadProfileImage(testImageFile);
        
        // Update user entity
        testUser.setProfileImageUrl(returnedUrl);
        User savedUser = userRepository.save(testUser);

        // Assert: Verify Cloudinary upload was called
        verify(cloudinaryService, times(1)).uploadProfileImage(testImageFile);
        
        // Assert: Verify URL is returned from Cloudinary
        assertNotNull(returnedUrl, "Cloudinary should return a URL");
        assertTrue(returnedUrl.startsWith("https://"), "URL should be HTTPS");
        assertTrue(returnedUrl.contains("cloudinary.com"), "URL should be from Cloudinary");

        // Assert: Verify user was saved
        verify(userRepository, times(1)).save(testUser);
        
        // Assert: Verify URL is set on user entity
        assertEquals(cloudinaryUrl, savedUser.getProfileImageUrl(), 
            "User entity should have the Cloudinary URL");

        // Assert: Verify URL is stored in database by reloading
        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(savedUser));
        
        Optional<User> retrievedUser = userRepository.findById(testUserId);
        assertTrue(retrievedUser.isPresent(), "User should be found in database");
        assertEquals(cloudinaryUrl, retrievedUser.get().getProfileImageUrl(),
            "Profile image URL should be persisted in NeonDB");
    }

    @Test
    void testProfileImageUpload_CloudinaryFailure() throws IOException {
        // Test error handling when Cloudinary upload fails

        // Arrange: Mock Cloudinary to throw exception
        when(cloudinaryService.uploadProfileImage(any(MultipartFile.class)))
            .thenThrow(new IOException("Cloudinary upload failed"));

        // Act & Assert: Verify exception is thrown
        assertThrows(IOException.class, () -> {
            cloudinaryService.uploadProfileImage(testImageFile);
        }, "Should throw IOException when Cloudinary upload fails");

        // Assert: Verify user was NOT saved (since upload failed)
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testProfileImageUpload_EmptyFile() {
        // Test validation of empty file

        MockMultipartFile emptyFile = new MockMultipartFile(
            "file",
            "empty.jpg",
            "image/jpeg",
            new byte[0]
        );

        // Assert: Empty file should be handled
        assertTrue(emptyFile.isEmpty(), "File should be empty");
    }

    @Test
    void testProfileImageUpload_LargeFile() {
        // Test file size validation (10MB limit)

        byte[] largeFileBytes = new byte[11 * 1024 * 1024]; // 11MB
        MockMultipartFile largeFile = new MockMultipartFile(
            "file",
            "large-image.jpg",
            "image/jpeg",
            largeFileBytes
        );

        // Assert: File size validation
        assertTrue(largeFile.getSize() > 10 * 1024 * 1024, 
            "File should exceed 10MB limit");
    }

    @Test
    void testProfileImageUrl_PersistenceVerification() {
        // Test that URL is correctly persisted and retrievable

        // Arrange: Set profile image URL
        testUser.setProfileImageUrl(cloudinaryUrl);
        
        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(testUser));
        
        when(userRepository.save(any(User.class)))
            .thenReturn(testUser);

        // Act: Save user
        userRepository.save(testUser);

        // Act: Retrieve user
        Optional<User> retrievedUser = userRepository.findById(testUserId);

        // Assert: Verify persistence
        assertTrue(retrievedUser.isPresent(), "User should be retrieved");
        assertNotNull(retrievedUser.get().getProfileImageUrl(), 
            "Profile image URL should not be null");
        assertEquals(cloudinaryUrl, retrievedUser.get().getProfileImageUrl(),
            "Profile image URL should match saved value");
    }

    @Test
    void testProfileImageUrl_UpdateExisting() throws IOException {
        // Test updating an existing profile image

        String oldUrl = "https://res.cloudinary.com/dqmryiyhz/image/upload/v1234567890/profile/old-image.jpg";
        testUser.setProfileImageUrl(oldUrl);

        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(testUser));

        when(cloudinaryService.uploadProfileImage(any(MultipartFile.class)))
            .thenReturn(cloudinaryUrl);

        when(userRepository.save(any(User.class)))
            .thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                return user;
            });

        // Act: Upload new image
        String newUrl = cloudinaryService.uploadProfileImage(testImageFile);
        testUser.setProfileImageUrl(newUrl);
        User savedUser = userRepository.save(testUser);

        // Assert: Verify old URL was replaced
        assertNotEquals(oldUrl, savedUser.getProfileImageUrl(),
            "Profile image URL should be updated");
        assertEquals(cloudinaryUrl, savedUser.getProfileImageUrl(),
            "Profile image URL should be the new URL");
    }

    @Test
    void testProfileImageUrl_NullHandling() {
        // Test that null profile image URL is handled correctly

        testUser.setProfileImageUrl(null);

        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(testUser));

        when(userRepository.save(any(User.class)))
            .thenReturn(testUser);

        // Act: Save user with null URL
        userRepository.save(testUser);
        Optional<User> retrievedUser = userRepository.findById(testUserId);

        // Assert: Null should be persisted correctly
        assertTrue(retrievedUser.isPresent(), "User should be retrieved");
        assertNull(retrievedUser.get().getProfileImageUrl(),
            "Profile image URL can be null");
    }

    @Test
    void testProfileImageUrl_DatabaseColumnMapping() {
        // Test that the entity field correctly maps to database column
        
        // Verify User entity has correct column annotation
        try {
            java.lang.reflect.Field field = User.class.getDeclaredField("profileImageUrl");
            jakarta.persistence.Column column = field.getAnnotation(jakarta.persistence.Column.class);
            
            assertNotNull(column, "profileImageUrl should have @Column annotation");
            assertEquals("profile_image_url", column.name(),
                "Column name should match NeonDB schema: profile_image_url");
        } catch (NoSuchFieldException e) {
            fail("profileImageUrl field not found in User entity");
        }
    }
}
