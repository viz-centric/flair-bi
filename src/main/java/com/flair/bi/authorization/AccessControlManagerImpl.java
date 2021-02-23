package com.flair.bi.authorization;

import com.flair.bi.domain.QUser;
import com.flair.bi.domain.Realm;
import com.flair.bi.domain.User;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.PermissionEdge;
import com.flair.bi.domain.security.PermissionEdgeKey;
import com.flair.bi.domain.security.QPermission;
import com.flair.bi.domain.security.QPermissionEdge;
import com.flair.bi.domain.security.QUserGroup;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.security.PermissionEdgeRepository;
import com.flair.bi.repository.security.PermissionRepository;
import com.flair.bi.security.PermissionGrantedAuthority;
import com.flair.bi.security.RestrictedResources;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.UserService;
import com.flair.bi.service.security.UserGroupService;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Transactional
class AccessControlManagerImpl implements AccessControlManager {

	private final UserService userService;

	private final UserGroupService userGroupService;

	private final PermissionRepository permissionRepository;

	private final PermissionEdgeRepository permissionEdgeRepository;

	/**
	 * Checks whether user with given login has proper permission
	 *
	 * @param login    user's login
	 * @param resource permission resource
	 * @param action   permission action
	 * @param scope    permission scope
	 * @return true if user has permission, false otherwise
	 */
	@Transactional(readOnly = true)
	@Override
	public boolean hasAccess(String login, String resource, Action action, String scope) {
		return hasAccess(login, new Permission(resource, action, scope));
	}

	/**
	 * Checks whether user with given login has proper permission
	 *
	 * @param login      user's login
	 * @param permission permission that we are checking against
	 * @return true if user has permission, false otherwise
	 */
	@Transactional(readOnly = true)
	@Override
	public boolean hasAccess(String login, Permission permission) {
		log.debug("Checking access for {}", permission);
		Optional<User> user = userService.getUserByLogin(login);

		return user.map(User::retrieveAllUserPermissions).map(x -> x.stream().anyMatch(y -> y.equals(permission)))
				.orElse(false);
	}

	/**
	 * Checks whether user with given login has proper permission
	 *
	 * @param resource permission resource
	 * @param action   permission action
	 * @param scope    permission scope
	 * @return true if user has permission, false otherwise
	 */
	@Override
	public boolean hasAccess(String resource, Action action, String scope) {
		return hasAccess(new Permission(resource, action, scope));
	}

