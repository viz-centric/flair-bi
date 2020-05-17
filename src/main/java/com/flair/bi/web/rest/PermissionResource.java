package com.flair.bi.web.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.config.Constants;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.service.UserService;
import com.flair.bi.service.security.UserGroupService;
import com.flair.bi.web.rest.vm.ManagedUserVM;

import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;

/**
 * REST endpoint for Permissions
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PermissionResource {

    private final UserGroupService userGroupService;

    private final UserService userService;

    private final AccessControlManager accessControlManager;

    /**
     * PUT /permissions/:permission/userGroups/:userGroup : add permission to user group
     *
     * @param permission permission id
     * @param userGroup  user group name
     * @return the ResponseEntity with status 200 (OK)
     * or 404 (Not found) if either permission or user group was not found
     */
    @PutMapping("/permissions/{permission}/userGroups/{userGroup}")
    @Timed
    public ResponseEntity<UserGroup> addPermissionToUserGroup(@PathVariable String permission, @PathVariable String userGroup) {
        accessControlManager.assignPermission(userGroup, Permission.fromStringValue(permission));
        return ResponseEntity.ok(userGroupService.findOne(userGroup));
    }

    /**
     * PUT /permissions/:permission/userGroups/:userGroup : removes permission from user group
     *
     * @param permission permission id
     * @param userGroup  user group name
     * @return the ResponseEntity with status 200 (OK)
     * or 404 (Not found) if either permission or user group was not found
     */
    @DeleteMapping("/permissions/{permission}/userGroups/{userGroup}")
    @Timed
    public ResponseEntity<UserGroup> removePermissionFromUserGroup(@PathVariable String permission, @PathVariable String userGroup) {
        accessControlManager.dissociatePermission(userGroup, Permission.fromStringValue(permission));
        return ResponseEntity.ok(userGroupService.findOne(userGroup));
    }

    /**
     * PUT /permissions/:id/users/:login : add permission to user
     *
     * @param login user login
     * @param id    permission id
     * @return the ResponseEntity with status 200 (OK)
     * or 404 (Not found) if permission or user login was not found
     */
    @PutMapping("/permissions/{id}/users/{login:" + Constants.LOGIN_REGEX + "}")
    @Timed
    public ResponseEntity<ManagedUserVM> addPermission(@PathVariable String login, @PathVariable String id) {
        accessControlManager.grantAccess(login, Permission.fromStringValue(id));

        final ManagedUserVM managedUserVM = new ManagedUserVM(userService.getUserWithAuthoritiesByLogin(login).orElse(null));
        return ResponseEntity.ok(managedUserVM);
    }


    /**
     * DELETE /permissions/:id/users/:login : removes permission from user
     *
     * @param login user login
     * @param id    permission id
     * @return the ResponseEntity with status 200 (OK)
     * or status 404 (Not found) if user or permission was not found
     */
    @DeleteMapping("/permissions/{id}/users/{login:" + Constants.LOGIN_REGEX + "}")
    @Timed
    public ResponseEntity<ManagedUserVM> removePermission(@PathVariable String login, @PathVariable String id) {
        accessControlManager.revokeAccess(login, Permission.fromStringValue(id));
        final ManagedUserVM managedUserVM = new ManagedUserVM(userService.getUserWithAuthoritiesByLogin(login).orElse(null));
        return ResponseEntity.ok(managedUserVM);
    }
}
