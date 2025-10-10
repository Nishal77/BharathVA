package com.bharathva.auth.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class LocalDateDeserializer extends JsonDeserializer<LocalDate> {
    
    private static final DateTimeFormatter DD_MM_YYYY = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter YYYY_MM_DD = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    @Override
    public LocalDate deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        JsonNode node = parser.getCodec().readTree(parser);
        String dateString = node.asText();
        
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        // Try DD/MM/YYYY format first (mobile app format)
        try {
            return LocalDate.parse(dateString.trim(), DD_MM_YYYY);
        } catch (DateTimeParseException e1) {
            // Try YYYY-MM-DD format (standard ISO format)
            try {
                return LocalDate.parse(dateString.trim(), YYYY_MM_DD);
            } catch (DateTimeParseException e2) {
                throw new IOException("Unable to parse date: " + dateString + 
                    ". Supported formats: dd/MM/yyyy or yyyy-MM-dd", e2);
            }
        }
    }
}
