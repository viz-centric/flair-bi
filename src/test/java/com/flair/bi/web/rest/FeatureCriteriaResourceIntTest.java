package com.flair.bi.web.rest;

import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.*;
import com.flair.bi.domain.enumeration.FeatureType;
import com.flair.bi.repository.FeatureCriteriaRepository;
import com.flair.bi.security.PermissionGrantedAuthority;
import com.flair.bi.service.BookMarkWatchService;
import com.flair.bi.service.FeatureCriteriaService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.mapper.FeatureCriteriaMapper;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.dto.CreateUpdateFeatureCriteriaDTO;
import com.flair.bi.web.rest.errors.ExceptionTranslator;
import com.querydsl.core.BooleanBuilder;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the FeatureCriteriaResource REST controller.
 *
 * @see FeatureCriteriaResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = FlairbiApp.class)
public class FeatureCriteriaResourceIntTest {

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    @Autowired
    private FeatureCriteriaRepository featureCriteriaRepository;

    @Autowired
    private FeatureCriteriaService featureCriteriaService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    @Autowired
    private UserService userService;

    @Autowired
    private FeatureCriteriaMapper featureCriteriaMapper;

    private MockMvc restFeatureCriteriaMockMvc;

    private FeatureCriteria featureCriteria;

    private User user;
    
    private  BookMarkWatchService bookMarkWatchService;
    
    private  ViewService viewService;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        FeatureCriteriaResource featureCriteriaResource = new FeatureCriteriaResource(featureCriteriaService, featureCriteriaMapper,bookMarkWatchService,viewService);
        this.restFeatureCriteriaMockMvc = MockMvcBuilders.standaloneSetup(featureCriteriaResource)
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
    public static FeatureCriteria createEntity(EntityManager em, User user) {
        FeatureCriteria featureCriteria = new FeatureCriteria()
            .value(DEFAULT_VALUE);
        Datasource datasource = DatasourceResourceIntTest.createEntity(em);

        em.persist(datasource);
        em.flush();
        // Add required entity
        Feature feature = new Feature();
        feature.setFeatureType(FeatureType.DIMENSION);
        feature.setDefinition("price");
        feature.setType("type");
        feature.setName("name");
        feature.setDatasource(datasource);
        em.persist(feature);
        em.flush();
        featureCriteria.setFeature(feature);
        featureCriteria.setValue(DEFAULT_VALUE);
        // Add required entity
        FeatureBookmark featureBookmark = FeatureBookmarkResourceIntTest.createEntity(em, user);
        em.persist(featureBookmark);
        em.flush();

        featureBookmark.addFeatureCriteria(featureCriteria);
        return featureCriteria;
    }

    @Before
    public void initTest() {
        user = UserResourceIntTest.createEntity(userService);
        featureCriteria = createEntity(em, user);
    }

    @Test
    @Transactional
    public void createFeatureCriteria() throws Exception {
        int databaseSizeBeforeCreate = featureCriteriaRepository.findAll().size();

        CreateUpdateFeatureCriteriaDTO dto = new CreateUpdateFeatureCriteriaDTO();
        dto.setValue(featureCriteria.getValue());
        dto.setFeature(new CreateUpdateFeatureCriteriaDTO.FeatureDTO(featureCriteria.getFeature().getId()));
        dto.setFeatureBookmark(new CreateUpdateFeatureCriteriaDTO.FeatureBookmarkDTO(featureCriteria.getFeatureBookmark().getId()));

        // Create the FeatureCriteria
        MvcResult mvcResult = restFeatureCriteriaMockMvc.perform(post("/api/feature-criteria")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(dto)))
            .andExpect(status().isCreated())
            .andReturn();

        mvcResult.getResponse();

