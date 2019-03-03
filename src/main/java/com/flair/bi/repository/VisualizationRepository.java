package com.flair.bi.repository;

import com.flair.bi.domain.Visualization;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for the Visualization entity.
 */
@SuppressWarnings("unused")
public interface VisualizationRepository extends JpaRepository<Visualization, Long> {

}
