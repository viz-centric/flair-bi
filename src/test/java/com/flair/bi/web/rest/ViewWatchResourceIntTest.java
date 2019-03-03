package com.flair.bi.web.rest;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import javax.inject.Inject;
import javax.persistence.EntityManager;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import com.flair.bi.FlairbiApp;
import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.ViewWatchService;
import com.flair.bi.view.ViewService;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = FlairbiApp.class)
public class ViewWatchResourceIntTest {

	@Inject
	private ViewWatchService viewWatchService;
	
	private MockMvc restViewWatchMockMvc;
	
    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;
    
    @Inject
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;
    
    @Inject
    private EntityManager em;

    private MockMvc restReleasesMockMvc;
    
    @Inject
    private DashboardService dashboardService;

    @Inject
    private UserService userService;
    
    @Inject
    private ViewService viewService;
	
    private View view;
    
    private User user;
    
    private static final int WATCH_COUNT=1;
    
    @Inject
    private AccessControlManager accessControlManager;
	
    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ViewWatchResource viewWatchResource = new ViewWatchResource(viewWatchService);
        ReflectionTestUtils.setField(viewWatchResource, "viewWatchService", viewWatchService);
        this.restViewWatchMockMvc = MockMvcBuilders.standaloneSetup(viewWatchResource)
            .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }
    
    public static User createUser(UserService userService) {
        return userService.createUser("dash-admin", "dash-admin", "pera", "pera", "admi1@localhost", "en", "test");
    }

    @Before
    public void initTest() {
        view = ViewResourceIntTest.createEntity(em, dashboardService);
        user = createUser(userService);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("dash-admin", "dash-admin"));
    }
    
    @Test
    @Transactional 
    public void getViewWatches() throws Exception{
    	View recentCreatedView=viewService.save(view);
        viewWatchService.saveViewWatch("dash-admin", recentCreatedView);
        accessControlManager.grantAccess("dash-admin", view.getPermissions());
        
        restViewWatchMockMvc.perform(get("/api/viewWatches?sort=watchTime,desc&page=0&size=5"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
		.andExpect(jsonPath("$.[*].watchCount").value(hasItem(WATCH_COUNT)))
        .andExpect(jsonPath("$.[*].view.id").value(hasItem(recentCreatedView.getId().intValue())))
        .andExpect(jsonPath("$.[*].user.login").value(hasItem("dash-admin")));
    }
    
}
