package com.flair.bi.web.rest;

import com.flair.bi.FlairbiApp;

import com.flair.bi.domain.Realm;
import com.flair.bi.repository.RealmRepository;
import com.flair.bi.service.impl.RealmService;
import com.flair.bi.web.rest.dto.RealmDTO;
import com.flair.bi.web.rest.errors.ExceptionTranslator;

import org.junit.Before;
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
 * Test class for the RealmResource REST controller.
 *
 * @see RealmResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = FlairbiApp.class)
public class RealmResourceIntTest {

    @Autowired
    private RealmRepository realmRepository;

    @Autowired
    private RealmService realmService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restRealmMockMvc;

    private Realm realm;

    private RealmDTO realmDTO;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        RealmResource realmResource = new RealmResource(realmService);
        this.restRealmMockMvc = MockMvcBuilders.standaloneSetup(realmResource)
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
    public static Realm createEntity(EntityManager em) {
        Realm realm = new Realm();
        return realm;
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RealmDTO createDTOEntity(EntityManager em) {
        RealmDTO realmDTO = new RealmDTO();
        return realmDTO;
    }

    @Before
    public void initTest() {
        realm = createEntity(em);
        realmDTO = createDTOEntity(em);

    }

    @Test
    @Transactional
    public void createRealm() throws Exception {
        int databaseSizeBeforeCreate = realmRepository.findAll().size();

        // Create the Realm
        restRealmMockMvc.perform(post("/api/realms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(realm)))
            .andExpect(status().isCreated());

        // Validate the Realm in the database
        List<Realm> realmList = realmRepository.findAll();
        assertThat(realmList).hasSize(databaseSizeBeforeCreate + 1);
        Realm testRealm = realmList.get(realmList.size() - 1);
    }

    @Test
    @Transactional
    public void createRealmWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = realmRepository.findAll().size();

        // Create the Realm with an existing ID
        realm.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restRealmMockMvc.perform(post("/api/realms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(realm)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<Realm> realmList = realmRepository.findAll();
        assertThat(realmList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllRealms() throws Exception {
        // Initialize the database
        realmRepository.saveAndFlush(realm);

        // Get all the realmList
        restRealmMockMvc.perform(get("/api/realms?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(realm.getId().intValue())));
    }

    @Test
    @Transactional
    public void getRealm() throws Exception {
        // Initialize the database
        realmRepository.saveAndFlush(realm);

        // Get the realm
        restRealmMockMvc.perform(get("/api/realms/{id}", realm.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(realm.getId().intValue()));
    }

    @Test
    @Transactional
    public void getNonExistingRealm() throws Exception {
        // Get the realm
        restRealmMockMvc.perform(get("/api/realms/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateRealm() throws Exception {
        // Initialize the database
        realmService.save(realmDTO);

        int databaseSizeBeforeUpdate = realmRepository.findAll().size();

        // Update the realm
        Realm updatedRealm = realmRepository.getOne(realm.getId());

        restRealmMockMvc.perform(put("/api/realms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedRealm)))
            .andExpect(status().isOk());

        // Validate the Realm in the database
        List<Realm> realmList = realmRepository.findAll();
        assertThat(realmList).hasSize(databaseSizeBeforeUpdate);
        Realm testRealm = realmList.get(realmList.size() - 1);
    }

    @Test
    @Transactional
    public void updateNonExistingRealm() throws Exception {
        int databaseSizeBeforeUpdate = realmRepository.findAll().size();

        // Create the Realm

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restRealmMockMvc.perform(put("/api/realms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(realm)))
            .andExpect(status().isCreated());

        // Validate the Realm in the database
        List<Realm> realmList = realmRepository.findAll();
        assertThat(realmList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteRealm() throws Exception {
        // Initialize the database
        realmService.save(realmDTO);

        int databaseSizeBeforeDelete = realmRepository.findAll().size();

        // Get the realm
        restRealmMockMvc.perform(delete("/api/realms/{id}", realm.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Realm> realmList = realmRepository.findAll();
        assertThat(realmList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Realm.class);
        Realm realm1 = new Realm();
        realm1.setId(1L);
        Realm realm2 = new Realm();
        realm2.setId(realm1.getId());
        assertThat(realm1).isEqualTo(realm2);
        realm2.setId(2L);
        assertThat(realm1).isNotEqualTo(realm2);
        realm1.setId(null);
        assertThat(realm1).isNotEqualTo(realm2);
    }
}
