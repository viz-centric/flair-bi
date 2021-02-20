package com.flair.bi.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flair.bi.authorization.PermissionGrantee;
import com.flair.bi.config.Constants;
import com.flair.bi.domain.bookmarkwatch.BookmarkWatch;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.domain.viewwatch.ViewWatch;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.annotation.PreDestroy;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * A user.
 */
@Entity
@Table(name = "jhi_user")
@EqualsAndHashCode(of = "login", callSuper = false)
@Getter
@Setter
public class User extends AbstractAuditingEntity implements Serializable, PermissionGrantee {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	@Pattern(regexp = Constants.LOGIN_REGEX)
	@Size(min = 1, max = 50)
	@Column(length = 50, unique = true, nullable = false)
	private String login;

	@JsonIgnore
	@NotNull
	@Size(min = 60, max = 60)
	@Column(name = "password_hash", length = 60)
	private String password;

	@Size(max = 50)
	@Column(name = "first_name", length = 50)
	private String firstName;

	@Size(max = 50)
	@Column(name = "last_name", length = 50)
	private String lastName;

	@Email
	@Size(max = 100)
	@Column(length = 100, unique = true)
	private String email;

	@NotNull
	@Column(nullable = false)
	private boolean activated = false;

	@Size(min = 2, max = 5)
	@Column(name = "lang_key", length = 5)
	private String langKey;

	@Size(max = 20)
	@Column(name = "activation_key", length = 20)
	@JsonIgnore
	private String activationKey;

	@Size(max = 20)
	@Column(name = "reset_key", length = 20)
	private String resetKey;

	@Column(name = "reset_date")
	private ZonedDateTime resetDate = null;

	@Size(max = 20)
	@Column(name = "user_type", length = 20)
	private String userType;

	@JsonIgnore
	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "user")
	private Set<PersistentToken> persistentTokens = new HashSet<>();

	@JsonIgnore
	@ManyToMany
	@JoinTable(name = "user_user_group",
			foreignKey = @ForeignKey(name = "fk_user_id"),
			inverseForeignKey = @ForeignKey(name = "fk_user_group_id"),
			joinColumns = {
				@JoinColumn(name = "user_id", referencedColumnName = "id") },
			inverseJoinColumns = {
				@JoinColumn(name = "user_group_id", referencedColumnName = "id") })
	private Set<UserGroup> userGroups = new HashSet<>();

	@JsonIgnore
	@ManyToMany
	@JoinTable(name = "user_permission", foreignKey = @ForeignKey(name = "fk_usr_perm_user_id"), inverseForeignKey = @ForeignKey(name = "fk_usr_perm_permission_key"), joinColumns = {
			@JoinColumn(name = "user_id", referencedColumnName = "id") }, inverseJoinColumns = {
					@JoinColumn(name = "permission_resource", referencedColumnName = "resource"),
					@JoinColumn(name = "permission_action", referencedColumnName = "action"),
					@JoinColumn(name = "permission_scope", referencedColumnName = "scope") })
	private Set<Permission> permissions = new HashSet<>();

	@JsonIgnore
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
	private Set<ViewWatch> viewWatches = new HashSet<>();

	@JsonIgnore
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
	private Set<BookmarkWatch> bookmarkWatches = new HashSet<>();

	@JsonIgnore
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<DatasourceConstraint> datasourceConstraints = new HashSet<>();

	@ManyToMany(cascade = CascadeType.ALL)
	@JoinTable(name = "user_realm",
			joinColumns = @JoinColumn(name = "jhi_user_id", referencedColumnName = "id"),
			inverseJoinColumns = @JoinColumn(name = "realms_id", referencedColumnName = "id"))
	private Set<Realm> realms = new HashSet<>();

	@ManyToOne
	private Realm realm;

	@PreDestroy
	public void preDestroy() {
		bookmarkWatches.forEach(x -> x.setUser(null));
		bookmarkWatches.clear();
		viewWatches.forEach(x -> x.setUser(null));
		viewWatches.clear();
		userGroups.forEach(x -> x.getUsers().remove(this));
	}

	/**
	 * Get all permissions that user have through user groups and specifically
	 *
	 * @param onlyUserGroup only include permissions from user group if true,
	 *                      otherwise all
	 * @return list of all permissions
	 */
	public Set<Permission> retrieveAllUserPermissions(boolean onlyUserGroup) {
		Set<Permission> permissions = new HashSet<>();

		getUserGroups().forEach(x -> permissions.addAll(x.getPermissions()));

		if (!onlyUserGroup)
			permissions.addAll(getPermissions());

		return permissions;
	}

	public Set<Permission> getPermissionsByActionAndPermissionType(Collection<Action> action, String scope) {
		return this.retrieveAllUserPermissions().stream()
				.filter(x -> action.contains(x.getAction()) && x.getScope().equalsIgnoreCase(scope))
				.collect(Collectors.toSet());

	}

	public Set<Permission> retrieveAllUserPermissions() {
		return retrieveAllUserPermissions(false);
	}

	// Lowercase the login before saving it in database
	public void setLogin(String login) {
		this.login = login.toLowerCase(Locale.ENGLISH);
	}

	@Override
	@JsonIgnore
	public Set<Permission> getAvailablePermissions() {
		return retrieveAllUserPermissions();
	}

	public void addUserGroup(UserGroup userGroup) {
		this.userGroups.add(userGroup);
		userGroup.getUsers().add(this);
	}

	public void removeUserGroup(UserGroup userGroup) {
		this.userGroups.remove(userGroup);
		userGroup.getUsers().remove(this);
	}

	public void addPermission(Permission permission) {
		this.permissions.add(permission);
		permission.getUsers().add(this);
	}

	public void removePermission(Permission permission) {
		this.permissions.remove(permission);
		permission.getUsers().remove(this);
	}

	public void addUserGroups(Collection<UserGroup> userGroups) {
		userGroups.forEach(this::addUserGroup);
	}

	public void removeUserGroups(Collection<UserGroup> userGroups) {
		userGroups.forEach(this::removeUserGroup);
	}

	public void addPermissions(Collection<Permission> permissions) {
		permissions.forEach(this::addPermission);
	}

	public void removePermissions(Collection<Permission> permissions) {
		permissions.forEach(this::removePermission);
	}

	public void addRealm(Realm realm) {
		this.realms.add(realm);
		this.realm = realm;
	}

	@Transient
	public Realm getFirstRealm() {
		return realms.stream().findFirst().orElse(null);
	}

	@Transient
	public Collection<Long> getRealmIds() {
		return realms.stream().map(r -> r.getId()).collect(Collectors.toList());
	}
}
