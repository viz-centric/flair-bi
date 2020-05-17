package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.FlairbiApp;

import com.flair.bi.domain.VisualizationColors;
import com.flair.bi.repository.VisualizationColorsRepository;
import com.flair.bi.service.VisualizationColorsService;
import com.flair.bi.service.dto.VisualizationColorsDTO;
import com.flair.bi.service.mapper.VisualizationColorsMapper;

import org.junit.Before;
import org.junit.Ignore;
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
 * Test class for the VisualizationColorsResource REST controller.
 *
 * @see VisualizationColorsResource
 */
@Ignore
public class VisualizationColorsResourceIntTest extends AbstractIntegrationTest {

	private static final String DEFAULT_CODE = "AAAAAAAAAA";
	private static final String UPDATED_CODE = "BBBBBBBBBB";

	@Inject
	private VisualizationColorsRepository visualizationColorsRepository;

	@Inject
	private VisualizationColorsMapper visualizationColorsMapper;

	@Inject
	private VisualizationColorsService visualizationColorsService;

	@Inject
	private MappingJackson2HttpMessageConverter jacksonMessageConverter;

	@Inject
	private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

	@Inject
	private EntityManager em;

	private MockMvc restVisualizationColorsMockMvc;

	private VisualizationColors visualizationColors;

	@Before
	public void setup() {
		MockitoAnnotations.initMocks(this);
		VisualizationColorsResource visualizationColorsResource = new VisualizationColorsResource(
				visualizationColorsService);
		this.restVisualizationColorsMockMvc = MockMvcBuilders.standaloneSetup(visualizationColorsResource)
				.setCustomArgumentResolvers(pageableArgumentResolver).setMessageConverters(jacksonMessageConverter)
				.build();
	}

	/**
	 * Create an entity for this test.
	 *
	 * This is a static method, as tests for other entities might also need it, if
	 * they test an entity which requires the current entity.
	 */
	public static VisualizationColors createEntity(EntityManager em) {
		VisualizationColors visualizationColors = new VisualizationColors().code(DEFAULT_CODE);
		return visualizationColors;
	}

	@Before
	public void initTest() {
		visualizationColors = createEntity(em);
	}

	@Test
	@Transactional
	public void createVisualizationColors() throws Exception {
		int databaseSizeBeforeCreate = visualizationColorsRepository.findAll().size();

		// Create the VisualizationColors
		VisualizationColorsDTO visualizationColorsDTO = visualizationColorsMapper
				.visualizationColorsToVisualizationColorsDTO(visualizationColors);

		restVisualizationColorsMockMvc
				.perform(post("/api/visualization-colors").contentType(TestUtil.APPLICATION_JSON_UTF8)
						.content(TestUtil.convertObjectToJsonBytes(visualizationColorsDTO)))
				.andExpect(status().isCreated());

		// Validate the VisualizationColors in the database
		List<VisualizationColors> visualizationColorsList = visualizationColorsRepository.findAll();
		assertThat(visualizationColorsList).hasSize(databaseSizeBeforeCreate + 1);
		VisualizationColors testVisualizationColors = visualizationColorsList.get(visualizationColorsList.size() - 1);
		assertThat(testVisualizationColors.getCode()).isEqualTo(DEFAULT_CODE);
	}

	@Test
	@Transactional
	public void createVisualizationColorsWithExistingId() throws Exception {
		int databaseSizeBeforeCreate = visualizationColorsRepository.findAll().size();

		// Create the VisualizationColors with an existing ID
		VisualizationColors existingVisualizationColors = new VisualizationColors();
		existingVisualizationColors.setId(1L);
		VisualizationColorsDTO existingVisualizationColorsDTO = visualizationColorsMapper
				.visualizationColorsToVisualizationColorsDTO(existingVisualizationColors);

		// An entity with an existing ID cannot be created, so this API call must fail
		restVisualizationColorsMockMvc
				.perform(post("/api/visualization-colors").contentType(TestUtil.APPLICATION_JSON_UTF8)
						.content(TestUtil.convertObjectToJsonBytes(existingVisualizationColorsDTO)))
				.andExpect(status().isBadRequest());

		// Validate the Alice in the database
		List<VisualizationColors> visualizationColorsList = visualizationColorsRepository.findAll();
		assertThat(visualizationColorsList).hasSize(databaseSizeBeforeCreate);
	}

