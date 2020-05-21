package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.Visualization;

/**
 * Spring Data JPA repository for the Visualization entity.
 */
@SuppressWarnings("unused")
public interface VisualizationRepository extends JpaRepository<Visualization, Long> {

}