	/**
	 * Checks whether user with given login has proper permission
	 *
	 * @param permission permission that we are checking against
	 * @return true if user has permission, false otherwise
	 */
	@Transactional(readOnly = true)
	@Override
	public boolean hasAccess(Permission permission) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return auth != null
				&& (auth.getAuthorities().stream().anyMatch(x -> x.equals(new PermissionGrantedAuthority(permission)))
						|| hasAccess(SecurityUtils.getCurrentUserLogin(), permission));

	}

	/**
	 * Give the user a permission
	 *
	 * @param login      login information of the user
	 * @param permission permission that is being given
	 */
	@Override
	public void grantAccess(String login, Permission permission) {
		grantAccess(login, Collections.singletonList(permission));
	}

	/**
	 * Give the user a permission
	 *
	 * @param login    login information of the user
	 * @param resource permission resource
	 * @param action   permission action
	 * @param scope    permission scope
	 */
	@Override
	public void grantAccess(String login, String resource, Action action, String scope) {
		grantAccess(login, new Permission(resource, action, scope));
	}

	/**
	 * Give the user a permission
	 *
	 * @param login       login information of the user
	 * @param permissions collection of the permissions to give to the user
	 */
	@Override
	public void grantAccess(String login, Collection<Permission> permissions) {
		permissions.forEach(permission -> {
					if (isRestrictedPermission(permission)) {
						throw new IllegalStateException("Permission " + permission + " cannot be assigned");
					}
				});

		Set<Permission> perms = permissions.stream().flatMap(x -> getPermissionChain(x).stream())
				.collect(Collectors.toSet());

		userService.getUserByLogin(login).ifPresent(x -> {
			x.addPermissions(perms);
			userService.saveUser(x);
		});

		// if we're granting access to authenticated user we must add permissions to him
		if (login != null && login.equalsIgnoreCase(SecurityUtils.getCurrentUserLogin())) {
			if (null != SecurityContextHolder.getContext().getAuthentication()) {
				Collection<? extends GrantedAuthority> oldAuthorities = SecurityContextHolder.getContext()
						.getAuthentication().getAuthorities();

				List<GrantedAuthority> newAuthorities = permissions.stream().map(PermissionGrantedAuthority::new)
						.collect(Collectors.toList());
				newAuthorities.addAll(oldAuthorities);

				UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
						SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
						SecurityContextHolder.getContext().getAuthentication().getCredentials(), newAuthorities);
				token.setDetails(SecurityUtils.getUserAuth());
				SecurityContextHolder.getContext().setAuthentication(token);
			}

		}
	}

	/**
	 * Assign a single permission to role
	 *
	 * @param role       name of the role
	 * @param permission permission to be assigned
	 */
	@Override
	public void assignPermission(String role, Permission permission) {
		assignPermissions(role, Collections.singletonList(permission));
	}

	private boolean isRestrictedRole(String role) {
		return RestrictedResources.RESTRICTED_ROLES.contains(role);
	}

	private boolean isRestrictedPermission(Permission permission) {
		return RestrictedResources.RESTRICTED_RESOURCES.contains(permission.getResource());
	}

	/**
	 * Assign list of permissions to a given role
	 *
	 * @param role        name of the role
	 * @param permissions list of permissions
	 */
	@Override
	public void assignPermissions(String role, Collection<Permission> permissions) {
		if (isRestrictedRole(role)) {
			throw new IllegalStateException("User role " + role + " cannot be assigned");
		}

		permissions.forEach(permission -> {
			if (isRestrictedPermission(permission)) {
				throw new IllegalStateException("Permission " + permission + " cannot be assigned");
			}
		});

		Optional<UserGroup> userGroup = Optional.ofNullable(userGroupService.findOne(role));

		Set<Permission> perms = permissions.stream().flatMap(x -> getPermissionChain(x).stream())
				.collect(Collectors.toSet());

		userGroup.ifPresent(x -> {
			x.addPermissions(perms);
			userGroupService.save(x);
		});
	}

	@Override
	public void dissociatePermission(String role, Permission permission) {
		dissociatePermissions(role, Collections.singletonList(permission));
	}

	/**
	 * Dissociate permissions from a given role
	 *
	 * @param role        role from which permissions are being dissociated
	 * @param permissions permissions being dissociated
	 */
	@Override
	public void dissociatePermissions(String role, Collection<Permission> permissions) {
		if (isRestrictedRole(role)) {
			throw new IllegalStateException("User role " + role + " cannot be unassigned");
		}

		permissions.forEach(permission -> {
			if (isRestrictedPermission(permission)) {
				throw new IllegalStateException("Permission " + permission + " cannot be unassigned");
			}
		});

		Optional<UserGroup> userGroup = Optional.ofNullable(userGroupService.findOne(role));

		Set<Permission> perms = permissions.stream().flatMap(x -> getPermissionChain(x).stream())
				.collect(Collectors.toSet());

		userGroup.ifPresent(x -> {
			x.removePermissions(perms);
			userGroupService.save(x);
		});
	}

	/**
	 * Remove the permission from the user
	 *
	 * @param login    user's login info
	 * @param resource permission resource
	 * @param action   permission action
	 * @param scope    permission scope
	 */
	@Override
	public void revokeAccess(String login, String resource, Action action, String scope) {
		revokeAccess(login, new Permission(resource, action, scope));
	}

	/**
	 * Remove the permission from the user
	 *
	 * @param login      user's login info
	 * @param permission permission to be removed
	 */
	@Override
	public void revokeAccess(String login, Permission permission) {
		revokeAccess(login, Collections.singletonList(permission));
	}

	/**
	 * Remove the permission from the user
	 *
	 * @param login       user's login info
	 * @param permissions collection of the permissions to remove from user
	 */
	@Override
	public void revokeAccess(String login, Collection<Permission> permissions) {
		permissions.forEach(permission -> {
			if (isRestrictedPermission(permission)) {
				throw new IllegalStateException("Permission " + permission + " cannot be unassigned");
			}
		});

		Set<Permission> perms = permissions.stream().flatMap(x -> getPermissionChain(x).stream())
				.collect(Collectors.toSet());

		userService.getUserByLogin(login).ifPresent(x -> {
			x.removePermissions(perms);
			userService.saveUser(x);
		});
	}

	/**
	 * Add new permissions to the context
	 *
	 * @param permissions permissions to be added
	 * @return collection of newly added permissions
	 */
	@Override
	public Collection<Permission> addPermissions(Collection<Permission> permissions) {
		permissions.forEach(permission -> {
			if (isRestrictedPermission(permission)) {
				throw new IllegalStateException("Permission " + permission + " cannot be assigned");
			}
		});
		return permissionRepository.saveAll(permissions);
	}

	/**
	 * Populate authorization context with permissions from secured entity
	 *
	 * @param entity entity being secured
	 * @return collection of added permissions
	 */
	@Override
	public Collection<Permission> addPermissions(SecuredEntity entity) {
		return addPermissions(entity.getPermissions());
	}

	/**
	 * Remove permission from the context
	 *
	 * @param permission permission to be removed
	 */
	@Override
	public void removePermission(Permission permission) {
		removePermissions(Collections.singletonList(permission));
	}

	private Permission removeForeignConstraints(Permission permission) {
		permission.getUsers().forEach(user -> user.getPermissions().remove(permission));
		permission.getUsers().clear();
		permission.getUserGroups().forEach(userGroup -> userGroup.getPermissions().remove(permission));
		permission.getUserGroups().clear();

		return permission;
	}

	private Permission deleteEdges(Permission permission) {
		Iterable<PermissionEdge> permissionEdges = permissionEdgeRepository
				.findAll(hasUserRealmAccess().and(QPermissionEdge.permissionEdge.from.key.eq(permission.getKey())
						.or(QPermissionEdge.permissionEdge.to.key.eq(permission.getKey()))));

		permissionEdgeRepository.deleteAll(permissionEdges);
		return permission;
	}

	private BooleanExpression hasUserRealmAccess() {
		return QPermissionEdge.permissionEdge.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
	}

	/**
	 * Remove collection of permissions from the context
	 *
	 * @param permissions permissions to be removed
	 */
	@Override
	public void removePermissions(Collection<Permission> permissions) {
		permissions.forEach(permission -> {
			if (isRestrictedPermission(permission)) {
				throw new IllegalStateException("Permission " + permission + " cannot be unassigned");
			}
		});
		((List<Permission>) permissionRepository.findAll(QPermission.permission.key
				.in(permissions.stream().map(Permission::getKey).collect(Collectors.toSet())))).stream()
						.map(this::removeForeignConstraints).map(this::deleteEdges)
						.forEach(permissionRepository::delete);
	}

	/**
	 * Remove permissions from the authorization context for given secured entity
	 *
	 * @param entity entity whose permissions are being removed
	 */
	@Override
	public void removePermissions(SecuredEntity entity) {
		removePermissions(entity.getPermissions());
	}

	/**
	 * Make a connection between two permission
	 * <p>
	 * Note: only permissions that are in two different scopes can be connected
	 *
	 * @param from          permission that gives other permission new authorization
	 *                      capabilities
	 * @param to            permission that will also gain permission capabilities
	 *                      from other permission
	 * @param bidirectional if the connection works both ways which means both
	 *                      permission get each other permission capabilities
	 *                      <p>
	 *                      For example: FROM : Permission A TO: PERMISSION B
	 *                      translates that now Principal who has Permission B will
	 *                      also indirectly have access to resources that Permission
	 *                      A gives
	 *                      <p>
	 *                      WARNING: It is advised to use this method only after
	 *                      creating new permissions to make initial connections
	 *                      between permissions
	 * @param realm
	 * @return created connection
	 */
	@Override
	public PermissionEdge connectPermissions(Permission from, Permission to, boolean bidirectional,
											 boolean transitive, Realm realm) {
		final PermissionEdge edge = permissionEdgeRepository
				.save(new PermissionEdge(from, to, bidirectional, transitive, realm));

		updatePermissionState(to, from, true);

		if (bidirectional) {
			updatePermissionState(from, to, true);
		}

		return edge;
	}

	/**
	 * Adds permission to user and user groups according to the permission edge
	 *
	 * @param criteria   permission that is being extended
	 * @param permission permission that extends
	 * @param add        if update consist of adding new permissions, if false means
	 *                   that update consists of deleting permissions from user and
	 *                   user groups
	 */
	private void updatePermissionState(final Permission criteria, final Permission permission, boolean add) {
		Iterable<User> it = userService.findAllWithAuthorities(QUser.user.permissions.contains(criteria));
		Iterable<UserGroup> userGroups = userGroupService
				.findAll(QUserGroup.userGroup.permissions.contains(criteria));
		if (add) {
			it.forEach(x -> x.getPermissions().add(permission));
			userGroups.forEach(x -> x.getPermissions().add(permission));
		} else {
			it.forEach(x -> x.getPermissions().remove(permission));
			userGroups.forEach(x -> x.getPermissions().remove(permission));
		}
		userService.saveAllUsers(it);
		userGroupService.saveAll(userGroups);
	}

	/**
	 * Remove a connection between two permissions
	 *
	 * @param from permission that gives new capabilities
	 * @param to   permission that gains new capabilities
	 */
	@Override
	public void disconnectPermissions(Permission from, Permission to) {
		PermissionEdgeKey permissionEdgeKey = new PermissionEdgeKey();
		permissionEdgeKey.setFromKey(from.getKey());
		permissionEdgeKey.setToKey(to.getKey());

		PermissionEdge edge = permissionEdgeRepository.findOne(
				hasUserRealmAccess().and(QPermissionEdge.permissionEdge.key.eq(permissionEdgeKey))).orElseThrow();

		updatePermissionState(to, from, false);

		if (edge.isBiDirectional()) {
			updatePermissionState(from, to, false);
		}
		permissionEdgeRepository.delete(edge);
	}

	/**
	 * Gather all permissions that are connected together
	 *
	 * @param permission permission that searching starts from
	 * @return collection of permissions connected together
	 */
	@Transactional(readOnly = true)
	@Override
	public Collection<Permission> getPermissionChain(Permission permission) {
		Set<Permission> permissions = new HashSet<>();
		permissions.add(permission);
		return getPermissionChain(permission, permissions, new HashSet<>(), true, true);
	}

	/**
	 * Collect all permissions that create a chain
	 *
	 * @param permission permission that chain starts from
	 * @param permList   list of all permissions
	 * @return collection of all permissions that create a chain
	 */
	private Set<Permission> getPermissionChain(Permission permission, Set<Permission> permList,
			Set<PermissionEdge> visited, boolean chainFrom, boolean chainTo) {

		// extract permission chain where give permission gives
		BooleanExpression givesPerm = QPermissionEdge.permissionEdge.to.eq(permission)
				.and(QPermissionEdge.permissionEdge.notIn(visited));

		// extract permission chain where connection is bi directional
		BooleanExpression givesBiDirectPerm = QPermissionEdge.permissionEdge.from.eq(permission)
				.and(QPermissionEdge.permissionEdge.biDirectional.eq(true)
						.and(QPermissionEdge.permissionEdge.notIn(visited)));

		List<PermissionEdge> permissions = (List<PermissionEdge>) permissionEdgeRepository
				.findAll(hasUserRealmAccess().and(givesPerm));

		List<PermissionEdge> permissionEdges = (List<PermissionEdge>) permissionEdgeRepository
				.findAll(hasUserRealmAccess().and(givesBiDirectPerm));

		// add those edges to visited
		visited.addAll(permissions);
		visited.addAll(permissionEdges);

		if (!permissions.isEmpty() && chainFrom) {
			permList.addAll(permissions.stream().map(PermissionEdge::getFrom).collect(Collectors.toSet()));

			permissions.stream().filter(PermissionEdge::isTransitive).map(PermissionEdge::getFrom)
					.forEach(x -> getPermissionChain(x, permList, visited, true, false));
		}

		if (!permissionEdges.isEmpty() && chainTo) {
			permList.addAll(permissionEdges.stream().map(PermissionEdge::getTo).collect(Collectors.toSet()));

			permissionEdges.stream().filter(PermissionEdge::isTransitive).map(PermissionEdge::getTo)
					.forEach(x -> getPermissionChain(x, permList, visited, false, true));
		}

		return permList;
	}
}
