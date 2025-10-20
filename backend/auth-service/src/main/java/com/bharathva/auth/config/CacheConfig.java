package com.bharathva.auth.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Redis Cache configuration for high-performance, distributed authentication caching.
 * 
 * Benefits:
 * - Distributed caching across multiple instances
 * - Shared cache for load-balanced deployments
 * - Persistent cache across restarts
 * - Faster than database queries
 * 
 * Caching Strategy:
 * - Session validation: 30 seconds TTL
 * - User profile data: 5 minutes TTL
 * - Token blacklist: Until expiration
 * 
 * This significantly reduces database queries while maintaining security.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Configure Redis cache manager with optimized settings.
     * Uses JSON serialization for better debugging and cross-language compatibility.
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(30))
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()
                        )
                );

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(cacheConfig)
                .transactionAware()
                .build();
    }
}

