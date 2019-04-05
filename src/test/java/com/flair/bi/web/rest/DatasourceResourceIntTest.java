package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.Datasource;
import com.flair.bi.repository.DatasourceRepository;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.GrpcConnectionService;
import com.flair.bi.service.dto.ListTablesResponseDTO;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import com.flair.bi.web.rest.errors.ExceptionTranslator;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;

import static com.flair.bi.web.rest.TestUtil.sameInstant;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Matchers.eq;
import static org.mockito.Matchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test class for the DatasourcesResource REST controller.
 *
 * @see DatasourcesResource
 */
@Ignore
public class DatasourceResourceIntTest extends AbstractIntegrationTest {

    private static final Long id = 501L;
    private static final String DEFAULT_NAME = "Transactions";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final ZonedDateTime DEFAULT_LAST_UPDATED = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L),
            ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_LAST_UPDATED = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final String DEFAULT_CONNECTION_NAME = "1715917d-fff8-44a1-af02-ee2cd41a3609";
    private static final String UPDATED_CONNECTION_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_QUERY_PATH = "/api/queries";
    private static final String UPDATED_QUERY_PATH = "BBBBBBBBBB";

    @Autowired
    private DatasourceRepository datasourceRepository;

    @Autowired
    private DatasourceService datasourceService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;
    @Autowired
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private DashboardService dashboardService;

    @MockBean
    private GrpcConnectionService grpcConnectionService;

    @Autowired
    private EntityManager em;

    private MockMvc restDatasourcesMockMvc;

    private Datasource datasource;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        DatasourcesResource datasourcesResource = new DatasourcesResource(datasourceService, dashboardService,
                grpcConnectionService);
        this.restDatasourcesMockMvc = MockMvcBuilders.standaloneSetup(datasourcesResource)
                .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
                .setControllerAdvice(exceptionTranslator).setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     * <p>
     * This is a static method, as tests for other entities might also need it, if
     * they test an entity which requires the current entity.
     */
    public static Datasource createEntity(EntityManager em) {
        // Add required entity
        return new Datasource().name(DEFAULT_NAME).lastUpdated(DEFAULT_LAST_UPDATED)
                .connectionName(DEFAULT_CONNECTION_NAME).queryPath(DEFAULT_QUERY_PATH);
    }

    @Before
    public void initTest() {
        datasource = createEntity(em);
    }

    @Test
    @Transactional
    public void createDatasources() throws Exception {
        int databaseSizeBeforeCreate = datasourceRepository.findAll().size();

        // Create the Datasource
        restDatasourcesMockMvc.perform(post("/api/datasources").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(datasource))).andExpect(status().isCreated());

        // Validate the Datasource in the database
        List<Datasource> datasourceList = datasourceRepository.findAll();
        assertThat(datasourceList).hasSize(databaseSizeBeforeCreate + 1);
        Datasource testDatasource = datasourceList.get(datasourceList.size() - 1);
        assertThat(testDatasource.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testDatasource.getLastUpdated()).isEqualTo(DEFAULT_LAST_UPDATED);
        assertThat(testDatasource.getConnectionName()).isEqualTo(DEFAULT_CONNECTION_NAME);
        assertThat(testDatasource.getQueryPath()).isEqualTo(DEFAULT_QUERY_PATH);
    }

    @Test
    @Transactional
    public void createDatasourcesWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = datasourceRepository.findAll().size();

        // Create the Datasource with an existing ID
        datasource.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restDatasourcesMockMvc.perform(post("/api/datasources").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(datasource))).andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<Datasource> datasourceList = datasourceRepository.findAll();
        assertThat(datasourceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = datasourceRepository.findAll().size();
        // set the field null
        datasource.setName(null);

        // Create the Datasource, which fails.

        restDatasourcesMockMvc.perform(post("/api/datasources").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(datasource))).andExpect(status().isBadRequest());

        List<Datasource> datasourceList = datasourceRepository.findAll();
        assertThat(datasourceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkLastUpdatedIsRequired() throws Exception {
        int databaseSizeBeforeTest = datasourceRepository.findAll().size();
        // set the field null
        datasource.setLastUpdated(null);

        // Create the Datasource, which fails.

        restDatasourcesMockMvc.perform(post("/api/datasources").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(datasource))).andExpect(status().isBadRequest());

        List<Datasource> datasourceList = datasourceRepository.findAll();
        assertThat(datasourceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkConnectionNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = datasourceRepository.findAll().size();
        // set the field null
        datasource.setConnectionName(null);

        // Create the Datasource, which fails.

        restDatasourcesMockMvc.perform(post("/api/datasources").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(datasource))).andExpect(status().isBadRequest());

        List<Datasource> datasourceList = datasourceRepository.findAll();
        assertThat(datasourceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkQueryPathIsRequired() throws Exception {
        int databaseSizeBeforeTest = datasourceRepository.findAll().size();
        // set the field null
        datasource.setQueryPath(null);

        // Create the Datasource, which fails.

        restDatasourcesMockMvc.perform(post("/api/datasources").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(datasource))).andExpect(status().isBadRequest());

        List<Datasource> datasourceList = datasourceRepository.findAll();
        assertThat(datasourceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllDatasources() throws Exception {
        // Initialize the database
        datasourceRepository.saveAndFlush(datasource);

        // Get all the datasourcesList
        restDatasourcesMockMvc.perform(get("/api/datasources")).andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.[*].id").value(hasItem(datasource.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].lastUpdated").value(hasItem(sameInstant(DEFAULT_LAST_UPDATED))))
                .andExpect(jsonPath("$.[*].connectionName").value(hasItem(DEFAULT_CONNECTION_NAME.toString())))
                .andExpect(jsonPath("$.[*].queryPath").value(hasItem(DEFAULT_QUERY_PATH.toString())));
    }

    @Test
    @Transactional
    public void getDatasources() throws Exception {
        // Initialize the database
        datasourceRepository.saveAndFlush(datasource);

        // Get the datasource
        restDatasourcesMockMvc.perform(get("/api/datasources/{id}", datasource.getId())).andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.id").value(datasource.getId().intValue()))
                .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
                .andExpect(jsonPath("$.lastUpdated").value(sameInstant(DEFAULT_LAST_UPDATED)))
                .andExpect(jsonPath("$.connectionName").value(DEFAULT_CONNECTION_NAME.toString()))
                .andExpect(jsonPath("$.queryPath").value(DEFAULT_QUERY_PATH.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingDatasources() throws Exception {
        // Get the datasource
        restDatasourcesMockMvc.perform(get("/api/datasources/{id}", Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateDatasources() throws Exception {
        // Initialize the database
        datasourceService.save(datasource);

        int databaseSizeBeforeUpdate = datasourceRepository.findAll().size();

        // Update the datasource
        Datasource updatedDatasource = datasourceRepository.findOne(datasource.getId());
        updatedDatasource.name(UPDATED_NAME).lastUpdated(UPDATED_LAST_UPDATED).connectionName(UPDATED_CONNECTION_NAME)
                .queryPath(UPDATED_QUERY_PATH);

        restDatasourcesMockMvc.perform(put("/api/datasources").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(updatedDatasource))).andExpect(status().isOk());

        // Validate the Datasource in the database
        List<Datasource> datasourceList = datasourceRepository.findAll();
        assertThat(datasourceList).hasSize(databaseSizeBeforeUpdate);
        Datasource testDatasource = datasourceList.get(datasourceList.size() - 1);
        assertThat(testDatasource.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testDatasource.getLastUpdated()).isEqualTo(UPDATED_LAST_UPDATED);
        assertThat(testDatasource.getConnectionName()).isEqualTo(UPDATED_CONNECTION_NAME);
        assertThat(testDatasource.getQueryPath()).isEqualTo(UPDATED_QUERY_PATH);
    }

    @Test
    @Transactional
    public void updateNonExistingDatasources() throws Exception {
        int databaseSizeBeforeUpdate = datasourceRepository.findAll().size();

        // Create the Datasource

        // If the entity doesn't have an ID, it will be created instead of just being
        // updated
        restDatasourcesMockMvc.perform(put("/api/datasources").contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(datasource))).andExpect(status().isCreated());

        // Validate the Datasource in the database
        List<Datasource> datasourceList = datasourceRepository.findAll();
        assertThat(datasourceList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteDatasources() throws Exception {
        // Initialize the database
        datasourceService.save(datasource);

        int databaseSizeBeforeDelete = datasourceRepository.findAll().size();

        // Get the datasource
        restDatasourcesMockMvc
                .perform(delete("/api/datasources/{id}", datasource.getId()).accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Datasource> datasourceList = datasourceRepository.findAll();
        assertThat(datasourceList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void listTables() throws Exception {
        // Get the datasource
        DatasourcesResource.ListTablesRequest listTablesRequest = new DatasourcesResource.ListTablesRequest();
        listTablesRequest.setSearchTerm("some table");
        listTablesRequest.setConnectionLinkId("connection link");

        when(grpcConnectionService.listTables(eq("connection link"), eq("some table"), isNull(ConnectionDTO.class),
                eq(10))).thenReturn(new ListTablesResponseDTO().setTableNames(Arrays.asList("table1", "table2")));

        restDatasourcesMockMvc
                .perform(post("/api/datasources/listTables").contentType(TestUtil.APPLICATION_JSON_UTF8)
                        .content(TestUtil.convertObjectToJsonBytes(listTablesRequest))
                        .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.tableNames[0]").value("table1"))
                .andExpect(jsonPath("$.tableNames[1]").value("table2"));
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Datasource.class);
        Datasource datasource1 = new Datasource();
        datasource1.setId(1L);
        Datasource datasource2 = new Datasource();
        datasource2.setId(datasource1.getId());
        assertThat(datasource1).isEqualTo(datasource2);
        datasource2.setId(2L);
        assertThat(datasource1).isNotEqualTo(datasource2);
        datasource1.setId(null);
        assertThat(datasource1).isNotEqualTo(datasource2);
    }
}
