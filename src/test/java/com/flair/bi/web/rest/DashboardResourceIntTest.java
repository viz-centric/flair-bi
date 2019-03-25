package com.flair.bi.web.rest;

import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.DashboardRelease;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.Release;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewState;
import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.repository.DashboardRepository;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.FileUploadService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.security.UserGroupService;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.dto.CreateDashboardReleaseDTO;

import org.h2.command.ddl.CreateView;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.slf4j.LoggerFactory;
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

import javax.inject.Inject;
import javax.persistence.EntityManager;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.flair.bi.domain.ViewRelease;

/**
 * Test class for the DashboardsResource REST controller.
 *
 * @see DashboardsResource
 */
@Ignore
@RunWith(SpringRunner.class)
@SpringBootTest(classes = FlairbiApp.class)
public class DashboardResourceIntTest {

    private static final String DEFAULT_DASHBOARD_NAME = "AAAAAAAAAA";
    private static final String UPDATED_DASHBOARD_NAME = "BBBBBBBBBB";
    private static final String DEFAULT_VIEW_NAME = "VAAAAAAAAAA";

    private static final String DEFAULT_CATEGORY = "AAAAAAAAAA";
    private static final String UPDATED_CATEGORY = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Boolean DEFAULT_PUBLISHED = false;
    private static final Boolean UPDATED_PUBLISHED = true;

    private static final byte[] DEFAULT_IMAGE = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_IMAGE = TestUtil.createByteArray(2, "1");
    private static final String DEFAULT_IMAGE_CONTENT_TYPE = "png";
    private static final String RELEASE_COMMENT = "Released";
    private static final Long VERSION_NUMBER=1L;

    @Inject
    private DashboardRepository dashboardRepository;

    @Inject
    private DashboardService dashboardService;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;

    @Inject
    private EntityManager em;

    @Inject
    private UserService userService;

    @Inject
    private UserGroupService userGroupService;

    @Inject
    private ReleaseRequestService releaseRequestService;

    @Inject
    private ViewService viewService;

    private MockMvc restDashboardsMockMvc;

    private Dashboard dashboard;
    
    private View dashboardView;

    private User user;
    
    private CreateDashboardReleaseDTO createDashboardReleaseDTO;

    @Inject
    private FileUploadService imageUploadService;
    @Inject
    private ViewsResource viewsResource;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        DashboardsResource dashboardsResource = new DashboardsResource(dashboardService, releaseRequestService, viewService, imageUploadService, viewsResource);
        ReflectionTestUtils.setField(dashboardsResource, "dashboardService", dashboardService);
        this.restDashboardsMockMvc = MockMvcBuilders.standaloneSetup(dashboardsResource)
            .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    public static User createUser(UserService userService) {
        return userService.createUser("dash-admin", "dash-admin", "pera", "pera", "admi1@localhost", "en", "test");
    }

