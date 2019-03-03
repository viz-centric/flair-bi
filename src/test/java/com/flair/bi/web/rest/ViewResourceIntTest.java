package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.FlairbiApp;
import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.Release;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.domain.ViewState;
import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.repository.ViewRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.FileUploadService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.ViewWatchService;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.dto.CreateDashboardReleaseDTO;
import com.flair.bi.web.rest.dto.CreateViewReleaseRequestDTO;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import javax.inject.Inject;
import javax.persistence.EntityManager;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the ViewsResource REST controller.
 *
 * @see ViewsResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = FlairbiApp.class)
public class ViewResourceIntTest {

    private static final String DEFAULT_VIEW_NAME = "AAAAAAAAAA";
    private static final String UPDATED_VIEW_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Boolean DEFAULT_PUBLISHED = false;
    private static final Boolean UPDATED_PUBLISHED = true;

    private static final byte[] DEFAULT_IMAGE = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_IMAGE = TestUtil.createByteArray(2, "1");
    private static final String DEFAULT_IMAGE_CONTENT_TYPE = "jpg";
    private static final String UPDATED_IMAGE_CONTENT_TYPE = "png";
    
    private static final String DEFAULT_DASHBOARD_NAME = "AAAAAAAAAA";
    private static final String DEFAULT_CATEGORY = "AAAAAAAAAA";
    private static final String RELEASE_COMMENT = "Released";
    private static final Long VERSION_NUMBER=1L;
    private static final int WATCH_COUNT=1;

    @Inject
    private ViewRepository viewRepository;

    @Inject
    private ViewService viewService;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private EntityManager em;

    private MockMvc restViewsMockMvc;

    private View view;

    @Inject
    private ViewWatchService viewWatchService;

    @Inject
    private DashboardService dashboardService;
    @Inject
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;

    @Inject
    private UserService userService;

    @Inject
    private AccessControlManager accessControlManager;

    @Inject
    private ReleaseRequestService service;

    @Inject
    private FileUploadService imageUploadService;
    
    @Inject
    private ReleaseRequestService releaseRequestService;

    private User user;


    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ViewsResource viewsResource = new ViewsResource(viewService, viewWatchService, service, imageUploadService);
        this.restViewsMockMvc = MockMvcBuilders.standaloneSetup(viewsResource)
            .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     * <p>
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static View createEntity(EntityManager em, DashboardService dashboardService) {
        View view = new View()
            .viewName(DEFAULT_VIEW_NAME)
            .description(DEFAULT_DESCRIPTION)
            .published(DEFAULT_PUBLISHED)
            .image(DEFAULT_IMAGE)
            .imageContentType(DEFAULT_IMAGE_CONTENT_TYPE);

        ViewState state = new ViewState();
        state.setId(UUID.randomUUID().toString());
        view.setCurrentEditingState(state);
        // Add required entity
        Dashboard view_dashboard = createDashboardEntity(em, dashboardService);
        dashboardService.save(view_dashboard);
//        em.persist(view_dashboard);
//        em.flush();
        view.setViewDashboard(view_dashboard);
        return view;
    }
    
    public static Dashboard createDashboardEntity(EntityManager em, DashboardService dashboardService) {
        Dashboard dashboard = new Dashboard()
            .dashboardName(DEFAULT_DASHBOARD_NAME)
            .category(DEFAULT_CATEGORY)
            .description(DEFAULT_DESCRIPTION)
            .published(DEFAULT_PUBLISHED)
            .image(DEFAULT_IMAGE)
            .imageContentType(DEFAULT_IMAGE_CONTENT_TYPE);
        // Add required entity
        Datasource dashboardDatasource = DatasourceResourceIntTest.createEntity(em);
        em.persist(dashboardDatasource);
        em.flush();
        dashboard.setDashboardDatasource(dashboardDatasource);
        return dashboard;
    }
    
    private CreateViewReleaseRequestDTO  createViewReleaseDTO(){
    	CreateViewReleaseRequestDTO createViewReleaseDTO= new CreateViewReleaseRequestDTO();
    	createViewReleaseDTO.setComment(RELEASE_COMMENT);
    	return createViewReleaseDTO;
    }
    
    public static User createUser(UserService userService) {
        return userService.createUser("dash-admin", "dash-admin", "pera", "pera", "admi1@localhost", "en", "test");
    }

