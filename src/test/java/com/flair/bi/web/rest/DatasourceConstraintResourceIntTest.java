package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.FlairbiApp;

import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.domain.User;
import com.flair.bi.domain.constraintdefinition.ConstraintDefinition;
import com.flair.bi.domain.constraintdefinition.ExclusionFeatureConstraintExpression;
import com.flair.bi.domain.constraintdefinition.InclusionFeatureConstraintExpression;
import com.flair.bi.repository.DatasourceConstraintRepository;
import com.flair.bi.service.DatasourceConstraintService;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the DatasourceConstraintResource REST controller.
 *
 * @see DatasourceConstraintResource
 */
@Ignore
public class DatasourceConstraintResourceIntTest extends AbstractIntegrationTest {

    private static final ConstraintDefinition DEFAULT_CONSTRAINT_DEFINITION = new ConstraintDefinition(Collections.singletonList(new ExclusionFeatureConstraintExpression()));
    private static final ConstraintDefinition UPDATED_CONSTRAINT_DEFINITION = new ConstraintDefinition(Collections.singletonList(new InclusionFeatureConstraintExpression()));

    @Autowired
    private DatasourceConstraintRepository datasourceConstraintRepository;

    @Autowired
    private DatasourceConstraintService datasourceConstraintService;

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

    private MockMvc restDatasourceConstraintMockMvc;

    private DatasourceConstraint datasourceConstraint;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        DatasourceConstraintResource datasourceConstraintResource = new DatasourceConstraintResource(datasourceConstraintService);
        this.restDatasourceConstraintMockMvc = MockMvcBuilders.standaloneSetup(datasourceConstraintResource)
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
    public static DatasourceConstraint createEntity(EntityManager em, UserService userService) {
        DatasourceConstraint datasourceConstraint = new DatasourceConstraint();
        // Add required entity
        User user = UserResourceIntTest.createEntity(userService);
        em.persist(user);
        em.flush();
        datasourceConstraint.setUser(user);

        datasourceConstraint.setConstraintDefinition(DEFAULT_CONSTRAINT_DEFINITION);

        // Add required entity
        Datasource datasource = DatasourceResourceIntTest.createEntity(em);
        em.persist(datasource);
        em.flush();
        datasourceConstraint.setDatasource(datasource);
        return datasourceConstraint;
    }

    @Before
    public void initTest() {
        datasourceConstraint = createEntity(em, userService);
    }

