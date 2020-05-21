package com.flair.bi.web.rest;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.persistence.EntityManager;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Mock;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.View;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.security.PermissionService;
import com.flair.bi.service.security.UserGroupService;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.vm.ChangePermissionVM;
import com.flair.bi.web.rest.vm.ChangePermissionVM.Action;

@Ignore
public class UserGroupResourceIntTest extends AbstractIntegrationTest {

	@Inject
	private UserGroupService userGroupService;

	@Inject
	private PermissionService permissionService;

	@Inject
	private DashboardService dashboardService;

	@Inject
	private ViewService viewService;

	@Mock
	private AccessControlManager accessControlManager;

	@Inject
	private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

	@Inject
	private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;

	@Inject
	private MappingJackson2HttpMessageConverter jacksonMessageConverter;

	private MockMvc restUserGroupMockMvc;

	private UserGroup userGroup;

	private static final String ROLE_NAME = "ROLE_ACCOUNT";

	private static final String UPDATED_ROLE_NAME = "ROLE_SALES";

	private static final String ROLE_ADMIN = "ROLE_ADMIN";

	private static final String PERMISSION_ID = "DASHBOARDS_WRITE_APPLICATION";

	@Inject
	private EntityManager em;

	@Before
	public void setup() {
		UserGroupResource userGroupResource = new UserGroupResource(userGroupService, dashboardService, viewService,
				accessControlManager);
		ReflectionTestUtils.setField(userGroupResource, "userGroupService", userGroupService);
		this.restUserGroupMockMvc = MockMvcBuilders.standaloneSetup(userGroupResource)
				.setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
				.setMessageConverters(jacksonMessageConverter).build();
	}

	public UserGroup createEntity(String name) {
		userGroup = new UserGroup();
		userGroup.setName(name);
		return userGroup;
	}

	@Before
	public void initTest() {
		userGroup = createEntity(ROLE_NAME);
	}

	@Test
	public void createUserGroup() throws Exception {
		restUserGroupMockMvc
				.perform(post("/api/userGroups").contentType(TestUtil.APPLICATION_JSON_UTF8)
						.content(TestUtil.convertObjectToJsonBytes(userGroup)))
				.andExpect(status().isCreated()).andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.name").value(ROLE_NAME));

	}

	@Test
	@Transactional
	public void updateUserGroup() throws Exception {
		restUserGroupMockMvc
				.perform(put("/api/userGroups").contentType(TestUtil.APPLICATION_JSON_UTF8)
						.content(TestUtil.convertObjectToJsonBytes(createEntity(UPDATED_ROLE_NAME))))
				.andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.name").value(UPDATED_ROLE_NAME));

	}

	@Test
	@Transactional
	public void getAllUserGroups() throws Exception {
		restUserGroupMockMvc.perform(get("/api/userGroups?page=0&size=5")).andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.[*].name").value(hasItem(ROLE_ADMIN)));

	}

	@Test
	@Transactional
	public void getUserGroup() throws Exception {
		restUserGroupMockMvc.perform(get("/api/userGroups", ROLE_ADMIN)).andExpect(status().isOk());
	}

	@Test
	@Transactional
	public void deleteUserGroup() throws Exception {
		userGroupService.save(userGroup);
		restUserGroupMockMvc.perform(delete("/api/userGroups/{name}", ROLE_NAME).accept(TestUtil.APPLICATION_JSON_UTF8))
				.andExpect(status().isOk());
	}

	@Test
	@Transactional
	public void addPermission() throws Exception {
		userGroupService.save(userGroup);
		restUserGroupMockMvc.perform(post("/api/userGroups/{name}/permissions/{id}", ROLE_NAME, PERMISSION_ID)
				.contentType(TestUtil.APPLICATION_JSON_UTF8)).andExpect(status().isOk());

	}

	@Test
	@Transactional
	public void removePermission() throws Exception {
		userGroupService.save(userGroup);
		restUserGroupMockMvc.perform(delete("/api/userGroups/{name}/permissions/{id}", ROLE_NAME, PERMISSION_ID)
				.contentType(TestUtil.APPLICATION_JSON_UTF8)).andExpect(status().isOk());

	}

	@Test
	@Transactional
	public void getDashboardPermissionMetadataUserGroup() throws Exception {
		Dashboard entity = DashboardResourceIntTest.createEntity(em, dashboardService);
		Dashboard dashboard = dashboardService.save(entity);
		restUserGroupMockMvc
				.perform(get("/api/userGroups/{name}/dashboardPermissions?page=0&size=20&id=" + dashboard.getId(),
						ROLE_ADMIN))
				.andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.[*].grantee.name").value(hasItem(ROLE_ADMIN)))
				.andExpect(jsonPath("$.[*].info.dashboardName").value(hasItem(dashboard.getDashboardName())))
				.andExpect(jsonPath("$.[*].info.id").value(hasItem(dashboard.getId().intValue())));

	}

	@Test
	@Transactional
	public void getViewPermissionMetadataUserGroup() throws Exception {
		Dashboard entity = DashboardResourceIntTest.createEntity(em, dashboardService);
		Dashboard dashboard = dashboardService.save(entity);
		View dashboardView = null;
		for (View view : dashboard.getDashboardViews()) {
			dashboardView = view;
			break;
		}
		restUserGroupMockMvc
				.perform(get("/api/userGroups/{name}/dashboardPermissions/{id}/viewPermissions", ROLE_ADMIN,
						dashboard.getId()))
				.andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.[*].grantee.name").value(hasItem(ROLE_ADMIN)))
				.andExpect(jsonPath("$.[*].info.viewName").value(hasItem(dashboardView.getViewName())))
				.andExpect(jsonPath("$.[*].info.id").value(hasItem(dashboardView.getId().intValue())));

	}

	@Test
	@Transactional
	public void changePermissionsAddAction() throws Exception {
		Dashboard entity = DashboardResourceIntTest.createEntity(em, dashboardService);
		Dashboard dashboard = dashboardService.save(entity);
		ChangePermissionVM changePermissionVM = new ChangePermissionVM();
		changePermissionVM.setId("WRITE" + dashboard.getId() + "_DASHBOARD");
		changePermissionVM.setAction(Action.ADD);
		List<ChangePermissionVM> permissionVMS = new ArrayList<ChangePermissionVM>();
		restUserGroupMockMvc.perform(put("/api/userGroups/{name}/changePermissions", ROLE_ADMIN)
				.contentType(TestUtil.APPLICATION_JSON_UTF8).content(TestUtil.convertObjectToJsonBytes(permissionVMS)))
				.andExpect(status().isOk());

	}

	@Test
	@Transactional
	public void changePermissionsRemoveAction() throws Exception {
		Dashboard entity = DashboardResourceIntTest.createEntity(em, dashboardService);
		Dashboard dashboard = dashboardService.save(entity);
		ChangePermissionVM changePermissionVM = new ChangePermissionVM();
		changePermissionVM.setId("REMOVE" + dashboard.getId() + "_DASHBOARD");
		changePermissionVM.setAction(Action.REMOVE);
		List<ChangePermissionVM> permissionVMS = new ArrayList<ChangePermissionVM>();
		restUserGroupMockMvc.perform(put("/api/userGroups/{name}/changePermissions", ROLE_ADMIN)
				.contentType(TestUtil.APPLICATION_JSON_UTF8).content(TestUtil.convertObjectToJsonBytes(permissionVMS)))
				.andExpect(status().isOk());

	}

}
