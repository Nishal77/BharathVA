package com.bharathva.auth.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadProfileImage(MultipartFile file) throws IOException {
        System.out.println("🚀 [CloudinaryService] Starting profile image upload");
        System.out.println("📄 File details: name=" + file.getOriginalFilename() + ", size=" + file.getSize() + ", contentType=" + file.getContentType());
        
        try {
            // Accept any image file type - Cloudinary supports many formats
            // Use image resource type and let Cloudinary auto-convert formats
            // Build upload options - pass transformation params directly (not nested)
            // Following feed-service pattern for compatibility
            Map<String, Object> uploadOptions = ObjectUtils.asMap(
                    "folder", "profile",
                    "resource_type", "image",
                    "overwrite", true,
                    // Pass transformation parameters directly in upload options
                    // This avoids nested object issues
                    "width", 500,
                    "height", 500,
                    "crop", "fill",
                    "gravity", "auto",
                    "quality", "auto",
                    "fetch_format", "auto"
            );
            
            System.out.println("📦 [CloudinaryService] Upload options: " + uploadOptions);
            System.out.println("🔄 [CloudinaryService] Uploading to Cloudinary...");
            
            // Don't restrict formats - let Cloudinary handle conversion
            // It will accept: jpg, jpeg, png, gif, webp, heic, heif, bmp, svg, etc.
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
            
            System.out.println("✅ [CloudinaryService] Upload successful");
            System.out.println("📋 [CloudinaryService] Upload result keys: " + uploadResult.keySet());
            
            Object secureUrl = uploadResult.get("secure_url");
            Object publicId = uploadResult.get("public_id");
            
            System.out.println("🔗 [CloudinaryService] Secure URL: " + secureUrl);
            System.out.println("🆔 [CloudinaryService] Public ID: " + publicId);
            
            if (secureUrl == null) {
                System.err.println("❌ [CloudinaryService] Cloudinary did not return a secure URL");
                System.err.println("📋 [CloudinaryService] Full upload result: " + uploadResult);
                throw new IOException("Cloudinary did not return a secure URL");
            }
            
            String urlString = secureUrl.toString();
            System.out.println("✅ [CloudinaryService] Returning URL: " + urlString);
            return urlString;
            
        } catch (java.io.IOException e) {
            System.err.println("❌ [CloudinaryService] IOException during upload: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("❌ [CloudinaryService] Exception during upload: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            if (e.getCause() != null) {
                System.err.println("📋 [CloudinaryService] Cause: " + e.getCause().getClass().getName() + " - " + e.getCause().getMessage());
                e.getCause().printStackTrace();
            }
            
            // Provide more helpful error messages
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("Invalid image file")) {
                throw new IOException("Invalid image format. Please upload a valid image file (jpg, png, gif, webp, etc.)", e);
            }
            if (errorMsg != null && errorMsg.contains("Invalid transformation")) {
                throw new IOException("Invalid image transformation. Please try again or contact support.", e);
            }
            throw new IOException("Failed to upload to Cloudinary: " + (errorMsg != null ? errorMsg : e.getClass().getSimpleName()), e);
        }
    }

    /**
     * Delete an image from Cloudinary using its public ID
     * 
     * @param publicId The public ID of the image (e.g., "profile/zoj6zk6zeu7bik43gv7c")
     * @throws IOException if deletion fails
     */
    public void deleteImage(String publicId) throws IOException {
        System.out.println("🗑️  [CloudinaryService] Starting image deletion");
        System.out.println("🆔 [CloudinaryService] Original publicId: " + publicId);
        
        try {
            if (publicId == null || publicId.trim().isEmpty()) {
                System.err.println("❌ [CloudinaryService] Public ID cannot be null or empty");
                throw new IllegalArgumentException("Public ID cannot be null or empty");
            }
            
            // Remove folder prefix if present in publicId
            // Cloudinary API expects just the public ID without folder prefix
            String cleanPublicId = publicId;
            if (cleanPublicId.startsWith("profile/")) {
                cleanPublicId = cleanPublicId.substring("profile/".length());
                System.out.println("📁 [CloudinaryService] Removed folder prefix, clean publicId: " + cleanPublicId);
            }
            
            Map<String, Object> deleteOptions = ObjectUtils.asMap(
                    "resource_type", "image",
                    "invalidate", true // Invalidate CDN cache
            );
            
            System.out.println("📦 [CloudinaryService] Delete options: " + deleteOptions);
            System.out.println("🔄 [CloudinaryService] Calling Cloudinary destroy API...");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> deleteResult = cloudinary.uploader().destroy(cleanPublicId, deleteOptions);
            
            System.out.println("📋 [CloudinaryService] Delete result: " + deleteResult);
            
            Object result = deleteResult.get("result");
            String resultStr = result != null ? result.toString() : null;
            System.out.println("✅ [CloudinaryService] Delete result status: " + resultStr);
            
            if (result == null || !"ok".equals(resultStr.toLowerCase())) {
                Object errorObj = deleteResult.get("error");
                String errorMsg = errorObj != null ? errorObj.toString() : "Unknown error";
                System.err.println("❌ [CloudinaryService] Cloudinary deletion failed: " + errorMsg);
                throw new IOException("Cloudinary deletion failed: " + errorMsg);
            }
            
            System.out.println("✅ [CloudinaryService] Image successfully deleted from Cloudinary");
            
        } catch (IllegalArgumentException e) {
            System.err.println("❌ [CloudinaryService] IllegalArgumentException: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("❌ [CloudinaryService] Exception during deletion: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            if (e.getCause() != null) {
                System.err.println("📋 [CloudinaryService] Cause: " + e.getCause().getClass().getName() + " - " + e.getCause().getMessage());
                e.getCause().printStackTrace();
            }
            throw new IOException("Failed to delete image from Cloudinary: " + e.getMessage(), e);
        }
    }
}


