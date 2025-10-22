package com.bharathva.feed.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableMongoRepositories(basePackages = "com.bharathva.feed.repository")
public class MongoConfig extends AbstractMongoClientConfiguration {
    
    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);
    
    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;
    
    @Value("${spring.data.mongodb.database}")
    private String databaseName;
    
    @Override
    protected String getDatabaseName() {
        return databaseName;
    }
    
    @Override
    @Bean
    public MongoClient mongoClient() {
        log.info("🔗 Connecting to MongoDB: {}", mongoUri.replaceAll("://[^:]+:[^@]+@", "://***:***@"));
        
        ConnectionString connectionString = new ConnectionString(mongoUri);
        
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .applyToConnectionPoolSettings(builder -> 
                    builder.maxSize(20)
                           .minSize(5)
                           .maxWaitTime(30, TimeUnit.SECONDS)
                           .maxConnectionIdleTime(60, TimeUnit.SECONDS)
                           .maxConnectionLifeTime(300, TimeUnit.SECONDS))
                .applyToSocketSettings(builder -> 
                    builder.connectTimeout(10, TimeUnit.SECONDS)
                           .readTimeout(30, TimeUnit.SECONDS))
                .applyToServerSettings(builder -> 
                    builder.heartbeatFrequency(10, TimeUnit.SECONDS)
                           .minHeartbeatFrequency(500, TimeUnit.MILLISECONDS))
                .build();
        
        MongoClient client = MongoClients.create(settings);
        log.info("✅ MongoDB client created successfully");
        
        return client;
    }
    
    @Bean
    public MongoTemplate mongoTemplate() {
        MongoTemplate template = new MongoTemplate(mongoClient(), getDatabaseName());
        log.info("✅ MongoTemplate created for database: {}", getDatabaseName());
        return template;
    }
}
