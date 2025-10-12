# Auth Service Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /build

# Copy entire project (context is backend/)
COPY . .

# Build only auth-service and its dependencies
RUN mvn clean install -DskipTests -pl auth-service -am

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring

# Copy JAR from build stage
COPY --from=build /build/auth-service/target/*.jar app.jar

# Change ownership
RUN chown spring:spring app.jar
USER spring:spring

# Expose Auth Service port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://localhost:8081/auth/register/health || exit 1

# Environment variables (can be overridden)
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
