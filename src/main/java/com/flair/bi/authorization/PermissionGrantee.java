package com.flair.bi.authorization;

import com.flair.bi.domain.security.Permission;

import java.util.Set;

/**
 * Entity who get grants on certain permissions
 */
public interface PermissionGrantee {

    /**
     * Retrieve set of all permissions that this grantee holds
     *
     * @return collection of permissions
     */
    Set<Permission> getAvailablePermissions();
}
