package com.flair.bi.service;

import java.util.List;

import com.flair.bi.service.dto.FunctionsDTO;

/**
 * Service Interface for managing Functions.
 */
public interface FunctionsService {

	/**
	 * Save a functions.
	 *
	 * @param functionsDTO the entity to save
	 * @return the persisted entity
	 */
	FunctionsDTO save(FunctionsDTO functionsDTO);

	/**
	 * Get all the functions.
	 * 
	 * @return the list of entities
	 */
	List<FunctionsDTO> findAll();

	/**
	 * Get the "id" functions.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	FunctionsDTO findOne(Long id);

	/**
	 * Delete the "id" functions.
	 *
	 * @param id the id of the entity
	 */
	void delete(Long id);
}