    /**
     * Create an entity for this test.
     * <p>
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Dashboard createEntity(EntityManager em, DashboardService dashboardService) {
        Dashboard dashboard = new Dashboard()
            .dashboardName(DEFAULT_DASHBOARD_NAME)
            .category(DEFAULT_CATEGORY)
            .description(DEFAULT_DESCRIPTION)
            .published(DEFAULT_PUBLISHED)
            .image(DEFAULT_IMAGE)
            .imageContentType(DEFAULT_IMAGE_CONTENT_TYPE);
        // Add required entity
        dashboard.addDashboardView(getView(dashboard));
        Datasource dashboardDatasource = DatasourceResourceIntTest.createEntity(em);
        em.persist(dashboardDatasource);
        em.flush();
        dashboard.setDashboardDatasource(dashboardDatasource);

        return dashboard;
    }
    
    private static View getView(Dashboard dashboard) {
        View view = new View()
            .viewName(DEFAULT_VIEW_NAME)
            .description(DEFAULT_DESCRIPTION)
            .published(DEFAULT_PUBLISHED)
            .image(DEFAULT_IMAGE)
            .imageContentType(DEFAULT_IMAGE_CONTENT_TYPE);

        ViewState state = new ViewState();
        state.setId(UUID.randomUUID().toString());
        view.setCurrentEditingState(state);
        view.setViewDashboard(dashboard);
        return view;
    }
    
    private CreateDashboardReleaseDTO  createDashboardReleaseDTO(Long id){
    	List<Long> viewIds= new ArrayList<Long>();
    	viewIds.add(id);
    	CreateDashboardReleaseDTO createDashboardReleaseDTO= new CreateDashboardReleaseDTO();
    	createDashboardReleaseDTO.setComment(RELEASE_COMMENT);
    	createDashboardReleaseDTO.setViewIds(viewIds);
    	return createDashboardReleaseDTO;
    }
    

    @Before
    public void initTest() {
        dashboard = createEntity(em, dashboardService);
        user = createUser(userService);
    	SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("dash-admin", "dash-admin"));
        for(View view: dashboard.getDashboardViews()) {
        	dashboardView = view;
            break;
        }
    }

    @Test
    @Transactional
    public void createDashboards() throws Exception {
        int databaseSizeBeforeCreate = dashboardRepository.findAll().size();

        // Create the Dashboard

        restDashboardsMockMvc.perform(post("/api/dashboards")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(dashboard)))
            .andExpect(status().isCreated());

        // Validate the Dashboard in the database
        List<Dashboard> dashboardList = dashboardRepository.findAll();
        assertThat(dashboardList).hasSize(databaseSizeBeforeCreate + 1);
        Dashboard testDashboard = dashboardList.get(dashboardList.size() - 1);
        assertThat(testDashboard.getDashboardName()).isEqualTo(DEFAULT_DASHBOARD_NAME);
        assertThat(testDashboard.getCategory()).isEqualTo(DEFAULT_CATEGORY);
        assertThat(testDashboard.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testDashboard.isPublished()).isEqualTo(DEFAULT_PUBLISHED);
        assertThat(testDashboard.getImage()).isEqualTo(DEFAULT_IMAGE);
        assertThat(testDashboard.getImageContentType()).isEqualTo(DEFAULT_IMAGE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void createDashboardsWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = dashboardRepository.findAll().size();

        // Create the Dashboard with an existing ID
        Dashboard existingDashboard = new Dashboard();
        existingDashboard.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restDashboardsMockMvc.perform(post("/api/dashboards")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(existingDashboard)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<Dashboard> dashboardList = dashboardRepository.findAll();
        assertThat(dashboardList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkDashboardNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = dashboardRepository.findAll().size();
        // set the field null
        dashboard.setDashboardName(null);

        // Create the Dashboard, which fails.

        restDashboardsMockMvc.perform(post("/api/dashboards")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(dashboard)))
            .andExpect(status().isBadRequest());

        List<Dashboard> dashboardList = dashboardRepository.findAll();
        assertThat(dashboardList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkCategoryIsRequired() throws Exception {
        int databaseSizeBeforeTest = dashboardRepository.findAll().size();
        // set the field null
        dashboard.setCategory(null);

        // Create the Dashboard, which fails.

        restDashboardsMockMvc.perform(post("/api/dashboards")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(dashboard)))
            .andExpect(status().isBadRequest());

        List<Dashboard> dashboardList = dashboardRepository.findAll();
        assertThat(dashboardList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllDashboardsWithPermissions() throws Exception {
        // Initialize the database
        dashboardService.save(dashboard);
        // Get all the dashboardsList
        restDashboardsMockMvc.perform(get("/api/dashboards?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(dashboard.getId().intValue())))
            .andExpect(jsonPath("$.[*].dashboardName").value(hasItem(DEFAULT_DASHBOARD_NAME)))
            .andExpect(jsonPath("$.[*].category").value(hasItem(DEFAULT_CATEGORY)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].published").value(hasItem(DEFAULT_PUBLISHED)))
            .andExpect(jsonPath("$.[*].imageContentType").value(hasItem(DEFAULT_IMAGE_CONTENT_TYPE)));
//            .andExpect(jsonPath("$.[*].image").value(hasItem(Base64Utils.encodeToString(DEFAULT_IMAGE))));
    }

    @Test
    @Transactional
    public void getDashboards() throws Exception {
        // Initialize the database
        dashboardRepository.saveAndFlush(dashboard);

        // Get the dashboard
        restDashboardsMockMvc.perform(get("/api/dashboards/{id}", dashboard.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(dashboard.getId().intValue()))
            .andExpect(jsonPath("$.dashboardName").value(DEFAULT_DASHBOARD_NAME))
            .andExpect(jsonPath("$.category").value(DEFAULT_CATEGORY))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.published").value(DEFAULT_PUBLISHED))
            .andExpect(jsonPath("$.imageContentType").value(DEFAULT_IMAGE_CONTENT_TYPE));
//            .andExpect(jsonPath("$.image").value(Base64Utils.encodeToString(DEFAULT_IMAGE)));
    }

    @Test
    @Transactional
    public void getNonExistingDashboards() throws Exception {
        // Get the dashboard
        restDashboardsMockMvc.perform(get("/api/dashboard/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateDashboards() throws Exception {
        // Initialize the database
        dashboardService.save(dashboard);

        int databaseSizeBeforeUpdate = dashboardRepository.findAll().size();

        // Update the dashboard
        Dashboard updatedDashboard = dashboardRepository.findOne(dashboard.getId());
        updatedDashboard
            .dashboardName(UPDATED_DASHBOARD_NAME)
            .category(UPDATED_CATEGORY)
            .description(UPDATED_DESCRIPTION)
            .published(UPDATED_PUBLISHED)
            .image(UPDATED_IMAGE)
            .imageContentType(DEFAULT_IMAGE_CONTENT_TYPE);

        restDashboardsMockMvc.perform(put("/api/dashboards")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedDashboard)))
            .andExpect(status().isOk());

        // Validate the Dashboard in the database
        List<Dashboard> dashboardList = dashboardRepository.findAll();
        assertThat(dashboardList).hasSize(databaseSizeBeforeUpdate);
        Dashboard testDashboard = dashboardList.get(dashboardList.size() - 1);
        assertThat(testDashboard.getDashboardName()).isEqualTo(UPDATED_DASHBOARD_NAME);
        assertThat(testDashboard.getCategory()).isEqualTo(UPDATED_CATEGORY);
        assertThat(testDashboard.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testDashboard.isPublished()).isEqualTo(UPDATED_PUBLISHED);
        assertThat(testDashboard.getImage()).isEqualTo(UPDATED_IMAGE);
        assertThat(testDashboard.getImageContentType()).isEqualTo(DEFAULT_IMAGE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingDashboards() throws Exception {
        int databaseSizeBeforeUpdate = dashboardRepository.findAll().size();

        // Create the Dashboard

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restDashboardsMockMvc.perform(put("/api/dashboards")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(dashboard)))
            .andExpect(status().isCreated());

        // Validate the Dashboard in the database
        List<Dashboard> dashboardList = dashboardRepository.findAll();
        assertThat(dashboardList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteDashboards() throws Exception {
        // Initialize the database
        dashboardService.save(dashboard);
        userGroupService.findAll()
            .forEach(x -> LoggerFactory.getLogger(getClass()).debug("User group: {}, Permissions: {}", x, x.getPermissions()));
        int databaseSizeBeforeDelete = dashboardService.findAll().size();

        // Get the dashboard
        restDashboardsMockMvc.perform(delete("/api/dashboards/{id}", dashboard.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Dashboard> dashboardList = dashboardService.findAll();
        assertThat(dashboardList).hasSize(databaseSizeBeforeDelete - 1);
    }
    
    @Test
    @Transactional
    public void getDashboardsCount() throws Exception {
    	dashboardService.save(dashboard);
        int count = dashboardService.findAll().size();
        restDashboardsMockMvc.perform(get("/api/dashboards/count")
        	.contentType(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.count").value(count));
    }
    
    @Test
    @Transactional
    public void requestRelease() throws Exception {
    	dashboardService.save(dashboard);
    	Dashboard insertedDashboard = dashboardRepository.findOne(dashboard.getId());
    	View insertedDashboardView=null;
        for(View view: insertedDashboard.getDashboardViews()) {
        	insertedDashboardView = view;
            break;
        }
    	CreateDashboardReleaseDTO createDashboardReleaseDTO= createDashboardReleaseDTO(insertedDashboardView.getId());
        restDashboardsMockMvc.perform(put("/api/dashboards/{id}/requestRelease",dashboard.getId())
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(createDashboardReleaseDTO)))
                .andExpect(status().isOk())
        		.andExpect(jsonPath("$.comment").value(RELEASE_COMMENT));
    }
    
    @Test
    @Transactional
    public void getDatasource() throws Exception {
    	dashboardService.save(dashboard);
    	Dashboard insertedDashboard = dashboardRepository.findOne(dashboard.getId());
        restDashboardsMockMvc.perform(get("/api/dashboards/{id}/datasource",insertedDashboard.getId())
        	.contentType(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value(insertedDashboard.getDashboardDatasource().getName()))
        	.andExpect(jsonPath("$.connectionName").value(insertedDashboard.getDashboardDatasource().getConnectionName()))
        	.andExpect(jsonPath("$.queryPath").value(insertedDashboard.getDashboardDatasource().getQueryPath()));
    }
    
    @Test
    @Transactional
    public void getLatestRelease() throws Exception {
    	dashboardService.save(dashboard);
    	Dashboard insertedDashboard = dashboardRepository.findOne(dashboard.getId());
    	View insertedDashboardView=null;
        for(View view: insertedDashboard.getDashboardViews()) {
        	insertedDashboardView = view;
            break;
        }
    	CreateDashboardReleaseDTO createDashboardReleaseDTO= createDashboardReleaseDTO(insertedDashboardView.getId());
        DashboardRelease dashboardRelease = new DashboardRelease();
        dashboardRelease.setComment(createDashboardReleaseDTO.getComment());
        dashboardRelease.setDashboard(insertedDashboard);
        dashboardRelease.setProcessedBy(user);
        dashboardRelease.setReleaseStatus(Release.Status.APPROVED);
        
        createDashboardReleaseDTO.getViewIds()
        .forEach(x -> {
            View view = viewService.findOne(x);
            ViewRelease viewRelease = new ViewRelease();
            viewRelease.setComment(createDashboardReleaseDTO.getComment());
            viewRelease.setViewState(view.getCurrentEditingState());
            viewRelease.setView(view);
            dashboardRelease.add(viewRelease);

        });
        releaseRequestService.requestRelease(dashboardRelease);
        dashboardRelease.getViewReleases()
            .forEach(x -> {
                x.setReleaseStatus(Release.Status.APPROVED);

                if (x.getProcessedBy() == null) {
                    x.setProcessedBy(user);
                }
            });
        //proceed with publishing views
        dashboardRelease.getViewReleases()
            .forEach(x -> viewService.publishRelease(x.getView().getId(), x));

        // proceed with publishing dashboard
        dashboardService.publishRelease(dashboard.getId(), dashboardRelease);
        
        restDashboardsMockMvc.perform(get("/api/dashboards/{id}/releases/latest",insertedDashboard.getId())
            	.contentType(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comment").value(RELEASE_COMMENT))
        		.andExpect(jsonPath("$.releaseStatus").value(Release.Status.APPROVED.toString()))
        		.andExpect(jsonPath("$.versionNumber").value(VERSION_NUMBER));

    }
    
    
}
