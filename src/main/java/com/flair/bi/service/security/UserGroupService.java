package com.flair.bi.service.security;

import com.flair.bi.domain.User;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.PermissionKey;
import com.flair.bi.domain.security.QUserGroup;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.security.PermissionRepository;
import com.flair.bi.repository.security.UserGroupRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.UserService;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
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

	private final UserService userService;

	@Transactional(readOnly = true)
	public List<UserGroup> findAll() {
		User user = userService.getUserWithAuthoritiesByLoginOrError(SecurityUtils.getCurrentUserLogin());
		log.debug("Request to get all UserGroups for realm {}", user.getRealm().getId());
		return ImmutableList.copyOf(
				userGroupRepository.findAll(QUserGroup.userGroup.realm.id.eq(user.getRealm().getId()))
		);
	}

	@Transactional(readOnly = true)
	public List<UserGroup> findAllByNameInAndRealmId(Set<String> groupNames, Long realmId) {
		return userGroupRepository.findAllByNameInAndRealmId(groupNames, realmId);
	}

	@Transactional(readOnly = true)
	public List<UserGroup> findAllByRealmId(Long realmId) {
		return userGroupRepository.findAllByRealmId(realmId);
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

		User user = userService.getUserWithAuthoritiesByLoginOrError(SecurityUtils.getCurrentUserLogin());
		userGroup.setRealm(user.getRealm());

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
		User user = userService.getUserWithAuthoritiesByLoginOrError(SecurityUtils.getCurrentUserLogin());
		return userGroupRepository.findAll(QUserGroup.userGroup.realm.id.eq(user.getRealm().getId()), pageable);
	}

	@Transactional(readOnly = true)
	public List<UserGroup> findAll(Predicate predicate) {
		log.debug("Request to get all UserGroups");
		User user = userService.getUserWithAuthoritiesByLoginOrError(SecurityUtils.getCurrentUserLogin());
		return ImmutableList.copyOf(
				userGroupRepository.findAll(QUserGroup.userGroup.realm.id.eq(user.getRealm().getId()).and(predicate))
		);
	}

	/**
	 * Get the "name" userGroup.
	 *
	 * @param name the name of the entity
	 * @return the entity
	 */
	@Transactional(readOnly = true)
	public UserGroup findOne(String name) {
		User user = userService.getUserWithAuthoritiesByLoginOrError(SecurityUtils.getCurrentUserLogin());
		log.debug("Request to get UserGroup: {}", name);
		return userGroupRepository.findByNameAndRealmId(name, user.getRealm().getId());
	}

	/**
	 * Delete the "name" dashboard.
	 *
	 * @param name the id of the entity
	 */
	public void delete(String name) {
		User user = userService.getUserWithAuthoritiesByLoginOrError(SecurityUtils.getCurrentUserLogin());
		log.debug("Request to delete UserGroup: {}", name);
		userGroupRepository.deleteAllByNameAndRealmId(name, user.getRealm().getId());
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

	@Transactional(readOnly = true)
	public boolean exists(UserGroup userGroup) {
		User user = userService.getUserWithAuthoritiesByLoginOrError(SecurityUtils.getCurrentUserLogin());
		return userGroupRepository.findByNameAndRealmId(userGroup.getName(), user.getRealm().getId()) != null;
	}

	public void saveAll(Iterable<UserGroup> userGroups) {
		userGroupRepository.saveAll(userGroups);
	}

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'DELETE','APPLICATION')")
	public void deleteAllByRealmId(Long realmId){
		userGroupRepository.deleteAllByRealmId(realmId);
	}
}