    @Test
    @Transactional
    public void createDatasourceConstraint() throws Exception {
        int databaseSizeBeforeCreate = datasourceConstraintRepository.findAll().size();

        // Create the DatasourceConstraint
        restDatasourceConstraintMockMvc.perform(post("/api/datasource-constraints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(datasourceConstraint)))
            .andExpect(status().isCreated());

        // Validate the DatasourceConstraint in the database
        List<DatasourceConstraint> datasourceConstraintList = datasourceConstraintRepository.findAll();
        assertThat(datasourceConstraintList).hasSize(databaseSizeBeforeCreate + 1);
        DatasourceConstraint testDatasourceConstraint = datasourceConstraintList.get(datasourceConstraintList.size() - 1);
    }

    @Test
    @Transactional
    public void createDatasourceConstraintWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = datasourceConstraintRepository.findAll().size();

        // Create the DatasourceConstraint with an existing ID
        datasourceConstraint.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restDatasourceConstraintMockMvc.perform(post("/api/datasource-constraints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(datasourceConstraint)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<DatasourceConstraint> datasourceConstraintList = datasourceConstraintRepository.findAll();
        assertThat(datasourceConstraintList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkConstraintDefinitionIsRequired() throws Exception {
        int databaseSizeBeforeTest = datasourceConstraintRepository.findAll().size();

        datasourceConstraint.setConstraintDefinition(null);

        // Create the DatasourceConstraint, which fails.
        restDatasourceConstraintMockMvc.perform(post("/api/datasource-constraints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(datasourceConstraint)))
            .andExpect(status().isBadRequest());

        List<DatasourceConstraint> datasourceConstraintList = datasourceConstraintRepository.findAll();
        assertThat(datasourceConstraintList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllDatasourceConstraints() throws Exception {
        // Initialize the database
        datasourceConstraintRepository.saveAndFlush(datasourceConstraint);

        // Get all the datasourceConstraintList
        restDatasourceConstraintMockMvc.perform(get("/api/datasource-constraints"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(datasourceConstraint.getId().intValue())));
    }

    @Test
    @Transactional
    public void getDatasourceConstraint() throws Exception {
        // Initialize the database
        datasourceConstraintRepository.saveAndFlush(datasourceConstraint);

        // Get the datasourceConstraint
        restDatasourceConstraintMockMvc.perform(get("/api/datasource-constraints/{id}", datasourceConstraint.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(datasourceConstraint.getId().intValue()))
            .andExpect(jsonPath("$.constraintDefinition").isNotEmpty());
    }

    @Test
    @Transactional
    public void getNonExistingDatasourceConstraint() throws Exception {
        // Get the datasourceConstraint
        restDatasourceConstraintMockMvc.perform(get("/api/datasource-constraints/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateDatasourceConstraint() throws Exception {
        // Initialize the database
        datasourceConstraintService.save(datasourceConstraint);

        int databaseSizeBeforeUpdate = datasourceConstraintRepository.findAll().size();

        // Update the datasourceConstraint
        DatasourceConstraint updatedDatasourceConstraint = datasourceConstraintRepository.findOne(datasourceConstraint.getId());

        restDatasourceConstraintMockMvc.perform(put("/api/datasource-constraints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedDatasourceConstraint)))
            .andExpect(status().isOk());

        // Validate the DatasourceConstraint in the database
        List<DatasourceConstraint> datasourceConstraintList = datasourceConstraintRepository.findAll();
        assertThat(datasourceConstraintList).hasSize(databaseSizeBeforeUpdate);
        DatasourceConstraint testDatasourceConstraint = datasourceConstraintList.get(datasourceConstraintList.size() - 1);
    }

    @Test
    @Transactional
    public void updateNonExistingDatasourceConstraint() throws Exception {
        int databaseSizeBeforeUpdate = datasourceConstraintRepository.findAll().size();

        // Create the DatasourceConstraint

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restDatasourceConstraintMockMvc.perform(put("/api/datasource-constraints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(datasourceConstraint)))
            .andExpect(status().isCreated());

        // Validate the DatasourceConstraint in the database
        List<DatasourceConstraint> datasourceConstraintList = datasourceConstraintRepository.findAll();
        assertThat(datasourceConstraintList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteDatasourceConstraint() throws Exception {
        // Initialize the database
        datasourceConstraintService.save(datasourceConstraint);

        int databaseSizeBeforeDelete = datasourceConstraintRepository.findAll().size();

        // Get the datasourceConstraint
        restDatasourceConstraintMockMvc.perform(delete("/api/datasource-constraints/{id}", datasourceConstraint.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<DatasourceConstraint> datasourceConstraintList = datasourceConstraintRepository.findAll();
        assertThat(datasourceConstraintList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DatasourceConstraint.class);
        DatasourceConstraint datasourceConstraint1 = new DatasourceConstraint();
        datasourceConstraint1.setId(1L);
        DatasourceConstraint datasourceConstraint2 = new DatasourceConstraint();
        datasourceConstraint2.setId(datasourceConstraint1.getId());
        assertThat(datasourceConstraint1).isEqualTo(datasourceConstraint2);
        datasourceConstraint2.setId(2L);
        assertThat(datasourceConstraint1).isNotEqualTo(datasourceConstraint2);
        datasourceConstraint1.setId(null);
        assertThat(datasourceConstraint1).isNotEqualTo(datasourceConstraint2);
    }
}