	@Test
	@Transactional
	public void checkCodeIsRequired() throws Exception {
		int databaseSizeBeforeTest = visualizationColorsRepository.findAll().size();
		// set the field null
		visualizationColors.setCode(null);

		// Create the VisualizationColors, which fails.
		VisualizationColorsDTO visualizationColorsDTO = visualizationColorsMapper
				.visualizationColorsToVisualizationColorsDTO(visualizationColors);

		restVisualizationColorsMockMvc
				.perform(post("/api/visualization-colors").contentType(TestUtil.APPLICATION_JSON_UTF8)
						.content(TestUtil.convertObjectToJsonBytes(visualizationColorsDTO)))
				.andExpect(status().isBadRequest());

		List<VisualizationColors> visualizationColorsList = visualizationColorsRepository.findAll();
		assertThat(visualizationColorsList).hasSize(databaseSizeBeforeTest);
	}

	@Test
	@Transactional
	public void getAllVisualizationColors() throws Exception {
		// Initialize the database
		visualizationColorsRepository.saveAndFlush(visualizationColors);

		// Get all the visualizationColorsList
		restVisualizationColorsMockMvc.perform(get("/api/visualization-colors?sort=id,desc")).andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.[*].id").value(hasItem(visualizationColors.getId().intValue())))
				.andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE.toString())));
	}

	@Test
	@Transactional
	public void getVisualizationColors() throws Exception {
		// Initialize the database
		visualizationColorsRepository.saveAndFlush(visualizationColors);

		// Get the visualizationColors
		restVisualizationColorsMockMvc.perform(get("/api/visualization-colors/{id}", visualizationColors.getId()))
				.andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.id").value(visualizationColors.getId().intValue()))
				.andExpect(jsonPath("$.code").value(DEFAULT_CODE.toString()));
	}

	@Test
	@Transactional
	public void getNonExistingVisualizationColors() throws Exception {
		// Get the visualizationColors
		restVisualizationColorsMockMvc.perform(get("/api/visualization-colors/{id}", Long.MAX_VALUE))
				.andExpect(status().isNotFound());
	}

	@Test
	@Transactional
	public void updateVisualizationColors() throws Exception {
		// Initialize the database
		visualizationColorsRepository.saveAndFlush(visualizationColors);
		int databaseSizeBeforeUpdate = visualizationColorsRepository.findAll().size();

		// Update the visualizationColors
		VisualizationColors updatedVisualizationColors = visualizationColorsRepository
				.getOne(visualizationColors.getId());
		updatedVisualizationColors.code(UPDATED_CODE);
		VisualizationColorsDTO visualizationColorsDTO = visualizationColorsMapper
				.visualizationColorsToVisualizationColorsDTO(updatedVisualizationColors);

		restVisualizationColorsMockMvc
				.perform(put("/api/visualization-colors").contentType(TestUtil.APPLICATION_JSON_UTF8)
						.content(TestUtil.convertObjectToJsonBytes(visualizationColorsDTO)))
				.andExpect(status().isOk());

		// Validate the VisualizationColors in the database
		List<VisualizationColors> visualizationColorsList = visualizationColorsRepository.findAll();
		assertThat(visualizationColorsList).hasSize(databaseSizeBeforeUpdate);
		VisualizationColors testVisualizationColors = visualizationColorsList.get(visualizationColorsList.size() - 1);
		assertThat(testVisualizationColors.getCode()).isEqualTo(UPDATED_CODE);
	}

	@Test
	@Transactional
	public void updateNonExistingVisualizationColors() throws Exception {
		int databaseSizeBeforeUpdate = visualizationColorsRepository.findAll().size();

		// Create the VisualizationColors
		VisualizationColorsDTO visualizationColorsDTO = visualizationColorsMapper
				.visualizationColorsToVisualizationColorsDTO(visualizationColors);

		// If the entity doesn't have an ID, it will be created instead of just being
		// updated
		restVisualizationColorsMockMvc
				.perform(put("/api/visualization-colors").contentType(TestUtil.APPLICATION_JSON_UTF8)
						.content(TestUtil.convertObjectToJsonBytes(visualizationColorsDTO)))
				.andExpect(status().isCreated());

		// Validate the VisualizationColors in the database
		List<VisualizationColors> visualizationColorsList = visualizationColorsRepository.findAll();
		assertThat(visualizationColorsList).hasSize(databaseSizeBeforeUpdate + 1);
	}

	@Test
	@Transactional
	public void deleteVisualizationColors() throws Exception {
		// Initialize the database
		visualizationColorsRepository.saveAndFlush(visualizationColors);
		int databaseSizeBeforeDelete = visualizationColorsRepository.findAll().size();

		// Get the visualizationColors
		restVisualizationColorsMockMvc.perform(delete("/api/visualization-colors/{id}", visualizationColors.getId())
				.accept(TestUtil.APPLICATION_JSON_UTF8)).andExpect(status().isOk());

		// Validate the database is empty
		List<VisualizationColors> visualizationColorsList = visualizationColorsRepository.findAll();
		assertThat(visualizationColorsList).hasSize(databaseSizeBeforeDelete - 1);
	}
}
