package com.bharathva.newsai.repository;

import com.bharathva.newsai.model.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    boolean existsByLink(String link);

    @Query(value = "SELECT * FROM news WHERE image_url IS NOT NULL AND image_url != '' ORDER BY pub_date DESC LIMIT 10", nativeQuery = true)
    List<News> findTop10News();

    @Query("SELECT n FROM News n WHERE n.imageUrl IS NOT NULL AND n.imageUrl != '' ORDER BY n.pubDate DESC")
    Page<News> findAllByOrderByPubDateDesc(Pageable pageable);

    @Query("SELECT n FROM News n WHERE n.pubDate >= :since AND n.imageUrl IS NOT NULL AND n.imageUrl != '' ORDER BY n.pubDate DESC")
    Page<News> findRecentNews(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT n FROM News n WHERE n.imageUrl IS NOT NULL AND n.imageUrl != '' ORDER BY n.pubDate DESC")
    Page<News> findTrendingNews(Pageable pageable);

    @Query("SELECT n FROM News n WHERE " +
           "n.imageUrl IS NOT NULL AND n.imageUrl != '' AND " +
           "(:category IS NULL OR LOWER(n.source) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
           "(:source IS NULL OR LOWER(n.source) LIKE LOWER(CONCAT('%', :source, '%'))) AND " +
           "(:search IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(n.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY n.pubDate DESC")
    Page<News> findNewsWithFilters(
            @Param("category") String category,
            @Param("source") String source,
            @Param("search") String search,
            Pageable pageable
    );
}

