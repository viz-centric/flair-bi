package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.FeatureBookmark;
import com.flair.bi.domain.User;
import com.flair.bi.repository.FeatureBookmarkRepository;
import com.flair.bi.service.FeatureBookmarkService;
import com.flair.bi.service.UserService;
import com.flair.bi.web.rest.errors.ExceptionTranslator;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the FeatureBookmarkResource REST controller.
 *
 * @see FeatureBookmarkResource
 */
@Ignore
public class FeatureBookmarkResourceIntTest extends AbstractIntegrationTest{

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    @Autowired
    private FeatureBookmarkRepository featureBookmarkRepository;

    @Autowired
    private FeatureBookmarkService featureBookmarkService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private UserService userService;

    @Autowired
    private EntityManager em;

    private MockMvc restFeatureBookmarkMockMvc;

    private FeatureBookmark featureBookmark;

    private User user;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        FeatureBookmarkResource featureBookmarkResource = new FeatureBookmarkResource(featureBookmarkService);
        this.restFeatureBookmarkMockMvc = MockMvcBuilders.standaloneSetup(featureBookmarkResource)
            .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     * <p>
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FeatureBookmark createEntity(EntityManager em, User user) {
        FeatureBookmark featureBookmark = new FeatureBookmark()
            .name(DEFAULT_NAME);
        // Add required entity
        em.persist(user);
        em.flush();
        featureBookmark.setUser(user);
        // Add required entity
        Datasource datasource = DatasourceResourceIntTest.createEntity(em);
        em.persist(datasource);
        em.flush();
        featureBookmark.setDatasource(datasource);
        return featureBookmark;
    }

    @Before
    public void initTest() {
        user = UserResourceIntTest.createEntity(userService);
        featureBookmark = createEntity(em, user);
    }

    @Test
    @Transactional
    public void createFeatureBookmark() throws Exception {
        int databaseSizeBeforeCreate = featureBookmarkRepository.findAll().size();

        userService.createUser("pera", "pera", "test", "test", "123@gmail.com", "en", "test");

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("pera", "pera"));

        // Create the FeatureBookmark
        restFeatureBookmarkMockMvc.perform(post("/api/feature-bookmarks")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(featureBookmark)))
            .andExpect(status().isCreated());

        // Validate the FeatureBookmark in the database
        List<FeatureBookmark> featureBookmarkList = featureBookmarkRepository.findAll();
        assertThat(featureBookmarkList).hasSize(databaseSizeBeforeCreate + 1);
        FeatureBookmark testFeatureBookmark = featureBookmarkList.get(featureBookmarkList.size() - 1);
        assertThat(testFeatureBookmark.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void createFeatureBookmarkWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = featureBookmarkRepository.findAll().size();

        // Create the FeatureBookmark with an existing ID
        featureBookmark.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restFeatureBookmarkMockMvc.perform(post("/api/feature-bookmarks")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(featureBookmark)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<FeatureBookmark> featureBookmarkList = featureBookmarkRepository.findAll();
        assertThat(featureBookmarkList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = featureBookmarkRepository.findAll().size();
        // set the field null
        featureBookmark.setName(null);

        // Create the FeatureBookmark, which fails.

        restFeatureBookmarkMockMvc.perform(post("/api/feature-bookmarks")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(featureBookmark)))
            .andExpect(status().isBadRequest());

        List<FeatureBookmark> featureBookmarkList = featureBookmarkRepository.findAll();
        assertThat(featureBookmarkList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllFeatureBookmarks() throws Exception {
        userService.createUser("pera", "pera", "test", "test", "123@gmail.com", "en", "test");

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("pera", "pera"));

        // Initialize the database
        featureBookmarkService.save(featureBookmark);

        // Get all the featureBookmarkList
        restFeatureBookmarkMockMvc.perform(get("/api/feature-bookmarks"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(featureBookmark.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));
    }

    @Test
    @Transactional
    public void getFeatureBookmark() throws Exception {
        // Initialize the database
        featureBookmarkRepository.saveAndFlush(featureBookmark);

        // Get the featureBookmark
        restFeatureBookmarkMockMvc.perform(get("/api/feature-bookmarks/{id}", featureBookmark.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(featureBookmark.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingFeatureBookmark() throws Exception {
        // Get the featureBookmark
        restFeatureBookmarkMockMvc.perform(get("/api/feature-bookmarks/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFeatureBookmark() throws Exception {
        userService.createUser("pera", "pera", "test", "test", "123@gmail.com", "en", "test");

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("pera", "pera"));

        // Initialize the database
        featureBookmarkService.save(featureBookmark);

        int databaseSizeBeforeUpdate = featureBookmarkRepository.findAll().size();

        // Update the featureBookmark
        FeatureBookmark updatedFeatureBookmark = featureBookmarkRepository.findOne(featureBookmark.getId());
        updatedFeatureBookmark
            .name(UPDATED_NAME);

        restFeatureBookmarkMockMvc.perform(put("/api/feature-bookmarks")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedFeatureBookmark)))
            .andExpect(status().isOk());

        // Validate the FeatureBookmark in the database
        List<FeatureBookmark> featureBookmarkList = featureBookmarkRepository.findAll();
        assertThat(featureBookmarkList).hasSize(databaseSizeBeforeUpdate);
        FeatureBookmark testFeatureBookmark = featureBookmarkList.get(featureBookmarkList.size() - 1);
        assertThat(testFeatureBookmark.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    public void updateNonExistingFeatureBookmark() throws Exception {
        int databaseSizeBeforeUpdate = featureBookmarkRepository.findAll().size();

        userService.createUser("pera", "pera", "test", "test", "123@gmail.com", "en", "test");

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("pera", "pera"));


        // Create the FeatureBookmark

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restFeatureBookmarkMockMvc.perform(put("/api/feature-bookmarks")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(featureBookmark)))
            .andExpect(status().isCreated());

        // Validate the FeatureBookmark in the database
        List<FeatureBookmark> featureBookmarkList = featureBookmarkRepository.findAll();
        assertThat(featureBookmarkList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteFeatureBookmark() throws Exception {

        userService.createUser("pera", "pera", "test", "test", "123@gmail.com", "en", "test");

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("pera", "pera"));

        // Initialize the database
        featureBookmarkService.save(featureBookmark);


        int databaseSizeBeforeDelete = featureBookmarkRepository.findAll().size();

        // Get the featureBookmark
        restFeatureBookmarkMockMvc.perform(delete("/api/feature-bookmarks/{id}", featureBookmark.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<FeatureBookmark> featureBookmarkList = featureBookmarkRepository.findAll();
        assertThat(featureBookmarkList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FeatureBookmark.class);
        FeatureBookmark featureBookmark1 = new FeatureBookmark();
        featureBookmark1.setId(1L);
        FeatureBookmark featureBookmark2 = new FeatureBookmark();
        featureBookmark2.setId(featureBookmark1.getId());
        assertThat(featureBookmark1).isEqualTo(featureBookmark2);
        featureBookmark2.setId(2L);
        assertThat(featureBookmark1).isNotEqualTo(featureBookmark2);
        featureBookmark1.setId(null);
        assertThat(featureBookmark1).isNotEqualTo(featureBookmark2);
    }
}
