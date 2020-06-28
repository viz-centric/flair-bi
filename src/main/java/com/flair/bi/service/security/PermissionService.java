package com.flair.bi.service.security;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.PermissionKey;
import com.flair.bi.repository.security.PermissionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class PermissionService {

	private final PermissionRepository permissionRepository;

	/**
	 * Save a permission.
	 *
	 * @param permission the entity to save
	 * @return the persisted entity
	 */
	public Permission save(Permission permission) {
		log.debug("Request to save Permission: {}", permission);
		return permissionRepository.save(permission);
	}

	/**
	 * Get all the permissions.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 */
	@Transactional(readOnly = true)
	public Page<Permission> findAll(Pageable pageable) {
		log.debug("Request to get all permissions");
		return permissionRepository.findAll(pageable);
	}

	/**
	 * Get the "id" permission.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Transactional(readOnly = true)
	public Permission findOne(PermissionKey id) {
		log.debug("Request to get Permission: {}", id);
		return permissionRepository.getOne(id);
	}

	/**
	 * Delete the "id" permission.
	 *
	 * @param id the id of the entity
	 */
	public void delete(PermissionKey id) {
		log.debug("Request to delete Permission: {}", id);
		permissionRepository.deleteById(id);
	}
}
