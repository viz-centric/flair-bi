package com.flair.bi.domain.listeners;

import com.flair.bi.domain.security.Permission;

import javax.persistence.PreRemove;

public class PermissionListener {

    /**
     * Before we remove permission we must remove referential integrity of foreign key in other tables
     *
     * @param permission permission
     */
    @PreRemove
    public void preRemove(Permission permission) {

    }
}
