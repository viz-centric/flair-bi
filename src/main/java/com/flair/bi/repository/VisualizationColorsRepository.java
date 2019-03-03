package com.flair.bi.repository;

import com.flair.bi.domain.VisualizationColors;

import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the VisualizationColors entity.
 */
@SuppressWarnings("unused")
public interface VisualizationColorsRepository extends JpaRepository<VisualizationColors,Long> {

}
