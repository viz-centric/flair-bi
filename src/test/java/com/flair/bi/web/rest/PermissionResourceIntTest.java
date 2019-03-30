package com.flair.bi.web.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import javax.inject.Inject;
import javax.persistence.EntityManager;

import com.flair.bi.AbstractIntegrationTest;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
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

import com.flair.bi.FlairbiApp;
import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.config.Constants;
import com.flair.bi.domain.User;
import com.flair.bi.service.UserService;
import com.flair.bi.service.security.UserGroupService;

@Ignore
public class PermissionResourceIntTest extends AbstractIntegrationTest {
	
    @Inject
    private UserGroupService userGroupService;
    
    @Inject
    private  UserService userService;
    
    @Mock
    private AccessControlManager accessControlManager;
    
    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;
    
    @Inject
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;
    
    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;
   
    private MockMvc restPermissionMockMvc;
    
    private static final String ROLE_DEVELOPMENT = "ROLE_DEVELOPMENT";
    
    private static final String PERMISSION_ID="DASHBOARDS_WRITE_APPLICATION";
        
    @Inject
    private EntityManager em;
    
    @Before
    public void setup() {
    	PermissionResource permissionResource = new PermissionResource( userGroupService, userService,  accessControlManager);
        ReflectionTestUtils.setField(permissionResource, "accessControlManager", accessControlManager);     
        this.restPermissionMockMvc = MockMvcBuilders.standaloneSetup(permissionResource)
                .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
                .setMessageConverters(jacksonMessageConverter).build();
    }
    
    
    @Test
    @Transactional
    public void addPermissionToUserGroup() throws Exception {
        restPermissionMockMvc.perform(put("/api/permissions/{permission}/userGroups/{userGroup}",PERMISSION_ID,ROLE_DEVELOPMENT))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.name").value(ROLE_DEVELOPMENT));
    	
    }
    
    @Test
    @Transactional
    public void removePermissionFromUserGroup() throws Exception {
    	restPermissionMockMvc.perform(delete("/api/permissions/{permission}/userGroups/{userGroup}",PERMISSION_ID,ROLE_DEVELOPMENT))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.name").value(ROLE_DEVELOPMENT));
                
    }
   

    @Test
    @Transactional
    public void addPermission() throws Exception {
    	User user = UserResourceIntTest.createEntity(userService);
    	restPermissionMockMvc.perform(put("/api/permissions/{id}/users/{login:" + Constants.LOGIN_REGEX + "}",PERMISSION_ID,user.getLogin()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.login").value(user.getLogin()))
                .andExpect(jsonPath("$.email").value(user.getEmail()))
                .andExpect(jsonPath("$.firstName").value(user.getFirstName()))
                .andExpect(jsonPath("$.lastName").value(user.getLastName()))
                .andExpect(jsonPath("$.langKey").value(user.getLangKey()));
                
    }
    
    @Test
    @Transactional
    public void removePermission() throws Exception {
    	User user = UserResourceIntTest.createEntity(userService);
    	restPermissionMockMvc.perform(delete("/api/permissions/{id}/users/{login:" + Constants.LOGIN_REGEX + "}",PERMISSION_ID,user.getLogin()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.login").value(user.getLogin()))
                .andExpect(jsonPath("$.email").value(user.getEmail()))
                .andExpect(jsonPath("$.firstName").value(user.getFirstName()))
                .andExpect(jsonPath("$.lastName").value(user.getLastName()))
                .andExpect(jsonPath("$.langKey").value(user.getLangKey()));
                
    }
    

}
