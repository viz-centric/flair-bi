package com.flair.bi.domain.listeners;

import javax.persistence.PreRemove;

import com.flair.bi.domain.security.Permission;

public class PermissionListener {

	/**
	 * Before we remove permission we must remove referential integrity of foreign
	 * key in other tables
	 *
	 * @param permission permission
	 */
	@PreRemove
	public void preRemove(Permission permission) {

	}
}
