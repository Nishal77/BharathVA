# Discovery Service Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /build

# Copy entire project (context is backend/)
COPY . .

# Build only discovery-service and its dependencies
RUN mvn clean install -DskipTests -pl discovery-service -am

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring

# Copy JAR from build stage
COPY --from=build /build/discovery-service/target/*.jar app.jar

# Change ownership
RUN chown spring:spring app.jar
USER spring:spring

# Expose Eureka port
EXPOSE 8761

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8761/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
