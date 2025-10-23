package com.bharathva.feed.service;

import com.bharathva.feed.model.ImageMetadata;
import com.bharathva.feed.repository.ImageMetadataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for FileStorageService
 */
@ExtendWith(MockitoExtension.class)
class FileStorageServiceTest {

    @Mock
    private ImageMetadataRepository imageMetadataRepository;

    @InjectMocks
    private FileStorageService fileStorageService;

    private final String testUserId = "test-user-123";
    private final String testUploadDir = "test-uploads";

    @BeforeEach
    void setUp() {
        // Set test properties
        ReflectionTestUtils.setField(fileStorageService, "uploadDir", testUploadDir);
        ReflectionTestUtils.setField(fileStorageService, "maxFileSize", 10485760L); // 10MB
        ReflectionTestUtils.setField(fileStorageService, "allowedTypes", "image/jpeg,image/png,image/gif,image/webp");
    }

    @Test
    void testStoreFile_Success() throws IOException {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        ImageMetadata expectedMetadata = new ImageMetadata();
        expectedMetadata.setId("test-image-id");
        expectedMetadata.setUserId(testUserId);
        expectedMetadata.setOriginalFileName("test-image.jpg");
        expectedMetadata.setStoredFileName("stored-filename.jpg");
        expectedMetadata.setFilePath(testUploadDir + "/stored-filename.jpg");
        expectedMetadata.setFileSize(file.getSize());
        expectedMetadata.setMimeType("image/jpeg");

        when(imageMetadataRepository.save(any(ImageMetadata.class))).thenReturn(expectedMetadata);

        // Act
        ImageMetadata result = fileStorageService.storeFile(file, testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(testUserId, result.getUserId());
        assertEquals("test-image.jpg", result.getOriginalFileName());
        assertEquals("image/jpeg", result.getMimeType());
        assertEquals(file.getSize(), result.getFileSize());
        
        verify(imageMetadataRepository, times(1)).save(any(ImageMetadata.class));
    }

    @Test
    void testStoreFiles_MultipleFiles_Success() throws IOException {
        // Arrange
        MockMultipartFile file1 = new MockMultipartFile(
                "file1",
                "test-image-1.jpg",
                "image/jpeg",
                "test image content 1".getBytes()
        );

        MockMultipartFile file2 = new MockMultipartFile(
                "file2",
                "test-image-2.jpg",
                "image/jpeg",
                "test image content 2".getBytes()
        );

        MultipartFile[] files = {file1, file2};

        ImageMetadata metadata1 = new ImageMetadata();
        metadata1.setId("test-image-id-1");
        metadata1.setUserId(testUserId);
        metadata1.setOriginalFileName("test-image-1.jpg");

        ImageMetadata metadata2 = new ImageMetadata();
        metadata2.setId("test-image-id-2");
        metadata2.setUserId(testUserId);
        metadata2.setOriginalFileName("test-image-2.jpg");

        when(imageMetadataRepository.save(any(ImageMetadata.class)))
                .thenReturn(metadata1)
                .thenReturn(metadata2);

        // Act
        List<ImageMetadata> result = fileStorageService.storeFiles(files, testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("test-image-1.jpg", result.get(0).getOriginalFileName());
        assertEquals("test-image-2.jpg", result.get(1).getOriginalFileName());
        
        verify(imageMetadataRepository, times(2)).save(any(ImageMetadata.class));
    }

    @Test
    void testGetImageMetadata_Success() {
        // Arrange
        String imageId = "test-image-id";
        ImageMetadata expectedMetadata = new ImageMetadata();
        expectedMetadata.setId(imageId);
        expectedMetadata.setUserId(testUserId);
        expectedMetadata.setOriginalFileName("test-image.jpg");

        when(imageMetadataRepository.findById(imageId)).thenReturn(Optional.of(expectedMetadata));

        // Act
        ImageMetadata result = fileStorageService.getImageMetadata(imageId);

        // Assert
        assertNotNull(result);
        assertEquals(imageId, result.getId());
        assertEquals(testUserId, result.getUserId());
        assertEquals("test-image.jpg", result.getOriginalFileName());
        
        verify(imageMetadataRepository, times(1)).findById(imageId);
    }

    @Test
    void testGetImageMetadata_NotFound() {
        // Arrange
        String imageId = "non-existent-id";
        when(imageMetadataRepository.findById(imageId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            fileStorageService.getImageMetadata(imageId);
        });

        verify(imageMetadataRepository, times(1)).findById(imageId);
    }

    @Test
    void testDeleteImage_Success() throws IOException {
        // Arrange
        String imageId = "test-image-id";
        ImageMetadata metadata = new ImageMetadata();
        metadata.setId(imageId);
        metadata.setUserId(testUserId);
        metadata.setFilePath(testUploadDir + "/test-file.jpg");

        when(imageMetadataRepository.findById(imageId)).thenReturn(Optional.of(metadata));

        // Create a test file
        Path testFile = Paths.get(testUploadDir, "test-file.jpg");
        Files.createDirectories(testFile.getParent());
        Files.write(testFile, "test content".getBytes());

        // Act
        fileStorageService.deleteImage(imageId, testUserId);

        // Assert
        verify(imageMetadataRepository, times(1)).findById(imageId);
        verify(imageMetadataRepository, times(1)).delete(metadata);
        
        // Clean up
        Files.deleteIfExists(testFile);
        Files.deleteIfExists(testFile.getParent());
    }

    @Test
    void testDeleteImage_UnauthorizedUser() {
        // Arrange
        String imageId = "test-image-id";
        String differentUserId = "different-user";
        ImageMetadata metadata = new ImageMetadata();
        metadata.setId(imageId);
        metadata.setUserId(testUserId);

        when(imageMetadataRepository.findById(imageId)).thenReturn(Optional.of(metadata));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            fileStorageService.deleteImage(imageId, differentUserId);
        });

        verify(imageMetadataRepository, times(1)).findById(imageId);
        verify(imageMetadataRepository, never()).delete(any(ImageMetadata.class));
    }

