package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.FlairbiApp;
import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.config.Constants;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.User;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.MailService;
import com.flair.bi.service.UserService;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.vm.ChangePermissionVM;
import com.flair.bi.web.rest.vm.ChangePermissionVM.Action;
import com.flair.bi.web.rest.vm.ManagedUserVM;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import javax.inject.Inject;
import javax.persistence.EntityManager;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;


/**
 * Test class for the UserResource REST controller.
 *
 * @see UserResource
 */
public class UserResourceIntTest extends AbstractIntegrationTest{

    @Inject
    private UserRepository userRepository;

    @Inject
    private UserService userService;

    @Mock
    private MailService mailService;

    @Inject
    private DashboardService dashboardService;

    @Inject
    private ViewService viewService;

    private MockMvc restUserMockMvc;

    @Mock
    private AccessControlManager accessControlManager;
    
    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;
    
    @Inject
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;
    
    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;
   
    @Inject
    private EntityManager em;
    
    private static final String LOGIN = "test";
    private static final String FIRST_NAME = "test";
    private static final String LAST_NAME = "test";
    private static final String PASSWORD = "test";
    private static final String LANG_KEY = "en";
    private static final String EMAIL = "test@test.com";
    private static final Boolean ACTIVATED = true;
    private static final String ROLE_NAME = "ROLE_USER";
    private static final String USER_TYPE = "test";
    
    private static final String UPDATED_LOGIN = "test1";
    private static final String UPDATED_FIRST_NAME = "test1";
    private static final String UPDATED_LAST_NAME = "test1";
    private static final String UPDATED_PASSWORD = "test1";
    private static final String UPDATED_LANG_KEY = "fr";
    private static final String UPDATED_EMAIL = "test1@test1.com";
    private static final String UPDATED_ROLE_NAME = "ROLE_ADMIN";
    private static final String UPDATED_USER_TYPE = "test1";
    
    private ManagedUserVM managedUserVM;

    /**
     * Create a User.
     * <p>
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which has a required relationship to the User entity.
     */
    public static User createEntity(UserService userService) {
        return userService.createUser(LOGIN,PASSWORD,FIRST_NAME,LAST_NAME,EMAIL,LANG_KEY,USER_TYPE);
    }
    
    public ManagedUserVM createManagedUserVM(){
    	User user = new User();
    	user.setLogin(LOGIN);
    	user.setEmail(EMAIL);
    	user.setFirstName(FIRST_NAME);
    	user.setLastName(LAST_NAME);
    	user.setActivated(ACTIVATED);
    	user.setLangKey(LANG_KEY);
    	UserGroup UserGroups= new UserGroup();
    	UserGroups.setName(ROLE_NAME);
    	return new ManagedUserVM(user);
    }
    
