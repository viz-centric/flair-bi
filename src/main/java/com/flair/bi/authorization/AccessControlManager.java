package com.flair.bi.authorization;

import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.PermissionEdge;

import java.util.Collection;

/**
 * Responsible for handling authorization features of the application
 */
public interface AccessControlManager {

    /**
     * Checks whether user with given login has proper permission
     *
     * @param login    user's login
     * @param resource permission resource
     * @param action   permission action
     * @param scope    permission scope
     * @return true if user has permission, false otherwise
     */
    boolean hasAccess(String login, String resource, Action action, String scope);

    /**
     * Checks whether user with given login has proper permission
     *
     * @param login      user's login
     * @param permission permission that we are checking against
     * @return true if user has permission, false otherwise
     */
    boolean hasAccess(String login, Permission permission);

    /**
     * Checks whether user with given login has proper permission
     *
     * @param resource permission resource
     * @param action   permission action
     * @param scope    permission scope
     * @return true if user has permission, false otherwise
     */
    boolean hasAccess(String resource, Action action, String scope);

    /**
     * Checks whether user with given login has proper permission
     *
     * @param permission permission that we are checking against
     * @return true if user has permission, false otherwise
     */
    boolean hasAccess(Permission permission);

    /**
     * Give the user a permission
     *
     * @param login      login information of the user
     * @param permission permission that is being given
     */
    void grantAccess(String login, Permission permission);

    /**
     * Give the user a permission
     *
     * @param login    login information of the user
     * @param resource permission resource
     * @param action   permission action
     * @param scope    permission scope
     */
    void grantAccess(String login, String resource, Action action, String scope);

    /**
     * Give the user a permission
     *
     * @param login       login information of the user
     * @param permissions collection of the permissions to give to the user
     */
    void grantAccess(String login, Collection<Permission> permissions);

    /**
     * Assign a single permission to role
     *
     * @param role       name of the role
     * @param permission permission to be assigned
     */
    void assignPermission(String role, Permission permission);

    /**
     * Assign list of permissions to a given role
     *
     * @param role        name of the role
     * @param permissions list of permissions
     */
    void assignPermissions(String role, Collection<Permission> permissions);


    void dissociatePermission(String role, Permission permission);

    /**
     * Dissociate permissions from a given role
     *
     * @param role        role from which permissions are being dissociated
     * @param permissions permissions being dissociated
     */
    void dissociatePermissions(String role, Collection<Permission> permissions);

    /**
     * Remove the permission from the user
     *
     * @param login    user's login info
     * @param resource permission resource
     * @param action   permission action
     * @param scope    permission scope
     */
    void revokeAccess(String login, String resource, Action action, String scope);

    /**
     * Remove the permission from the user
     *
     * @param login      user's login info
     * @param permission permission to be removed
     */
    void revokeAccess(String login, Permission permission);

    /**
     * Remove the permission from the user
     *
     * @param login       user's login info
     * @param permissions collection of the permissions to remove from user
     */
    void revokeAccess(String login, Collection<Permission> permissions);


    /**
     * Adds a new permission to the context
     *
     * @param permission permission to be added
     * @return newly added permission
     */
    Permission addPermission(Permission permission);

    /**
     * Add new permissions to the context
     *
     * @param permissions permissions to be added
     * @return collection of newly added permissions
     */
    Collection<Permission> addPermissions(Collection<Permission> permissions);

    /**
     * Populate authorization context with permissions from secured entity
     *
     * @param entity entity being secured
     * @return collection of added permissions
     */
    Collection<Permission> addPermissions(SecuredEntity entity);

    /**
     * Remove permission from the context
     *
     * @param permission permission to be removed
     */
    void removePermission(Permission permission);

    /**
     * Remove collection of permissions from the context
     *
     * @param permissions permissions to be removed
     */
    void removePermissions(Collection<Permission> permissions);

    /**
     * Remove permissions from the authorization context for given secured entity
     *
     * @param entity entity whose permissions are being removed
     */
    void removePermissions(SecuredEntity entity);

    /**
     * Make a connection between two permission
     *
     * @param from          permission that gives other permission new authorization capabilities
     * @param to            permission that will also gain permission capabilities from other permission
     * @param bidirectional if the connection works both ways which means both permission get each other permission capabilities
     *                      <p>
     *                      For example:
     *                      FROM : Permission A
     *                      TO: PERMISSION B
     *                      translates that now Principal who has Permission B will also indirectly have access
     *                      to resources that Permission A gives
     *                      <p>
     * @return created connection
     */
    PermissionEdge connectPermissions(Permission from, Permission to, boolean bidirectional, boolean transitive);

    /**
     * Remove a connection between two permissions
     *
     * @param from permission that gives new capabilities
     * @param to   permission that gains new capabilities
     */
    void disconnectPermissions(Permission from, Permission to);


    /**
     * Gather all permissions that are connected together
     *
     * @param permission permission that searching starts from
     * @return collection of permissions connected together
     */
    Collection<Permission> getPermissionChain(Permission permission);
}