    @Test
    void testGetUserImages_Success() {
        // Arrange
        ImageMetadata metadata1 = new ImageMetadata();
        metadata1.setId("image-1");
        metadata1.setUserId(testUserId);

        ImageMetadata metadata2 = new ImageMetadata();
        metadata2.setId("image-2");
        metadata2.setUserId(testUserId);

        List<ImageMetadata> expectedImages = Arrays.asList(metadata1, metadata2);

        when(imageMetadataRepository.findImageFilesByUserId(testUserId)).thenReturn(expectedImages);

        // Act
        List<ImageMetadata> result = fileStorageService.getUserImages(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("image-1", result.get(0).getId());
        assertEquals("image-2", result.get(1).getId());
        
        verify(imageMetadataRepository, times(1)).findImageFilesByUserId(testUserId);
    }

    @Test
    void testStoreFile_EmptyFile() {
        // Arrange
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            fileStorageService.storeFile(emptyFile, testUserId);
        });

        verify(imageMetadataRepository, never()).save(any(ImageMetadata.class));
    }

    @Test
    void testStoreFile_InvalidContentType() {
        // Arrange
        MockMultipartFile invalidFile = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "test content".getBytes()
        );

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            fileStorageService.storeFile(invalidFile, testUserId);
        });

        verify(imageMetadataRepository, never()).save(any(ImageMetadata.class));
    }

    @Test
    void testStoreFile_FileTooLarge() {
        // Arrange
        byte[] largeContent = new byte[10485761]; // 10MB + 1 byte
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.jpg",
                "image/jpeg",
                largeContent
        );

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            fileStorageService.storeFile(largeFile, testUserId);
        });

        verify(imageMetadataRepository, never()).save(any(ImageMetadata.class));
    }
}
