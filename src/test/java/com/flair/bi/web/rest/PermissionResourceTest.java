package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.domain.User;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.service.HierarchyService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.security.UserGroupService;
import com.flair.bi.web.rest.vm.ManagedUserVM;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import java.util.Arrays;
import java.util.Optional;

import static com.flair.bi.domain.enumeration.InputType.TEXT;
import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;

@Ignore
public class PermissionResourceTest extends AbstractIntegrationTest {

	@MockBean
	AccessControlManager accessControlManager;
	@MockBean
	UserGroupService userGroupService;
	@MockBean
	UserService userService;

	@Test
	public void addPermissionToUserGroup() {
		UserGroup group = new UserGroup();
		group.setName("someGroup");
		when(userGroupService.findOne(eq("someGroup"))).thenReturn(group);

		ResponseEntity<UserGroup> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/permissions/some_perm_ission/userGroups/someGroup",
						HttpMethod.PUT,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						UserGroup.class);

		verify(accessControlManager, times(1)).assignPermission(eq("someGroup"), any(Permission.class));

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("someGroup", response.getBody().getName());
	}

	@Test
	public void removePermissionFromUserGroup() {
		UserGroup group = new UserGroup();
		group.setName("someGroup");
		when(userGroupService.findOne(eq("someGroup"))).thenReturn(group);

		ResponseEntity<UserGroup> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/permissions/some_perm_ission/userGroups/someGroup",
						HttpMethod.DELETE,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						UserGroup.class);

		verify(accessControlManager, times(1)).dissociatePermission(eq("someGroup"), any(Permission.class));

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("someGroup", response.getBody().getName());

	}

	@Test
	public void addPermission() {
		User user = new User();
		user.setLogin("someLogin");
		when(userService.getUserWithAuthoritiesByLogin(eq("login"))).thenReturn(Optional.of(user));

		ResponseEntity<ManagedUserVM> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/permissions/some_perm_ission/users/login",
						HttpMethod.PUT,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						ManagedUserVM.class);

		verify(accessControlManager, times(1)).grantAccess(eq("login"), any(Permission.class));

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("somelogin", response.getBody().getLogin());
	}

	@Test
	public void removePermission() {
		User user = new User();
		user.setLogin("someLogin");
		when(userService.getUserWithAuthoritiesByLogin(eq("login"))).thenReturn(Optional.of(user));

		ResponseEntity<ManagedUserVM> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/permissions/some_perm_ission/users/login",
						HttpMethod.DELETE,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						ManagedUserVM.class);

		verify(accessControlManager, times(1)).revokeAccess(eq("login"), any(Permission.class));

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("somelogin", response.getBody().getLogin());
	}
}