package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.FlairbiApp;

import com.flair.bi.domain.Functions;
import com.flair.bi.repository.FunctionsRepository;
import com.flair.bi.service.FunctionsService;
import com.flair.bi.service.dto.FunctionsDTO;
import com.flair.bi.service.mapper.FunctionsMapper;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
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
 * Test class for the FunctionsResource REST controller.
 *
 * @see FunctionsResource
 */
public class FunctionsResourceIntTest extends AbstractIntegrationTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    private static final Boolean DEFAULT_DIMENSION_USE = false;
    private static final Boolean UPDATED_DIMENSION_USE = true;

    private static final Boolean DEFAULT_MEASURE_USE = false;
    private static final Boolean UPDATED_MEASURE_USE = true;

    @Inject
    private FunctionsRepository functionsRepository;

    @Inject
    private FunctionsMapper functionsMapper;

    @Inject
    private FunctionsService functionsService;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private EntityManager em;

    private MockMvc restFunctionsMockMvc;

    private Functions functions;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        FunctionsResource functionsResource = new FunctionsResource(functionsService);
        this.restFunctionsMockMvc = MockMvcBuilders.standaloneSetup(functionsResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Functions createEntity(EntityManager em) {
        Functions functions = new Functions()
                .name(DEFAULT_NAME)
                .description(DEFAULT_DESCRIPTION)
                .value(DEFAULT_VALUE)
                .dimensionUse(DEFAULT_DIMENSION_USE)
                .measureUse(DEFAULT_MEASURE_USE);
        return functions;
    }

    @Before
    public void initTest() {
        functions = createEntity(em);
    }

    @Test
    @Transactional
    public void createFunctions() throws Exception {
        int databaseSizeBeforeCreate = functionsRepository.findAll().size();

        // Create the Functions
        FunctionsDTO functionsDTO = functionsMapper.functionsToFunctionsDTO(functions);

        restFunctionsMockMvc.perform(post("/api/functions")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(functionsDTO)))
            .andExpect(status().isCreated());

        // Validate the Functions in the database
        List<Functions> functionsList = functionsRepository.findAll();
        assertThat(functionsList).hasSize(databaseSizeBeforeCreate + 1);
        Functions testFunctions = functionsList.get(functionsList.size() - 1);
        assertThat(testFunctions.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testFunctions.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testFunctions.getValue()).isEqualTo(DEFAULT_VALUE);
        assertThat(testFunctions.isDimensionUse()).isEqualTo(DEFAULT_DIMENSION_USE);
        assertThat(testFunctions.isMeasureUse()).isEqualTo(DEFAULT_MEASURE_USE);
    }

    @Test
    @Transactional
    public void createFunctionsWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = functionsRepository.findAll().size();

        // Create the Functions with an existing ID
        Functions existingFunctions = new Functions();
        existingFunctions.setId(1L);
        FunctionsDTO existingFunctionsDTO = functionsMapper.functionsToFunctionsDTO(existingFunctions);

        // An entity with an existing ID cannot be created, so this API call must fail
        restFunctionsMockMvc.perform(post("/api/functions")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(existingFunctionsDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<Functions> functionsList = functionsRepository.findAll();
        assertThat(functionsList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllFunctions() throws Exception {
        // Initialize the database
        functionsRepository.saveAndFlush(functions);

        // Get all the functionsList
        restFunctionsMockMvc.perform(get("/api/functions?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(functions.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE.toString())))
            .andExpect(jsonPath("$.[*].dimensionUse").value(hasItem(DEFAULT_DIMENSION_USE.booleanValue())))
            .andExpect(jsonPath("$.[*].measureUse").value(hasItem(DEFAULT_MEASURE_USE.booleanValue())));
    }

    @Test
    @Transactional
    public void getFunctions() throws Exception {
        // Initialize the database
        functionsRepository.saveAndFlush(functions);

        // Get the functions
        restFunctionsMockMvc.perform(get("/api/functions/{id}", functions.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(functions.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE.toString()))
            .andExpect(jsonPath("$.dimensionUse").value(DEFAULT_DIMENSION_USE.booleanValue()))
            .andExpect(jsonPath("$.measureUse").value(DEFAULT_MEASURE_USE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingFunctions() throws Exception {
        // Get the functions
        restFunctionsMockMvc.perform(get("/api/functions/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFunctions() throws Exception {
        // Initialize the database
        functionsRepository.saveAndFlush(functions);
        int databaseSizeBeforeUpdate = functionsRepository.findAll().size();

        // Update the functions
        Functions updatedFunctions = functionsRepository.findOne(functions.getId());
        updatedFunctions
                .name(UPDATED_NAME)
                .description(UPDATED_DESCRIPTION)
                .value(UPDATED_VALUE)
                .dimensionUse(UPDATED_DIMENSION_USE)
                .measureUse(UPDATED_MEASURE_USE);
        FunctionsDTO functionsDTO = functionsMapper.functionsToFunctionsDTO(updatedFunctions);

        restFunctionsMockMvc.perform(put("/api/functions")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(functionsDTO)))
            .andExpect(status().isOk());

        // Validate the Functions in the database
        List<Functions> functionsList = functionsRepository.findAll();
        assertThat(functionsList).hasSize(databaseSizeBeforeUpdate);
        Functions testFunctions = functionsList.get(functionsList.size() - 1);
        assertThat(testFunctions.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testFunctions.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testFunctions.getValue()).isEqualTo(UPDATED_VALUE);
        assertThat(testFunctions.isDimensionUse()).isEqualTo(UPDATED_DIMENSION_USE);
        assertThat(testFunctions.isMeasureUse()).isEqualTo(UPDATED_MEASURE_USE);
    }

    @Test
    @Transactional
    public void updateNonExistingFunctions() throws Exception {
        int databaseSizeBeforeUpdate = functionsRepository.findAll().size();

        // Create the Functions
        FunctionsDTO functionsDTO = functionsMapper.functionsToFunctionsDTO(functions);

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restFunctionsMockMvc.perform(put("/api/functions")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(functionsDTO)))
            .andExpect(status().isCreated());

        // Validate the Functions in the database
        List<Functions> functionsList = functionsRepository.findAll();
        assertThat(functionsList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteFunctions() throws Exception {
        // Initialize the database
        functionsRepository.saveAndFlush(functions);
        int databaseSizeBeforeDelete = functionsRepository.findAll().size();

        // Get the functions
        restFunctionsMockMvc.perform(delete("/api/functions/{id}", functions.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Functions> functionsList = functionsRepository.findAll();
        assertThat(functionsList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
