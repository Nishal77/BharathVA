# Multi-stage build for BharathVA Feed Service
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /build

# Copy parent POM and create a temporary one with only needed modules
COPY pom.xml ./pom-original.xml

# Create a temporary parent POM with only shared and feed-service modules
RUN sed 's/<module>discovery-service<\/module>//g; s/<module>config-service<\/module>//g; s/<module>gateway-service<\/module>//g; s/<module>auth-service<\/module>//g; s/<module>news-ai-service<\/module>//g' pom-original.xml > pom.xml

# Copy shared module
COPY shared/pom.xml ./shared/
COPY shared/src ./shared/src/

# Copy feed-service specific files
COPY feed-service/pom.xml ./feed-service/
COPY feed-service/src ./feed-service/src/

# Build from root
RUN mvn clean install -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /build/feed-service/target/feed-service-1.0.0.jar app.jar

# Create non-root user for security
RUN groupadd -r feeduser && useradd -r -g feeduser feeduser
RUN chown -R feeduser:feeduser /app
USER feeduser

# Expose port
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8082/api/feed/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
