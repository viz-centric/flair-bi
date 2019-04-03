package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.Visualization;
import com.flair.bi.repository.VisualizationRepository;
import com.flair.bi.service.VisualizationService;
import com.flair.bi.service.mapper.FieldTypeMapper;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the VisualizationsResource REST controller.
 *
 * @see VisualizationsResource
 */
@Ignore
public class VisualizationResourceIntTest extends AbstractIntegrationTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_ICON = "AAAAAAAAAA";
    private static final String UPDATED_ICON = "BBBBBBBBBB";

    private static final Integer DEFAULT_CUSTOM_ID = 1;
    private static final Integer UPDATED_CUSTOM_ID = 2;

    private static final String DEFAULT_FUNCTIONNAME = "AAAAAAAAAA";
    private static final String UPDATED_FUNCTIONNAME = "BBBBBBBBBB";

    @Inject
    private VisualizationRepository visualizationRepository;

    @Inject
    private VisualizationService visualizationService;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private FieldTypeMapper fieldTypeMapper;

    @Inject
    private EntityManager em;

    private MockMvc restVisualizationsMockMvc;

    private Visualization visualization;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        VisualizationsResource visualizationsResource = new VisualizationsResource(visualizationService);
        this.restVisualizationsMockMvc = MockMvcBuilders.standaloneSetup(visualizationsResource)
                .setCustomArgumentResolvers(pageableArgumentResolver).setMessageConverters(jacksonMessageConverter)
                .build();
    }

    /**
     * Create an entity for this test.
     * <p>
     * This is a static method, as tests for other entities might also need it, if
     * they test an entity which requires the current entity.
     */
    public static Visualization createEntity(EntityManager em) {
        Visualization visualization = new Visualization().name(DEFAULT_NAME).icon(DEFAULT_ICON)
                .customId(DEFAULT_CUSTOM_ID).functionname(DEFAULT_FUNCTIONNAME);
        return visualization;
    }

    @Before
    public void initTest() {
        visualization = createEntity(em);
    }

    @Test
    @Transactional
    public void createVisualizations() throws Exception {
        int databaseSizeBeforeCreate = visualizationRepository.findAll().size();

        // Create the Visualization

        restVisualizationsMockMvc.perform(post("/api/visualizations").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(visualization))).andExpect(status().isCreated());

        // Validate the Visualization in the database
        List<Visualization> visualizationList = visualizationRepository.findAll();
        assertThat(visualizationList).hasSize(databaseSizeBeforeCreate + 1);
        Visualization testVisualization = visualizationList.get(visualizationList.size() - 1);
        assertThat(testVisualization.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testVisualization.getIcon()).isEqualTo(DEFAULT_ICON);
        assertThat(testVisualization.getCustomId()).isEqualTo(DEFAULT_CUSTOM_ID);
        assertThat(testVisualization.getFunctionname()).isEqualTo(DEFAULT_FUNCTIONNAME);
    }

    @Test
    @Transactional
    public void createVisualizationsWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = visualizationRepository.findAll().size();

        // Create the Visualization with an existing ID
        Visualization existingVisualization = new Visualization();
        existingVisualization.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restVisualizationsMockMvc
                .perform(post("/api/visualizations").contentType(TestUtil.APPLICATION_JSON_UTF8)
                        .content(TestUtil.convertObjectToJsonBytes(existingVisualization)))
                .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<Visualization> visualizationList = visualizationRepository.findAll();
        assertThat(visualizationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = visualizationRepository.findAll().size();
        // set the field null
        visualization.setName(null);

        // Create the Visualization, which fails.

        restVisualizationsMockMvc.perform(post("/api/visualizations").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(visualization))).andExpect(status().isBadRequest());

        List<Visualization> visualizationList = visualizationRepository.findAll();
        assertThat(visualizationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkFunctionnameIsRequired() throws Exception {
        int databaseSizeBeforeTest = visualizationRepository.findAll().size();
        // set the field null
        visualization.setFunctionname(null);

        // Create the Visualization, which fails.

        restVisualizationsMockMvc.perform(post("/api/visualizations").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(visualization))).andExpect(status().isBadRequest());

        List<Visualization> visualizationList = visualizationRepository.findAll();
        assertThat(visualizationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllVisualizations() throws Exception {
        // Initialize the database
        visualizationRepository.saveAndFlush(visualization);

        // Get all the visualizationsList
        restVisualizationsMockMvc.perform(get("/api/visualizations")).andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.[*].id").value(hasItem(visualization.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].icon").value(hasItem(DEFAULT_ICON.toString())))
                .andExpect(jsonPath("$.[*].customId").value(hasItem(DEFAULT_CUSTOM_ID)))
                .andExpect(jsonPath("$.[*].functionname").value(hasItem(DEFAULT_FUNCTIONNAME.toString())));
    }

    @Test
    @Transactional
    public void getVisualizations() throws Exception {
        // Initialize the database
        visualizationRepository.saveAndFlush(visualization);

        // Get the visualization
        restVisualizationsMockMvc.perform(get("/api/visualizations/{id}", visualization.getId()))
                .andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.id").value(visualization.getId().intValue()))
                .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
                .andExpect(jsonPath("$.icon").value(DEFAULT_ICON.toString()))
                .andExpect(jsonPath("$.customId").value(DEFAULT_CUSTOM_ID))
                .andExpect(jsonPath("$.functionname").value(DEFAULT_FUNCTIONNAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingVisualizations() throws Exception {
        // Get the visualization
        restVisualizationsMockMvc.perform(get("/api/visualizations/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateVisualizations() throws Exception {
        // Initialize the database
        visualizationService.save(visualization);

        int databaseSizeBeforeUpdate = visualizationRepository.findAll().size();

        // Update the visualization
        Visualization updatedVisualization = visualizationRepository.findOne(visualization.getId());
        updatedVisualization.name(UPDATED_NAME).icon(UPDATED_ICON).customId(UPDATED_CUSTOM_ID)
                .functionname(UPDATED_FUNCTIONNAME);

        restVisualizationsMockMvc.perform(put("/api/visualizations").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(updatedVisualization))).andExpect(status().isOk());

        // Validate the Visualization in the database
        List<Visualization> visualizationList = visualizationRepository.findAll();
        assertThat(visualizationList).hasSize(databaseSizeBeforeUpdate);
        Visualization testVisualization = visualizationList.get(visualizationList.size() - 1);
        assertThat(testVisualization.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testVisualization.getIcon()).isEqualTo(UPDATED_ICON);
        assertThat(testVisualization.getCustomId()).isEqualTo(UPDATED_CUSTOM_ID);
        assertThat(testVisualization.getFunctionname()).isEqualTo(UPDATED_FUNCTIONNAME);
    }

    @Test
    @Transactional
    public void updateNonExistingVisualizations() throws Exception {
        int databaseSizeBeforeUpdate = visualizationRepository.findAll().size();

        // Create the Visualization

        // If the entity doesn't have an ID, it will be created instead of just being
        // updated
        restVisualizationsMockMvc.perform(put("/api/visualizations").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(visualization))).andExpect(status().isCreated());

        // Validate the Visualization in the database
        List<Visualization> visualizationList = visualizationRepository.findAll();
        assertThat(visualizationList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteVisualizations() throws Exception {
        // Initialize the database
        visualizationService.save(visualization);

        int databaseSizeBeforeDelete = visualizationRepository.findAll().size();

        // Get the visualization
        restVisualizationsMockMvc.perform(
                delete("/api/visualizations/{id}", visualization.getId()).accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Visualization> visualizationList = visualizationRepository.findAll();
        assertThat(visualizationList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