    public ManagedUserVM updateManagedUserVM(Long id){
    	User user = new User();
    	user.setLogin(UPDATED_LOGIN);
    	user.setEmail(UPDATED_EMAIL);
    	user.setFirstName(UPDATED_FIRST_NAME);
    	user.setLastName(UPDATED_LAST_NAME);
    	user.setActivated(ACTIVATED);
    	user.setLangKey(UPDATED_LANG_KEY);
    	UserGroup UserGroups= new UserGroup();
    	UserGroups.setName(UPDATED_ROLE_NAME);
    	user.setId(id);
    	return new ManagedUserVM(user);
    }

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        UserResource userResource = new UserResource(userRepository, mailService, userService, dashboardService, viewService, accessControlManager);
        ReflectionTestUtils.setField(userResource, "userRepository", userRepository);
        ReflectionTestUtils.setField(userResource, "userService", userService);        
        this.restUserMockMvc = MockMvcBuilders.standaloneSetup(userResource)
                .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
                .setMessageConverters(jacksonMessageConverter).build();
    }
    
    @Before
    public void initTest() {
    	managedUserVM = createManagedUserVM();
    }

    @Test
    public void testGetExistingUser() throws Exception {

        userService.createUser("admin", "test", "firstName", "lastName", "test@gmail.com", "en", "test");

        restUserMockMvc.perform(get("/api/users/admin")
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.login").value("admin"))
            .andExpect(jsonPath("$.email").value("test@gmail.com"))
            .andExpect(jsonPath("$.firstName").value("firstName"))
            .andExpect(jsonPath("$.lastName").value("lastName"));
    }

    @Test
    public void testGetUnknownUser() throws Exception {
        restUserMockMvc.perform(get("/api/users/unknown")
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());
    }
    
    @Test
    @Transactional
    public void createNewUser() throws Exception {
        restUserMockMvc.perform(post("/api/users")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.login").value(LOGIN))
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.firstName").value(FIRST_NAME))
                .andExpect(jsonPath("$.lastName").value(LAST_NAME))
                .andExpect(jsonPath("$.langKey").value(LANG_KEY));
        
    }
    
    @Test
    @Transactional
    public void updateUser() throws Exception {
    	User user=createEntity(userService);
    	restUserMockMvc.perform(put("/api/users")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(updateManagedUserVM(user.getId()))))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.login").value(UPDATED_LOGIN))
                .andExpect(jsonPath("$.email").value(UPDATED_EMAIL))
                .andExpect(jsonPath("$.firstName").value(UPDATED_FIRST_NAME))
                .andExpect(jsonPath("$.lastName").value(UPDATED_LAST_NAME))
                .andExpect(jsonPath("$.langKey").value(UPDATED_LANG_KEY));
        
    }
    
    @Test
    @Transactional
    public void getAllUsers() throws Exception {
    	createEntity(userService);
    	restUserMockMvc.perform(get("/api/users?sort=id,desc&page=0&size=5"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
        .andExpect(jsonPath("$.[*].login").value(hasItem(LOGIN)))
        .andExpect(jsonPath("$.[*].email").value(hasItem(EMAIL)))
        .andExpect(jsonPath("$.[*].firstName").value(hasItem(FIRST_NAME)))
        .andExpect(jsonPath("$.[*].lastName").value(hasItem(LAST_NAME)))
        .andExpect(jsonPath("$.[*].langKey").value(hasItem(LANG_KEY)));
        
    }
    
    @Test
    @Transactional
    public void getUser() throws Exception {
    	createEntity(userService);    	
    	restUserMockMvc.perform(get("/api/users/{login:" + Constants.LOGIN_REGEX + "}",LOGIN))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
        .andExpect(jsonPath("$.login").value(LOGIN))
        .andExpect(jsonPath("$.email").value(EMAIL))
        .andExpect(jsonPath("$.firstName").value(FIRST_NAME))
        .andExpect(jsonPath("$.lastName").value(LAST_NAME))
        .andExpect(jsonPath("$.langKey").value(LANG_KEY));
    }
    
    @Test
    @Transactional
    public void deleteUser() throws Exception {
    	createEntity(userService);
        int databaseSizeBeforeDelete = userRepository.findAll().size();
    	restUserMockMvc.perform(delete("/api/users/{login:" + Constants.LOGIN_REGEX + "}", LOGIN)
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());
        List<User> users = userRepository.findAll();
        assertThat(users).hasSize(databaseSizeBeforeDelete - 1);
    }
    
    @Test
    @Transactional
    public void getDashboardPermissionMetadataUser() throws Exception {
    	createEntity(userService);
        Dashboard entity = DashboardResourceIntTest.createEntity(em, dashboardService);
        Dashboard dashboard=dashboardService.save(entity);
    	restUserMockMvc.perform(get("/api/users/{login:" + Constants.LOGIN_REGEX + "}/dashboardPermissions?sort=id,desc&page=0&size=5",LOGIN))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
        .andExpect(jsonPath("$.[*].grantee.createdBy").value(hasItem("system")))
        .andExpect(jsonPath("$.[*].grantee.email").value(hasItem(EMAIL)))
        .andExpect(jsonPath("$.[*].info.dashboardName").value(hasItem(dashboard.getDashboardName())))
        .andExpect(jsonPath("$.[*].info.id").value(hasItem(dashboard.getId().intValue())));
    }
    
    @Test
    @Transactional
    public void changePermissions() throws Exception {
    	createEntity(userService);
        Dashboard entity = DashboardResourceIntTest.createEntity(em, dashboardService);
        Dashboard dashboard=dashboardService.save(entity);
    	ChangePermissionVM changePermissionVM= new ChangePermissionVM();
    	changePermissionVM.setId("UPDATE_"+dashboard.getId()+"_DASHBOARD");
    	changePermissionVM.setAction(Action.REMOVE);
    	List<ChangePermissionVM> permissionVMS = new ArrayList<ChangePermissionVM>();
    	permissionVMS.add(changePermissionVM);
    	restUserMockMvc.perform(put("/api/users/{login:" + Constants.LOGIN_REGEX + "}/changePermissions",LOGIN)
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(permissionVMS)))
                .andExpect(status().isOk());
    }
    
    @Test
    @Transactional
    public void searchUsers() throws Exception {
    	createEntity(userService);
    	restUserMockMvc.perform(get("/api/users/search?sort=id,desc&page=0&size=5&login="+LOGIN))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
        .andExpect(jsonPath("$.[*].login").value(hasItem(LOGIN)))
        .andExpect(jsonPath("$.[*].email").value(hasItem(EMAIL)))
        .andExpect(jsonPath("$.[*].firstName").value(hasItem(FIRST_NAME)))
        .andExpect(jsonPath("$.[*].lastName").value(hasItem(LAST_NAME)))
        .andExpect(jsonPath("$.[*].langKey").value(hasItem(LANG_KEY)));
    }
    
    
}
