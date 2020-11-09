package com.flair.bi.domain.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flair.bi.authorization.PermissionGrantee;
import com.flair.bi.domain.Realm;
import com.flair.bi.domain.User;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.PreRemove;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_group2")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "name")
@ToString(of = "name")
public class UserGroup implements Serializable, PermissionGrantee {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	@Size(max = 50)
	@Column(length = 50)
	private String name;

	@JsonIgnore
	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(name = "user_group_permission",
			foreignKey = @ForeignKey(name = "fk_user_group_id"),
			inverseForeignKey = @ForeignKey(name = "fk_permission_key"),
			joinColumns = {
				@JoinColumn(name = "user_group_id", referencedColumnName = "id")
			},
			inverseJoinColumns = {
					@JoinColumn(name = "permission_resource", referencedColumnName = "resource"),
					@JoinColumn(name = "permission_action", referencedColumnName = "action"),
					@JoinColumn(name = "permission_scope", referencedColumnName = "scope")
			})
	private Set<Permission> permissions = new HashSet<>();

	@ManyToMany(mappedBy = "userGroups")
	private Set<User> users = new HashSet<>();

	@ManyToOne(optional = false)
    private Realm realm;

    public UserGroup(String name) {
        this.name = name;
    }

	@PreRemove
	public void preRemove() {
		this.getUsers().forEach(x -> x.getUserGroups().remove(this));
		this.getUsers().clear();

		this.getPermissions().forEach(x -> x.getUserGroups().remove(this));
		this.getPermissions().clear();
	}

	@Override
	@JsonIgnore
	public Set<Permission> getAvailablePermissions() {
		return getPermissions();
	}

	public void addPermission(Permission permission) {
		this.permissions.add(permission);
		permission.getUserGroups().add(this);
	}

	public void removePermission(Permission permission) {
		this.permissions.remove(permission);
		permission.getUserGroups().remove(this);
	}

	public void addPermissions(Collection<Permission> permissions) {
		permissions.forEach(this::addPermission);
	}

	public void removePermissions(Collection<Permission> permissions) {
		permissions.forEach(this::removePermission);
	}

}
