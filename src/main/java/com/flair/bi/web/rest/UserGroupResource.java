package com.flair.bi.web.rest;

import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.authorization.DashboardGranteePermissionReport;
import com.flair.bi.authorization.GranteePermissionReport;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.View;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.security.RestrictedResources;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.security.UserGroupInfo;
import com.flair.bi.service.security.UserGroupPageInfo;
import com.flair.bi.service.security.UserGroupService;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.flair.bi.web.rest.util.ResponseUtil;
import com.flair.bi.web.rest.vm.ChangePermissionVM;
import com.querydsl.core.types.Predicate;
import io.micrometer.core.annotation.Timed;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityNotFoundException;
import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST endpoint for managing CRUD operations for {@link com.flair.bi.domain.security.UserGroup}
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserGroupResource {

    private static final String ENTITY_NAME = "userGroup";
    private final UserGroupService userGroupService;
    private final DashboardService dashboardService;
    private final DatasourceService datasourceService;
    private final ViewService viewService;
    private final AccessControlManager accessControlManager;

    /**
     * POST /userGroups : adds new user group
     *
     * @param userGroup user group to be added
     * @return The ResponseEntity with status 200 (OK) if new user group has been added,
     * or response with status 401(Bad Request) if user group with given name already exists.
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/userGroups")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'WRITE', 'APPLICATION')")
    public ResponseEntity<UserGroup> createUserGroup(@Valid @RequestBody UserGroup userGroup) throws URISyntaxException {

        boolean existingGroup = userGroupService.exists(userGroup.getName());
        if (existingGroup) {
            return ResponseEntity.badRequest()
                .headers(HeaderUtil
                    .createFailureAlert(ENTITY_NAME,
                        "entity exists",
                        "User group with this name already exists"))
                .body(null);
        }

        if (RestrictedResources.RESTRICTED_ROLES.contains(userGroup.getName())) {
            return ResponseEntity.badRequest()
                    .headers(HeaderUtil
                            .createFailureAlert(ENTITY_NAME,
                                    "restricted role",
                                    "User group cannot be created with this name"))
                    .body(null);
        }

        UserGroup result = userGroupService.save(userGroup);
        return ResponseEntity.created(new URI("/api/userGroups/" + result.getName()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getName()))
            .body(result);
    }

    /**
     * PUT /userGroups : updates already existing user group
     *
     * @param userGroup request body containing user group to be changed.
     * @return The ResponseEntity with status 200 (OK) and updated user group in body.
     */
    @PutMapping("/userGroups")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'UPDATE', 'APPLICATION')")
    public ResponseEntity<UserGroup> updateUserGroup(@Valid @RequestBody UserGroup userGroup) {
        if (RestrictedResources.RESTRICTED_ROLES.contains(userGroup.getName())) {
            return ResponseEntity.badRequest()
                    .headers(HeaderUtil
                            .createFailureAlert(ENTITY_NAME,
                                    "restricted role",
                                    "User group cannot be created with this name"))
                    .body(null);
        }

        final UserGroup result = userGroupService.save(userGroup);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, userGroup.getName()))
            .body(result);
    }


    @GetMapping("/userGroups/all")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<List<String>> getAllUserGroups() {
        return ResponseEntity.ok(userGroupService
            .findAll()
            .stream()
            .map(UserGroup::getName)
            .collect(Collectors.toList()));
    }

    /**
     * GET /userGroups : retrieves page of user groups
     *
     * @param pageable pagination parameters
     * @throws URISyntaxException exception
     * @return The ResponseEntity with status 200 (OK) and filtered list of user groups as body.
     */
    @GetMapping("/userGroups")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<List<UserGroup>> getAllUserGroups(@ApiParam Pageable pageable) throws URISyntaxException {
        Page<UserGroup> page = userGroupService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/userGroups");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET /userGroups/:name : retrieves user group with given name
     *
     * @param name name of user group
     * @return The ResponseEntity with status 200 (OK) and body containing user group with given name.
     */
    @GetMapping("/userGroups/{name}")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<UserGroup> getUserGroup(@PathVariable String name) {
        UserGroup userGroup = userGroupService.findOne(name);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(userGroup));
    }

    /**
     * DELETE /userGroups/:name : deletes user group with given name
     *
     * @param name name of user group
     * @return The response entity with status 200 (OK) if user group was successfully removed.
     */
    @DeleteMapping("/userGroups/{name}")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<?> deleteUserGroup(@PathVariable String name) {
    	if(userGroupService.isNotPredefinedGroup(name)){
    		userGroupService.delete(name);
    		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, name)).build();
    	}
    	else{
    		return ResponseEntity.badRequest().body("predefined groups cannot be deleted");
    	}
    }

    /**
     * POST /userGroups/:name/permissions/:id : adds permission with given id to user group with given name
     *
     * @param name name of userGroup
     * @param id   id of permission
     * @return The response entity with status 200 (OK) and valid body returning updated user group,
     * or status 404 (Not found) if permission with given id was not found or user group with given name was not found.
     */
    @PostMapping("/userGroups/{name}/permissions/{id}")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'UPDATE', 'APPLICATION')")
    public ResponseEntity<?> addPermission(@PathVariable String name, @PathVariable String id) {
        accessControlManager.assignPermission(name, Permission.fromStringValue(id));
        return ResponseEntity.ok(null);
    }

    /**
     * DELETE userGroups/:name/permissions/:id : removes permission with given id from user group with given name
     *
     * @param name name of userGroup
     * @param id   id of permission
     * @return the ResponseEntity with status 200 (OK) and valid body body if permission was successfully removed,
     * or 404 (Not Found) if permission was not found by given id or user group was not found by given name.
     */
    @DeleteMapping("/userGroups/{name}/permissions/{id}")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'DELETE', 'APPLICATION')")
    public ResponseEntity<?> removePermission(@PathVariable String name, @PathVariable String id) {
        accessControlManager.dissociatePermission(name, Permission.fromStringValue(id));
        return ResponseEntity.ok(null);
    }


    /**
     * GET /userGroups/:name/dashboardsMetadata : get all permission metadata for user group against dashboards and views
     *
     * @param name     name of user group
     * @param pageable the pagination information
     * @throws URISyntaxException exception
     * @return the ResponseEntity of status 200 (OK),
     * or status 404(Not found) if given user group is not found
     */
    @GetMapping("/userGroups/{name}/dashboardPermissions")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<List<GranteePermissionReport<UserGroup>>> getDashboardPermissionMetadataUserGroup(@PathVariable String name, @ApiParam Pageable pageable) throws URISyntaxException {
        final Page<Dashboard> dashboardPage = dashboardService.findAll(pageable);
        UserGroup userGroup = Optional.ofNullable(userGroupService.findOne(name))
            .orElseThrow(() -> new EntityNotFoundException(String.format("User group with name: %s was not found", name)));

        List<GranteePermissionReport<UserGroup>> body = dashboardPage
            .getContent()
            .stream()
            .map(x -> x.getGranteePermissionReport(userGroup))
            .collect(Collectors.toList());

        HttpHeaders headers = PaginationUtil.
            generatePaginationHttpHeaders(dashboardPage, "/api/userGroups/{name}/dashboardMetadata");
        return new ResponseEntity<>(body, headers, HttpStatus.OK);

    }

    @GetMapping("/userGroups/{name}/datasourcePermissions")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<List<GranteePermissionReport<UserGroup>>> getDatasourcePermissionMetadataUserGroup(@PathVariable String name, @ApiParam Pageable pageable) throws URISyntaxException {
        Page<Datasource> page = datasourceService.findAll(pageable);
        UserGroup userGroup = Optional.ofNullable(userGroupService.findOne(name))
                .orElseThrow(() -> new EntityNotFoundException(String.format("User group with name: %s was not found", name)));

        List<GranteePermissionReport<UserGroup>> body = page
                .getContent()
                .stream()
                .map(x -> x.getGranteePermissionReport(userGroup))
                .collect(Collectors.toList());

        HttpHeaders headers = PaginationUtil.
                generatePaginationHttpHeaders(page, "/api/userGroups/{name}/datasourcePermissions");
        return new ResponseEntity<>(body, headers, HttpStatus.OK);

    }

    @GetMapping("/userGroups/{name}/dashboardPermissions/{id}/viewPermissions")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<List<GranteePermissionReport<UserGroup>>> getViewPermissionMetadataUserGroup(@PathVariable String name, @PathVariable Long id,@ApiParam Pageable pageable) throws URISyntaxException {
        UserGroup userGroup = Optional.ofNullable(userGroupService.findOne(name))
            .orElseThrow(() ->
                new EntityNotFoundException(String.format("User group with name: %s was not found", name)));
        final Page<View> viewPage = viewService.findByDashboardId(id,pageable);
        List<GranteePermissionReport<UserGroup>> body = viewPage.getContent()
            .stream()
            .map(x -> x.getGranteePermissionReport(userGroup))
            .collect(Collectors.toList());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(viewPage, "/api/users/{login}/datasourcePermissions/{id}/viewPermissions");
        return new ResponseEntity<>(body, headers, HttpStatus.OK);
    }


    @GetMapping("/userGroups/{name}/dashboardPermissions/search")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<List<DashboardGranteePermissionReport<UserGroup>>> searchDashboardPermissionMetadataUser(@QuerydslPredicate(root = Dashboard.class) Predicate predicate, @PathVariable String name, @ApiParam Pageable pageable) throws URISyntaxException {
        Page<Dashboard> dashboardPage = dashboardService.findAllByPrincipalPermissions(pageable, predicate);
        UserGroup userGroup = Optional.ofNullable(userGroupService.findOne(name))
                .orElseThrow(() ->
                        new EntityNotFoundException(String.format("User group with name: %s was not found", name)));
        List<DashboardGranteePermissionReport<UserGroup>> dashboardPermissions = new ArrayList<>();
        for(Dashboard dashboard : dashboardPage.getContent()){
            List<GranteePermissionReport<UserGroup>> viewPermissions = viewService
                    .findByDashboardId(dashboard.getId())
                    .stream()
                    .map(x -> x.getGranteePermissionReport(userGroup))
                    .collect(Collectors.toList());
            dashboardPermissions.add(dashboard.getDashboardGranteePermissionReport(userGroup,viewPermissions));
        }
        return ResponseEntity.ok(dashboardPermissions);
    }

    @GetMapping("/userGroups/{groupName}/datasourcePermissions/search")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<List<GranteePermissionReport<UserGroup>>> searchDatasourcePermissions(@QuerydslPredicate(root = Datasource.class) Predicate predicate,
                                                                                                @PathVariable String groupName,
                                                                                                @ApiParam Pageable pageable) {
        Page<Datasource> page = datasourceService.findAll(predicate, pageable);
        UserGroup userGroup = Optional.ofNullable(userGroupService.findOne(groupName))
                .orElseThrow(() ->
                        new EntityNotFoundException(String.format("User group with name: %s was not found", groupName)));
        List<GranteePermissionReport<UserGroup>> body = page
                .getContent()
                .stream()
                .map(x -> x.getGranteePermissionReport(userGroup))
                .collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }


    @GetMapping("/userGroups/{name}/viewPermissions/search")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<List<DashboardGranteePermissionReport<UserGroup>>> searchViewPermissionMetadataUser(@QuerydslPredicate(root = View.class) Predicate predicate, @PathVariable String name) throws URISyntaxException {
        List<View> views = viewService.findAllByPrincipalPermissions(predicate);
        UserGroup userGroup = Optional.ofNullable(userGroupService.findOne(name))
                .orElseThrow(() ->
                        new EntityNotFoundException(String.format("User group with name: %s was not found", name)));
        List<DashboardGranteePermissionReport<UserGroup>> dashboardPermissions = new ArrayList<DashboardGranteePermissionReport<UserGroup>>();
        for (View view : views) {
            List<GranteePermissionReport<UserGroup>> viewPermissions = new ArrayList<GranteePermissionReport<UserGroup>>();
            Dashboard dashboard = view.getViewDashboard();
            viewPermissions.add(view.getGranteePermissionReport(userGroup));
            dashboardPermissions.add(dashboard.getDashboardGranteePermissionReport(userGroup,viewPermissions));
        }
        return ResponseEntity.ok(dashboardPermissions);
    }

    @PutMapping("/userGroups/{name}/changePermissions")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'UPDATE', 'APPLICATION')")
    public ResponseEntity<Void> changePermissions(@PathVariable String name, @RequestBody List<ChangePermissionVM> changePermissionVMS) {
        changePermissionVMS
                .forEach(x -> {
                    if (x.getAction() == ChangePermissionVM.Action.ADD) {
                        accessControlManager.assignPermission(name, Permission.fromStringValue(x.getId()));
                    } else {
                        accessControlManager.dissociatePermission(name, Permission.fromStringValue(x.getId()));
                    }
                });

        return ResponseEntity.ok().build();
    }

    @GetMapping("/userGroups/search")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('USER-GROUP', 'READ', 'APPLICATION')")
    public ResponseEntity<List<UserGroupInfo>> search(@ApiParam Pageable pageable,
                                                          @QuerydslPredicate(root = UserGroup.class) Predicate predicate)
            throws URISyntaxException {
        UserGroupPageInfo info = userGroupService.findAll(predicate, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(info.getPage(), "/api/userGroups");
        return new ResponseEntity<>(info.getResults(), headers, HttpStatus.OK);
    }

}