        // Validate the FeatureCriteria in the database
        List<FeatureCriteria> featureCriteriaList = featureCriteriaRepository.findAll();
        assertThat(featureCriteriaList).hasSize(databaseSizeBeforeCreate + 1);
        FeatureCriteria testFeatureCriteria = featureCriteriaList.get(featureCriteriaList.size() - 1);
        assertThat(testFeatureCriteria.getValue()).isEqualTo(DEFAULT_VALUE);
    }

    @Test
    @Transactional
    public void createFeatureCriteriaWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = featureCriteriaRepository.findAll().size();
        featureCriteriaService.save(featureCriteria);
        // Create the FeatureCriteria with an existing ID
        CreateUpdateFeatureCriteriaDTO dto = new CreateUpdateFeatureCriteriaDTO();
        dto.setValue(featureCriteria.getValue());
        dto.setFeature(new CreateUpdateFeatureCriteriaDTO.FeatureDTO(featureCriteria.getFeature().getId()));
        dto.setFeatureBookmark(new CreateUpdateFeatureCriteriaDTO.FeatureBookmarkDTO(featureCriteria.getFeatureBookmark().getId()));
        dto.setId(featureCriteria.getId());

        // An entity with an existing ID cannot be created, so this API call must fail
        restFeatureCriteriaMockMvc.perform(post("/api/feature-criteria")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(dto)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<FeatureCriteria> featureCriteriaList = featureCriteriaRepository.findAll();
        assertThat(featureCriteriaList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkValueIsRequired() throws Exception {
        int databaseSizeBeforeTest = featureCriteriaRepository.findAll().size();
        // set the field null

        // Create the FeatureCriteria with an existing ID
        CreateUpdateFeatureCriteriaDTO dto = new CreateUpdateFeatureCriteriaDTO();
        dto.setValue(null);
        dto.setFeature(new CreateUpdateFeatureCriteriaDTO.FeatureDTO(featureCriteria.getFeature().getId()));
        dto.setFeatureBookmark(new CreateUpdateFeatureCriteriaDTO.FeatureBookmarkDTO(featureCriteria.getFeatureBookmark().getId()));


        // Create the FeatureCriteria, which fails.

        restFeatureCriteriaMockMvc.perform(post("/api/feature-criteria")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(dto)))
            .andExpect(status().isBadRequest());

        List<FeatureCriteria> featureCriteriaList = featureCriteriaRepository.findAll();
        assertThat(featureCriteriaList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllFeatureCriteria() throws Exception {
        // Initialize the database
        featureCriteriaRepository.saveAndFlush(featureCriteria);

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
            user.getLogin(),
            user.getPassword(),
            user.getPermissions().stream().map(PermissionGrantedAuthority::new).collect(Collectors.toList())
        ));

        // Get all the featureCriteriaList
        restFeatureCriteriaMockMvc.perform(get("/api/feature-criteria"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(featureCriteria.getId().intValue())))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE.toString())));
    }

    @Test
    @Transactional
    public void getFeatureCriteria() throws Exception {
        // Initialize the database
        featureCriteriaRepository.saveAndFlush(featureCriteria);

        // Get the featureCriteria
        restFeatureCriteriaMockMvc.perform(get("/api/feature-criteria/{id}", featureCriteria.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(featureCriteria.getId().intValue()))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingFeatureCriteria() throws Exception {
        // Get the featureCriteria
        restFeatureCriteriaMockMvc.perform(get("/api/feature-criteria/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFeatureCriteria() throws Exception {
        // Initialize the database
        featureCriteriaService.save(featureCriteria);

        int databaseSizeBeforeUpdate = featureCriteriaRepository.findAll().size();

        // Update the featureCriteria
        FeatureCriteria updatedFeatureCriteria = featureCriteriaRepository.findOne(featureCriteria.getId());
        updatedFeatureCriteria
            .value(UPDATED_VALUE);

        CreateUpdateFeatureCriteriaDTO dto = new CreateUpdateFeatureCriteriaDTO();
        dto.setValue(UPDATED_VALUE);
        dto.setFeatureBookmark(new CreateUpdateFeatureCriteriaDTO.FeatureBookmarkDTO(updatedFeatureCriteria.getFeatureBookmark().getId()));
        dto.setFeature(new CreateUpdateFeatureCriteriaDTO.FeatureDTO(updatedFeatureCriteria.getFeature().getId()));
        dto.setId(updatedFeatureCriteria.getId());

        restFeatureCriteriaMockMvc.perform(put("/api/feature-criteria")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(dto)))
            .andExpect(status().isOk());

        // Validate the FeatureCriteria in the database
        List<FeatureCriteria> featureCriteriaList = featureCriteriaRepository.findAll();
        assertThat(featureCriteriaList).hasSize(databaseSizeBeforeUpdate);
        FeatureCriteria testFeatureCriteria = featureCriteriaList.get(featureCriteriaList.size() - 1);
        assertThat(testFeatureCriteria.getValue()).isEqualTo(UPDATED_VALUE);
    }

    @Test
    @Transactional
    public void updateNonExistingFeatureCriteria() throws Exception {
        int databaseSizeBeforeUpdate = featureCriteriaRepository.findAll().size();

        // Create the FeatureCriteria
        CreateUpdateFeatureCriteriaDTO dto = new CreateUpdateFeatureCriteriaDTO();
        dto.setValue(featureCriteria.getValue());
        dto.setFeature(new CreateUpdateFeatureCriteriaDTO.FeatureDTO(featureCriteria.getFeature().getId()));
        dto.setFeatureBookmark(new CreateUpdateFeatureCriteriaDTO.FeatureBookmarkDTO(featureCriteria.getFeatureBookmark().getId()));

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restFeatureCriteriaMockMvc.perform(put("/api/feature-criteria")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(dto)))
            .andExpect(status().isCreated());

        // Validate the FeatureCriteria in the database
        List<FeatureCriteria> featureCriteriaList = featureCriteriaRepository.findAll();
        assertThat(featureCriteriaList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteFeatureCriteria() throws Exception {
        // Initialize the database

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
            user.getLogin(),
            user.getPassword(),
            user.getPermissions().stream().map(PermissionGrantedAuthority::new).collect(Collectors.toList())
        ));

        featureCriteriaService.save(featureCriteria);

        int databaseSizeBeforeDelete = featureCriteriaService.findAll(new BooleanBuilder()).size();

        // Get the featureCriteria
        MvcResult mvcResult = restFeatureCriteriaMockMvc.perform(delete("/api/feature-criteria/{id}", featureCriteria.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
//            .andExpect(status().isOk())
            .andReturn();

        mvcResult.getResponse();

        // Validate the database is empty
        List<FeatureCriteria> featureCriteriaList = featureCriteriaService.findAll(new BooleanBuilder());
        assertThat(featureCriteriaList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Ignore
    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FeatureCriteria.class);
        FeatureCriteria featureCriteria1 = new FeatureCriteria();
        featureCriteria1.setId(1L);
        FeatureCriteria featureCriteria2 = new FeatureCriteria();
        featureCriteria2.setId(featureCriteria1.getId());
        assertThat(featureCriteria1).isEqualTo(featureCriteria2);
        featureCriteria2.setId(2L);
        assertThat(featureCriteria1).isNotEqualTo(featureCriteria2);
        featureCriteria1.setId(null);
        assertThat(featureCriteria1).isNotEqualTo(featureCriteria2);
    }
}
