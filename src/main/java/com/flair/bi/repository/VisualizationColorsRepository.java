package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.VisualizationColors;

/**
 * Spring Data JPA repository for the VisualizationColors entity.
 */
@SuppressWarnings("unused")
public interface VisualizationColorsRepository extends JpaRepository<VisualizationColors, Long> {

}
