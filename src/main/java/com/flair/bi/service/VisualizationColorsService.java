package com.flair.bi.service;

import java.util.List;

import com.flair.bi.service.dto.VisualizationColorsDTO;

/**
 * Service Interface for managing VisualizationColors.
 */
public interface VisualizationColorsService {

	/**
	 * Save a visualizationColors.
	 *
	 * @param visualizationColorsDTO the entity to save
	 * @return the persisted entity
	 */
	VisualizationColorsDTO save(VisualizationColorsDTO visualizationColorsDTO);

	/**
	 * Get all the visualizationColors.
	 * 
	 * @return the list of entities
	 */
	List<VisualizationColorsDTO> findAll();

	/**
	 * Get the "id" visualizationColors.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	VisualizationColorsDTO findOne(Long id);

	/**
	 * Delete the "id" visualizationColors.
	 *
	 * @param id the id of the entity
	 */
	void delete(Long id);
}
