package com.flair.bi.service.security;

import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.PermissionKey;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.security.PermissionRepository;
import com.flair.bi.repository.security.UserGroupRepository;
import com.flair.bi.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing user groups
 */
@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class UserGroupService {

	private final UserGroupRepository userGroupRepository;

	private final PermissionRepository permissionRepository;

	public List<UserGroup> findAll() {
		log.debug("Request to get all UserGroups");
		return userGroupRepository.findAll();
	}

	/**
	 * Save a UserGroup.
	 *
	 * @param userGroup the entity to save
	 * @return the persisted entity
	 */
	public UserGroup save(UserGroup userGroup) {
		log.debug("Request to save UserGroup: {}", userGroup);
		// Default permissions required in order to create user_group(DASHBOARDS,
		// VISUAL-METADATA, VISUALIZATIONS) - Issue Fixed: Start

		final Set<Permission> permissions = permissionRepository
				.findAllById(Arrays.asList(new PermissionKey("DASHBOARDS", Action.READ, "APPLICATION"),
						new PermissionKey("VISUAL-METADATA", Action.READ, "APPLICATION"),
						new PermissionKey("VISUALIZATIONS", Action.READ, "APPLICATION")))
				.stream().collect(Collectors.toSet());

		userGroup.getPermissions().clear();
		userGroup.addPermissions(permissions);
		// Default permissions required in order to create user_group(DASHBOARDS,
		// VISUAL-METADATA, VISUALIZATIONS) - Issue Fixed: End

		return userGroupRepository.save(userGroup);
	}

	/**
	 * Get all the userGroups.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 */
	@Transactional(readOnly = true)
	public Page<UserGroup> findAll(Pageable pageable) {
		log.debug("Request to get all UserGroups");
		return userGroupRepository.findAll(pageable);
	}

	/**
	 * Get the "name" userGroup.
	 *
	 * @param name the id of the entity
	 * @return the entity
	 */
	@Transactional(readOnly = true)
	public UserGroup findOne(String name) {
		log.debug("Request to get UserGroup: {}", name);
		return userGroupRepository.getOne(name);
	}

	@Transactional(readOnly = true)
	public boolean exists(String name) {
		log.debug("Exists to get UserGroup: {}", name);
		return userGroupRepository.existsByName(name);
	}

	/**
	 * Delete the "name" dashboard.
	 *
	 * @param name the id of the entity
	 */
	public void delete(String name) {
		log.debug("Request to delete UserGroup: {}", name);
		userGroupRepository.deleteById(name);
	}

	/**
	 * This method checks if the role is predefined
	 * 
	 * @param name name
	 * @return boolean
	 */
	public boolean isPredefinedGroup(String name) {
		return SecurityUtils.getPredefinedGroups().stream().anyMatch(e -> e.toString().equalsIgnoreCase(name));
	}

	/**
	 * This method checks if the role is not predefined
	 * 
	 * @param name name
	 * @return boolean
	 */
	public boolean isNotPredefinedGroup(String name) {
		return !isPredefinedGroup(name);
	}
}
