package com.flair.bi.domain.security;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flair.bi.domain.User;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.listeners.PermissionListener;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "permission")
@EntityListeners({ PermissionListener.class })
@EqualsAndHashCode(of = { "key" })
public class Permission implements Serializable {

	@EmbeddedId
	private PermissionKey key = new PermissionKey();

	@JsonIgnore
	@ManyToMany(mappedBy = "permissions")
	private Set<UserGroup> userGroups = new HashSet<>();

	@JsonIgnore
	@ManyToMany(mappedBy = "permissions")
	private Set<User> users = new HashSet<>();

	@JsonIgnore
	@OneToMany(mappedBy = "from", orphanRemoval = true, cascade = CascadeType.ALL)
	private Set<PermissionEdge> fromPermissionEdges = new HashSet<>();

	@JsonIgnore
	@OneToMany(mappedBy = "to", orphanRemoval = true, cascade = CascadeType.ALL)
	private Set<PermissionEdge> toPermissionEdges = new HashSet<>();

	public Permission(String resource, Action action, String scope) {
		this.key = new PermissionKey(resource, action, scope);
	}

	public static Permission fromStringValue(String value) {
		String[] arr = value.split("_");

		if (arr.length != 3) {
			throw new IllegalArgumentException();
		}

		return new Permission(arr[1], Action.fromStringValue(arr[0]), arr[2]);
	}

	public String getStringValue() {
		return key.getAction().getType() + "_" + key.getResource() + "_" + key.getScope();

	}

	public String getResource() {
		return key.getResource();
	}

	public void setResource(String resource) {
		key.setResource(resource);
	}

	public Action getAction() {
		return key.getAction();
	}

	public void setAction(Action action) {
		key.setAction(action);
	}

	public String getScope() {
		return key.getScope();
	}

	public void setScope(String scope) {
		key.setScope(scope);
	}

	@Override
	public String toString() {
		return getStringValue();
	}
}
