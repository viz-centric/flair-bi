package com.flair.bi.service;

import com.flair.bi.domain.Functions;
import com.flair.bi.service.dto.FunctionsDTO;

import java.util.List;

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

    void saveAll(List<Functions> functions);

	void deleteAllByRealmId(Long realmId);

	List<Functions> findByRealmId(Long realmId);

	List<Functions> findByRealmIdAsRealmManager(Long realmId);
}
