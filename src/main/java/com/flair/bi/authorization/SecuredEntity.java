package com.flair.bi.authorization;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Entity that is marked as being protected
 */
public interface SecuredEntity {

    /**
     * Get the entity identifiers
     *
     * @return collection of entity resources
     */
    List<String> getResources();

    /**
     * List of available actions that can be performed against secured entity
     *
     * @return collection of {@link Action}
     */

    List<Action> getActions();

    /**
     * Under which scope is this entity being protected
     *
     * @return scope or realm
     */
    String getScope();

    /**
     * Get the collection of all available permissions
     *
     * @return collection of permissions
     */
    @JsonIgnore
    default Set<Permission> getPermissions() {
        return getActions()
            .stream()
            .flatMap(x -> getResources().stream().map(y -> new Permission(y, x, getScope())))
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @JsonIgnore
    <T extends PermissionGrantee> GranteePermissionReport<T> getGranteePermissionReport(T grantee);

    @JsonIgnore
    <T extends PermissionGrantee> DashboardGranteePermissionReport<T> getDashboardGranteePermissionReport(T grantee,List<GranteePermissionReport<T>> viewPermissions);

}