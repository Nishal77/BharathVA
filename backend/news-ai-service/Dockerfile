# Multi-stage build for BharathVA News AI Service
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /build

# Copy entire project (context is backend/)
COPY . .

# Build only news-ai-service and its dependencies
RUN mvn clean install -DskipTests -pl news-ai-service -am

# Runtime stage
FROM eclipse-temurin:17-jre

# Install curl and wget for health checks
RUN apt-get update && apt-get install -y curl wget && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /build/news-ai-service/target/*.jar app.jar

# Create non-root user for security
RUN groupadd -r newsuser && useradd -r -g newsuser newsuser
RUN chown -R newsuser:newsuser /app
USER newsuser

# Expose port
EXPOSE 8084

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8084/actuator/health || exit 1

# Environment variables (can be overridden)
ENV JAVA_OPTS="-Xmx512m -Xms256m -Djava.net.preferIPv4Stack=true"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