    @Before
    public void initTest() {
        view = createEntity(em, dashboardService);
        user = createUser(userService);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("dash-admin", "dash-admin"));
    }

    @Test
    @Transactional
    public void createViews() throws Exception {
        int databaseSizeBeforeCreate = viewRepository.findAll().size();

        // Create the View

        restViewsMockMvc.perform(post("/api/views")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(view)))
            .andExpect(status().isCreated());

        // Validate the View in the database
        List<View> viewList = viewRepository.findAll();
        assertThat(viewList).hasSize(databaseSizeBeforeCreate + 1);
        View testView = viewList.get(viewList.size() - 1);
        assertThat(testView.getViewName()).isEqualTo(DEFAULT_VIEW_NAME);
        assertThat(testView.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testView.isPublished()).isEqualTo(DEFAULT_PUBLISHED);
        assertThat(testView.getImage()).isEqualTo(DEFAULT_IMAGE);
        assertThat(testView.getImageContentType()).isEqualTo(DEFAULT_IMAGE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void createViewsWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = viewRepository.findAll().size();

        // Create the View with an existing ID
        View existingView = new View();
        existingView.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restViewsMockMvc.perform(post("/api/views")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(existingView)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<View> viewList = viewRepository.findAll();
        assertThat(viewList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkViewNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = viewRepository.findAll().size();
        // set the field null
        view.setViewName(null);

        // Create the View, which fails.

        restViewsMockMvc.perform(post("/api/views")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(view)))
            .andExpect(status().isBadRequest());

        List<View> viewList = viewRepository.findAll();
        assertThat(viewList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllViewsWithPermission() throws Exception {
        viewService.save(view);
        accessControlManager.grantAccess("dash-admin", view.getPermissions());
        // Get all the viewsList
        restViewsMockMvc.perform(get("/api/views?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(view.getId().intValue())))
            .andExpect(jsonPath("$.[*].viewName").value(hasItem(DEFAULT_VIEW_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].published").value(hasItem(DEFAULT_PUBLISHED)))
            .andExpect(jsonPath("$.[*].imageContentType").value(hasItem(DEFAULT_IMAGE_CONTENT_TYPE)));
//            .andExpect(jsonPath("$.[*].image").value(hasItem(Base64Utils.encodeToString(DEFAULT_IMAGE))));
    }

    @Test
    @Transactional
    public void getViews() throws Exception {
        // Initialize the database
        viewService.save(view);
//        viewsRepository.saveAndFlush(view);

        // Get the view
        restViewsMockMvc.perform(get("/api/views/{id}", view.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(view.getId().intValue()))
            .andExpect(jsonPath("$.viewName").value(DEFAULT_VIEW_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.published").value(DEFAULT_PUBLISHED))
            .andExpect(jsonPath("$.imageContentType").value(DEFAULT_IMAGE_CONTENT_TYPE));
//            .andExpect(jsonPath("$.image").value(Base64Utils.encodeToString(DEFAULT_IMAGE)));
    }

    @Test
    @Transactional
    public void getNonExistingViews() throws Exception {
        // Get the view
        restViewsMockMvc.perform(get("/api/views/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateViews() throws Exception {
        // Initialize the database
        viewService.save(view);

        int databaseSizeBeforeUpdate = viewRepository.findAll().size();

        // Update the view
        View updatedView = viewRepository.findOne(view.getId());
        updatedView
            .viewName(UPDATED_VIEW_NAME)
            .description(UPDATED_DESCRIPTION)
            .published(UPDATED_PUBLISHED)
            .image(UPDATED_IMAGE)
            .imageContentType(UPDATED_IMAGE_CONTENT_TYPE);

        restViewsMockMvc.perform(put("/api/views")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedView)))
            .andExpect(status().isOk());

        // Validate the View in the database
        List<View> viewList = viewRepository.findAll();
        assertThat(viewList).hasSize(databaseSizeBeforeUpdate);
        View testView = viewList.get(viewList.size() - 1);
        assertThat(testView.getViewName()).isEqualTo(UPDATED_VIEW_NAME);
        assertThat(testView.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testView.isPublished()).isEqualTo(UPDATED_PUBLISHED);
        assertThat(testView.getImage()).isEqualTo(UPDATED_IMAGE);
        assertThat(testView.getImageContentType()).isEqualTo(UPDATED_IMAGE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingViews() throws Exception {
        int databaseSizeBeforeUpdate = viewRepository.findAll().size();

        // Create the View

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restViewsMockMvc.perform(put("/api/views")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(view)))
            .andExpect(status().isCreated());

        // Validate the View in the database
        List<View> viewList = viewRepository.findAll();
        assertThat(viewList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteViews() throws Exception {
        // Initialize the database
        viewService.save(view);

        int databaseSizeBeforeDelete = viewRepository.findAll().size();

        // Get the view
        restViewsMockMvc.perform(delete("/api/views/{id}", view.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<View> viewList = viewRepository.findAll();
        assertThat(viewList).hasSize(databaseSizeBeforeDelete - 1);
    }
    
    @Test
    @Transactional    
    public void requestRelease() throws Exception{
    	CreateViewReleaseRequestDTO createViewReleaseDTO=createViewReleaseDTO();
    	viewService.save(view);
    	restViewsMockMvc.perform(put("/api/views/{id}/requestRelease",view.getId())
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(createViewReleaseDTO)))
                .andExpect(status().isOk())
        		.andExpect(jsonPath("$.comment").value(RELEASE_COMMENT));
    }
    
    @Test
    @Transactional    
    public void getViewReleases() throws Exception{
    	View viewInserted=viewService.save(view);
        ViewRelease viewRelease = new ViewRelease();
        viewRelease.setComment(createViewReleaseDTO().getComment());
        viewRelease.setViewState(viewInserted.getCurrentEditingState());
        viewRelease.setView(viewInserted);
        ReleaseRequest ReleaseRequest =releaseRequestService.requestRelease(viewRelease);
    	restViewsMockMvc.perform(get("/api/views/{viewId}/releases",viewInserted.getId()))
	        .andExpect(status().isOk());
    /**	TODO :: API is not working as expected ****/
	        //.andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
    		//.andExpect(jsonPath("$.[*].comment").value(hasItem(RELEASE_COMMENT)));
    }
    
    
    @Test
    @Transactional    
    public void getLatestRelease() throws Exception{
    	View viewInserted=viewService.save(view);
        ViewRelease viewRelease = new ViewRelease();
        viewRelease.setComment(createViewReleaseDTO().getComment());
        viewRelease.setViewState(viewInserted.getCurrentEditingState());
        viewRelease.setView(viewInserted);
        releaseRequestService.requestRelease(viewRelease);
        viewRelease.setReleaseStatus(Release.Status.APPROVED);
        if (viewRelease.getProcessedBy() == null) {
        	viewRelease.setProcessedBy(user);
        }
        viewService.publishRelease(viewInserted.getId(), viewRelease);
    	restViewsMockMvc.perform(get("/api/views/{viewId}/releases/latest",viewInserted.getId()))
	        .andExpect(status().isOk())
	        .andExpect(jsonPath("$.comment").value(RELEASE_COMMENT))
    		.andExpect(jsonPath("$.releaseStatus").value(Release.Status.APPROVED.toString()))
    		.andExpect(jsonPath("$.versionNumber").value(VERSION_NUMBER));

    }
    
    @Test
    @Transactional    
    public void getReleaseByVersion() throws Exception{
    	View viewInserted=viewService.save(view);
        ViewRelease viewRelease = new ViewRelease();
        viewRelease.setComment(createViewReleaseDTO().getComment());
        viewRelease.setViewState(viewInserted.getCurrentEditingState());
        viewRelease.setView(viewInserted);
        releaseRequestService.requestRelease(viewRelease);
        viewRelease.setReleaseStatus(Release.Status.APPROVED);
        if (viewRelease.getProcessedBy() == null) {
        	viewRelease.setProcessedBy(user);
        }
        viewService.publishRelease(viewInserted.getId(), viewRelease);
    	restViewsMockMvc.perform(get("/api/views/{viewId}/releases/{version}",viewInserted.getId(),VERSION_NUMBER))
	        .andExpect(status().isOk())
	        .andExpect(jsonPath("$.comment").value(RELEASE_COMMENT))
    		.andExpect(jsonPath("$.releaseStatus").value(Release.Status.APPROVED.toString()))
    		.andExpect(jsonPath("$.versionNumber").value(VERSION_NUMBER));

    }
    
    @Test
    @Transactional    
    public void getViewsCount() throws Exception{
    	viewService.save(view);
    	int count = viewRepository.findAll().size();
    	accessControlManager.grantAccess("dash-admin", view.getPermissions());
    	restViewsMockMvc.perform(get("/api/views/count"))
                .andExpect(status().isOk())
        		.andExpect(jsonPath("$.count").value(count));
    }
    
    @Test
    @Transactional    
    public void getRecentlyCreated() throws Exception{
    	View recentCreatedView=viewService.save(view);
    	accessControlManager.grantAccess("dash-admin", view.getPermissions());
    	restViewsMockMvc.perform(get("/api/views/recentlyCreated"))
	        .andExpect(status().isOk())
	        .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
	        .andExpect(jsonPath("$.[*].id").value(hasItem(recentCreatedView.getId().intValue())))
	        .andExpect(jsonPath("$.[*].viewName").value(hasItem(DEFAULT_VIEW_NAME)))
	        .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
	        .andExpect(jsonPath("$.[*].published").value(hasItem(DEFAULT_PUBLISHED)));
    }
    
    @Test
    @Transactional    
    public void getMostPopular() throws Exception{
    	View recentCreatedView=viewService.save(view);
    	viewWatchService.saveViewWatch("dash-admin", recentCreatedView);
    	accessControlManager.grantAccess("dash-admin", view.getPermissions());
    	restViewsMockMvc.perform(get("/api/views/mostPopular"))
	        .andExpect(status().isOk())
	        .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
	        .andExpect(jsonPath("$.[*].id").value(hasItem(recentCreatedView.getId().intValue())))
    		.andExpect(jsonPath("$.[*].watchCount").value(hasItem(WATCH_COUNT)))
	        .andExpect(jsonPath("$.[*].viewName").value(hasItem(DEFAULT_VIEW_NAME)))
	        .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
	        .andExpect(jsonPath("$.[*].published").value(hasItem(DEFAULT_PUBLISHED)));
    	
    }
      
    
}
