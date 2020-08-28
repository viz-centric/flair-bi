package com.flair.bi.web.rest;

import com.flair.bi.FlairbiApp;

import com.flair.bi.domain.ClientLogo;
import com.flair.bi.repository.ClientLogoRepository;
import com.flair.bi.service.ClientLogoService;
import com.flair.bi.service.FileUploadService;
import com.flair.bi.web.rest.errors.ExceptionTranslator;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
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
 * Test class for the ClientLogoResource REST controller.
 *
 * @see ClientLogoResource
 */
@Ignore
public class ClientLogoResourceIntTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_URL = "AAAAAAAAAA";
    private static final String UPDATED_URL = "BBBBBBBBBB";

    @Autowired
    private ClientLogoRepository clientLogoRepository;

    @Autowired
    private ClientLogoService clientLogoService;

    @Autowired
    private FileUploadService imageUploadService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restClientLogoMockMvc;

    private ClientLogo clientLogo;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ClientLogoResource clientLogoResource = new ClientLogoResource(clientLogoService,imageUploadService);
        this.restClientLogoMockMvc = MockMvcBuilders.standaloneSetup(clientLogoResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClientLogo createEntity(EntityManager em) {
        ClientLogo clientLogo = new ClientLogo()
            .name(DEFAULT_NAME)
            .url(DEFAULT_URL);
        return clientLogo;
    }

    @Before
    public void initTest() {
        clientLogo = createEntity(em);
    }

    @Test
    @Transactional
    public void createClientLogo() throws Exception {
        int databaseSizeBeforeCreate = clientLogoRepository.findAll().size();

        // Create the ClientLogo
        restClientLogoMockMvc.perform(post("/api/client-logos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientLogo)))
            .andExpect(status().isCreated());

        // Validate the ClientLogo in the database
        List<ClientLogo> clientLogoList = clientLogoRepository.findAll();
        assertThat(clientLogoList).hasSize(databaseSizeBeforeCreate + 1);
        ClientLogo testClientLogo = clientLogoList.get(clientLogoList.size() - 1);
        assertThat(testClientLogo.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testClientLogo.getUrl()).isEqualTo(DEFAULT_URL);
    }

    @Test
    @Transactional
    public void createClientLogoWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = clientLogoRepository.findAll().size();

        // Create the ClientLogo with an existing ID
        clientLogo.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restClientLogoMockMvc.perform(post("/api/client-logos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientLogo)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<ClientLogo> clientLogoList = clientLogoRepository.findAll();
        assertThat(clientLogoList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = clientLogoRepository.findAll().size();
        // set the field null
        clientLogo.setName(null);

        // Create the ClientLogo, which fails.

        restClientLogoMockMvc.perform(post("/api/client-logos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientLogo)))
            .andExpect(status().isBadRequest());

        List<ClientLogo> clientLogoList = clientLogoRepository.findAll();
        assertThat(clientLogoList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkUrlIsRequired() throws Exception {
        int databaseSizeBeforeTest = clientLogoRepository.findAll().size();
        // set the field null
        clientLogo.setUrl(null);

        // Create the ClientLogo, which fails.

        restClientLogoMockMvc.perform(post("/api/client-logos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientLogo)))
            .andExpect(status().isBadRequest());

        List<ClientLogo> clientLogoList = clientLogoRepository.findAll();
        assertThat(clientLogoList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllClientLogos() throws Exception {
        // Initialize the database
        clientLogoRepository.saveAndFlush(clientLogo);

        // Get all the clientLogoList
        restClientLogoMockMvc.perform(get("/api/client-logos?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clientLogo.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
            .andExpect(jsonPath("$.[*].url").value(hasItem(DEFAULT_URL.toString())));
    }

    @Test
    @Transactional
    public void getClientLogo() throws Exception {
        // Initialize the database
        clientLogoRepository.saveAndFlush(clientLogo);

        // Get the clientLogo
        restClientLogoMockMvc.perform(get("/api/client-logos/{id}", clientLogo.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(clientLogo.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.url").value(DEFAULT_URL.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingClientLogo() throws Exception {
        // Get the clientLogo
        restClientLogoMockMvc.perform(get("/api/client-logos/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateClientLogo() throws Exception {
        // Initialize the database
        clientLogoService.save(clientLogo);

        int databaseSizeBeforeUpdate = clientLogoRepository.findAll().size();

        // Update the clientLogo
        ClientLogo updatedClientLogo = clientLogoRepository.getOne(clientLogo.getId());
        updatedClientLogo
            .name(UPDATED_NAME)
            .url(UPDATED_URL);

        restClientLogoMockMvc.perform(put("/api/client-logos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedClientLogo)))
            .andExpect(status().isOk());

        // Validate the ClientLogo in the database
        List<ClientLogo> clientLogoList = clientLogoRepository.findAll();
        assertThat(clientLogoList).hasSize(databaseSizeBeforeUpdate);
        ClientLogo testClientLogo = clientLogoList.get(clientLogoList.size() - 1);
        assertThat(testClientLogo.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testClientLogo.getUrl()).isEqualTo(UPDATED_URL);
    }

    @Test
    @Transactional
    public void updateNonExistingClientLogo() throws Exception {
        int databaseSizeBeforeUpdate = clientLogoRepository.findAll().size();

        // Create the ClientLogo

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restClientLogoMockMvc.perform(put("/api/client-logos")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientLogo)))
            .andExpect(status().isCreated());

        // Validate the ClientLogo in the database
        List<ClientLogo> clientLogoList = clientLogoRepository.findAll();
        assertThat(clientLogoList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteClientLogo() throws Exception {
        // Initialize the database
        clientLogoService.save(clientLogo);

        int databaseSizeBeforeDelete = clientLogoRepository.findAll().size();

        // Get the clientLogo
        restClientLogoMockMvc.perform(delete("/api/client-logos/{id}", clientLogo.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ClientLogo> clientLogoList = clientLogoRepository.findAll();
        assertThat(clientLogoList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClientLogo.class);
        ClientLogo clientLogo1 = new ClientLogo();
        clientLogo1.setId(1L);
        ClientLogo clientLogo2 = new ClientLogo();
        clientLogo2.setId(clientLogo1.getId());
        assertThat(clientLogo1).isEqualTo(clientLogo2);
        clientLogo2.setId(2L);
        assertThat(clientLogo1).isNotEqualTo(clientLogo2);
        clientLogo1.setId(null);
        assertThat(clientLogo1).isNotEqualTo(clientLogo2);
    }
}
