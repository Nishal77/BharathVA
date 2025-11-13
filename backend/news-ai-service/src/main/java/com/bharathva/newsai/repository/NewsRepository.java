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

    /**
     * Find news that are ready for display (ready_for_display <= now).
     * Prioritizes news with summaries but includes all ready news.
     * If ready_for_display is NULL, treats as ready (for initial population).
     */
    @Query("SELECT n FROM News n WHERE " +
           "n.imageUrl IS NOT NULL AND n.imageUrl != '' AND " +
           "((n.readyForDisplay IS NOT NULL AND n.readyForDisplay <= :now) OR n.readyForDisplay IS NULL) " +
           "ORDER BY " +
           "  CASE WHEN n.summary IS NOT NULL AND LENGTH(n.summary) >= 600 THEN 0 ELSE 1 END, " +
           "  n.pubDate DESC")
    Page<News> findReadyForDisplayNews(@Param("now") LocalDateTime now, Pageable pageable);

    /**
     * Find top 10 news ready for display.
     * Returns news with ready_for_display set, prioritizing those with summaries.
     * If no ready_for_display news exists, returns any top 10 news.
     */
    @Query(value = "SELECT * FROM news WHERE " +
           "image_url IS NOT NULL AND image_url != '' AND " +
           "(ready_for_display IS NULL OR ready_for_display <= NOW()) " +
           "ORDER BY " +
           "  CASE WHEN summary IS NOT NULL AND LENGTH(summary) >= 600 THEN 0 ELSE 1 END, " +
           "  pub_date DESC " +
           "LIMIT 10", nativeQuery = true)
    List<News> findTop10ReadyForDisplay();
}

