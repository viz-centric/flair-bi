package com.flair.bi.service.impl;

import com.flair.bi.domain.FileUploaderStatus;
import com.flair.bi.domain.QFileUploaderStatus;
import com.flair.bi.domain.User;
import com.flair.bi.repository.FileUploaderStatusRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.FileUploaderStatusService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.FileUploaderStatusDTO;
import com.flair.bi.service.mapper.FileUploaderStatusMapper;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

/**
 * Service Implementation for managing FileUploaderStatus.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FileUploaderStatusServiceImpl implements FileUploaderStatusService {

	private final FileUploaderStatusRepository fileUploaderStatusRepository;

	private final FileUploaderStatusMapper fileUploaderStatusMapper;

	private final UserService userService;

	/**
	 * Save a fileUploaderStatus.
	 *
	 * @param fileUploaderStatusDTO the entity to save
	 * @return the persisted entity
	 */
	public FileUploaderStatusDTO save(FileUploaderStatusDTO fileUploaderStatusDTO) {
		log.debug("Request to save FileUploaderStatus : {}", fileUploaderStatusDTO);
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		FileUploaderStatus fileUploaderStatus = fileUploaderStatusMapper
				.fileUploaderStatusDTOToFileUploaderStatus(fileUploaderStatusDTO);
		if (fileUploaderStatus.getRealm() == null) {
			fileUploaderStatus.setRealm(user.getRealmById(SecurityUtils.getUserAuth().getRealmId()));
		} else {
			if (!Objects.equals(fileUploaderStatus.getRealm().getId(), SecurityUtils.getUserAuth().getRealmId())) {
				throw new IllegalStateException("Cannot save file uploader status with realm " + fileUploaderStatus.getRealm().getId());
			}
		}
		fileUploaderStatus = fileUploaderStatusRepository.save(fileUploaderStatus);
		return fileUploaderStatusMapper
				.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus);
	}

	/**
	 * Get all the fileUploaderStatuses.
	 * 
	 * @param pageable the pagination information
	 * @return the list of entities
	 */
	@Transactional(readOnly = true)
	public Page<FileUploaderStatusDTO> findAll(Pageable pageable) {
		log.debug("Request to get all FileUploaderStatuses");
		Page<FileUploaderStatus> result = fileUploaderStatusRepository.findAll(hasRealmPermissions(), pageable);
		return result.map(fileUploaderStatus -> fileUploaderStatusMapper
				.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus));
	}

	/**
	 * Get one fileUploaderStatus by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Transactional(readOnly = true)
	public FileUploaderStatusDTO findOne(Long id) {
		log.debug("Request to get FileUploaderStatus : {}", id);
		FileUploaderStatus fileUploaderStatus = fileUploaderStatusRepository.findOne(hasRealmPermissions().and(QFileUploaderStatus.fileUploaderStatus.id.eq(id)))
				.orElseThrow();
		return fileUploaderStatusMapper
				.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus);
	}

	/**
	 * Delete the fileUploaderStatus by id.
	 *
	 * @param id the id of the entity
	 */
	public void delete(Long id) {
		log.debug("Request to delete FileUploaderStatus : {}", id);
		FileUploaderStatusDTO statusDTO = findOne(id);
		fileUploaderStatusRepository.deleteById(statusDTO.getId());
	}

	private BooleanExpression hasRealmPermissions() {
		return QFileUploaderStatus.fileUploaderStatus.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
	}
}
