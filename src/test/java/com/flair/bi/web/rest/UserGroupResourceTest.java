package com.flair.bi.web.rest;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.View;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.security.UserGroupService;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.vm.ChangePermissionVM;

@Ignore
public class UserGroupResourceTest extends AbstractIntegrationTest {

	@MockBean
	UserGroupService userGroupService;
	@MockBean
	AccessControlManager accessControlManager;
	@MockBean
	DashboardService dashboardService;
	@MockBean
	ViewService viewService;

	@Test
	public void createUserGroup() {
		UserGroup userGroup1 = new UserGroup("userGroup1");

		when(userGroupService.save(userGroup1)).thenReturn(userGroup1);

		ResponseEntity<UserGroup> response = restTemplate.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/userGroups", HttpMethod.POST, new HttpEntity<>(userGroup1), UserGroup.class);

		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals("userGroup1", response.getBody().getName());
	}

	@Test
	public void createUserGroupFails() {
		UserGroup userGroup1 = new UserGroup("userGroup1");
		when(userGroupService.findOne("userGroup1")).thenReturn(userGroup1);

		when(userGroupService.save(userGroup1)).thenReturn(userGroup1);

		ResponseEntity<UserGroup> response = restTemplate.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/userGroups", HttpMethod.POST, new HttpEntity<>(userGroup1), UserGroup.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertNull(response.getBody());
	}

	@Test
	public void updateUserGroup() {
		UserGroup userGroup1 = new UserGroup("userGroup1");
		when(userGroupService.save(userGroup1)).thenReturn(userGroup1);

		ResponseEntity<UserGroup> response = restTemplate.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/userGroups", HttpMethod.PUT, new HttpEntity<>(userGroup1), UserGroup.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("userGroup1", response.getBody().getName());
	}

	@Test
	public void getAllUserGroups() {
		UserGroup userGroup = new UserGroup();
		userGroup.setName("userGroup1");

		when(userGroupService.findAll()).thenReturn(Arrays.asList(userGroup));

		ResponseEntity<String[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/userGroups/all", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				String[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("userGroup1", response.getBody()[0]);
	}

	@Test
	public void getAllUserGroups1() {
		UserGroup userGroup = new UserGroup();
		userGroup.setName("userGroup1");

		when(userGroupService.findAll(any(Pageable.class))).thenReturn(new PageImpl(Arrays.asList(userGroup)));

		ResponseEntity<UserGroup[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/userGroups", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				UserGroup[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("userGroup1", response.getBody()[0].getName());
	}

	@Test
	public void getUserGroup() {
		UserGroup userGroup = new UserGroup();
		userGroup.setName("userGroup1");

		when(userGroupService.findOne(eq("superman"))).thenReturn(userGroup);

		ResponseEntity<UserGroup> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/userGroups/superman", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				UserGroup.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("userGroup1", response.getBody().getName());
	}

	@Test
	public void deleteUserGroup() {
		UserGroup userGroup = new UserGroup();
		userGroup.setName("userGroup1");

		when(userGroupService.findOne(eq("superman"))).thenReturn(userGroup);

		when(userGroupService.isNotPredefinedGroup(eq("superman"))).thenReturn(true);

		ResponseEntity<UserGroup> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/userGroups/superman", HttpMethod.DELETE, new HttpEntity<>(new LinkedMultiValueMap<>()),
				UserGroup.class);

		verify(userGroupService, times(1)).delete(eq("superman"));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void deleteUserGroupNotPredefined() {
		UserGroup userGroup = new UserGroup();
		userGroup.setName("userGroup1");

		when(userGroupService.isNotPredefinedGroup(eq("superman"))).thenReturn(false);

		ResponseEntity<String> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/userGroups/superman", HttpMethod.DELETE, new HttpEntity<>(new LinkedMultiValueMap<>()),
				String.class);

		verify(userGroupService, times(0)).delete(eq("superman"));

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
	}

	@Test
	public void addPermission() {
		ResponseEntity<String> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/userGroups/superman/permissions/cool_permis_sion", HttpMethod.POST,
				new HttpEntity<>(new LinkedMultiValueMap<>()), String.class);

		verify(accessControlManager, times(1)).assignPermission(eq("superman"), any(Permission.class));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void removePermission() {
		ResponseEntity<String> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/userGroups/superman/permissions/cool_permis_sion", HttpMethod.DELETE,
				new HttpEntity<>(new LinkedMultiValueMap<>()), String.class);

		verify(accessControlManager, times(1)).dissociatePermission(eq("superman"), any(Permission.class));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void getDashboardPermissionMetadataUserGroup() {
		Dashboard dashboard = new Dashboard();
		dashboard.setDashboardName("dashboard name");
		dashboard.setId(10L);
		when(dashboardService.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(Arrays.asList(dashboard)));

		UserGroup group = new UserGroup();
		group.setName("superman");
		when(userGroupService.findOne(eq("superman"))).thenReturn(group);

		ResponseEntity<List> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/userGroups/superman/dashboardPermissions", HttpMethod.GET,
				new HttpEntity<>(new LinkedMultiValueMap<>()), List.class);

		List body = response.getBody();
		Map item = (Map) body.get(0);
		Map grantee = (Map) item.get("grantee");
		Map info = (Map) item.get("info");

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("superman", grantee.get("name"));
		assertEquals("dashboard name", info.get("dashboardName"));
	}

	@Test
	public void getViewPermissionMetadataUserGroup() {
		View view = new View();
		view.setId(19L);
		when(viewService.findByDashboardId(eq(7L))).thenReturn(Arrays.asList(view));

		UserGroup group = new UserGroup();
		group.setName("superman");
		when(userGroupService.findOne(eq("superman"))).thenReturn(group);

		ResponseEntity<List> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/userGroups/superman/dashboardPermissions/7/viewPermissions", HttpMethod.GET,
				new HttpEntity<>(new LinkedMultiValueMap<>()), List.class);

		List body = response.getBody();
		Map item = (Map) body.get(0);
		Map grantee = (Map) item.get("grantee");
		Map info = (Map) item.get("info");

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("superman", grantee.get("name"));
		assertEquals(19, (int) info.get("id"));
	}

	@Test
	public void changePermissions() {
		ChangePermissionVM vm = new ChangePermissionVM();
		vm.setAction(ChangePermissionVM.Action.ADD);
		vm.setId("one_two_three");

		ChangePermissionVM vm2 = new ChangePermissionVM();
		vm2.setAction(ChangePermissionVM.Action.REMOVE);
		vm2.setId("three_four_five");

		ResponseEntity<String> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/userGroups/superman/changePermissions", HttpMethod.PUT,
				new HttpEntity<>(Arrays.asList(vm, vm2)), String.class);

		verify(accessControlManager, times(1)).assignPermission(eq("superman"), any(Permission.class));
		verify(accessControlManager, times(1)).dissociatePermission(eq("superman"), any(Permission.class));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}
}