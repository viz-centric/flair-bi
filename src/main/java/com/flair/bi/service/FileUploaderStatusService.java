package com.flair.bi.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.flair.bi.service.dto.FileUploaderStatusDTO;

/**
 * Service Interface for managing FileUploaderStatus.
 */
public interface FileUploaderStatusService {

	/**
	 * Save a fileUploaderStatus.
	 *
	 * @param fileUploaderStatusDTO the entity to save
	 * @return the persisted entity
	 */
	FileUploaderStatusDTO save(FileUploaderStatusDTO fileUploaderStatusDTO);

	/**
	 * Get all the fileUploaderStatuses.
	 * 
	 * @param pageable the pagination information
	 * @return the list of entities
	 */
	Page<FileUploaderStatusDTO> findAll(Pageable pageable);

	/**
	 * Get the "id" fileUploaderStatus.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	FileUploaderStatusDTO findOne(Long id);

	/**
	 * Delete the "id" fileUploaderStatus.
	 *
	 * @param id the id of the entity
	 */
	void delete(Long id);
}
