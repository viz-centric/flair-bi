package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.FlairbiApp;

import com.flair.bi.domain.FileUploaderStatus;
import com.flair.bi.repository.FileUploaderStatusRepository;
import com.flair.bi.service.FileUploaderStatusService;
import com.flair.bi.service.dto.FileUploaderStatusDTO;
import com.flair.bi.service.mapper.FileUploaderStatusMapper;

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
 * Test class for the FileUploaderStatusResource REST controller.
 *
 * @see FileUploaderStatusResource
 */
@Ignore
public class FileUploaderStatusResourceIntTest extends AbstractIntegrationTest {

    private static final String DEFAULT_FILE_SYSTEM = "AAAAAAAAAA";
    private static final String UPDATED_FILE_SYSTEM = "BBBBBBBBBB";

    private static final String DEFAULT_FILE_NAME = "AAAAAAAAAA";
    private static final String UPDATED_FILE_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_CONTENT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_CONTENT_TYPE = "BBBBBBBBBB";

    private static final Boolean DEFAULT_IS_FILE_PROCESSED = false;
    private static final Boolean UPDATED_IS_FILE_PROCESSED = true;

    private static final String DEFAULT_FILE_LOCATION = "AAAAAAAAAA";
    private static final String UPDATED_FILE_LOCATION = "BBBBBBBBBB";

    @Inject
    private FileUploaderStatusRepository fileUploaderStatusRepository;

    @Inject
    private FileUploaderStatusMapper fileUploaderStatusMapper;

    @Inject
    private FileUploaderStatusService fileUploaderStatusService;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private EntityManager em;

    private MockMvc restFileUploaderStatusMockMvc;

    private FileUploaderStatus fileUploaderStatus;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        FileUploaderStatusResource fileUploaderStatusResource = new FileUploaderStatusResource(fileUploaderStatusService);
        this.restFileUploaderStatusMockMvc = MockMvcBuilders.standaloneSetup(fileUploaderStatusResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FileUploaderStatus createEntity(EntityManager em) {
        FileUploaderStatus fileUploaderStatus = new FileUploaderStatus()
                .fileSystem(DEFAULT_FILE_SYSTEM)
                .fileName(DEFAULT_FILE_NAME)
                .contentType(DEFAULT_CONTENT_TYPE)
                .isFileProcessed(DEFAULT_IS_FILE_PROCESSED)
                .fileLocation(DEFAULT_FILE_LOCATION);
        return fileUploaderStatus;
    }

    @Before
    public void initTest() {
        fileUploaderStatus = createEntity(em);
    }

    @Test
    @Transactional
    public void createFileUploaderStatus() throws Exception {
        int databaseSizeBeforeCreate = fileUploaderStatusRepository.findAll().size();

        // Create the FileUploaderStatus
        FileUploaderStatusDTO fileUploaderStatusDTO = fileUploaderStatusMapper.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus);

        restFileUploaderStatusMockMvc.perform(post("/api/file-uploader-statuses")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fileUploaderStatusDTO)))
            .andExpect(status().isCreated());

        // Validate the FileUploaderStatus in the database
        List<FileUploaderStatus> fileUploaderStatusList = fileUploaderStatusRepository.findAll();
        assertThat(fileUploaderStatusList).hasSize(databaseSizeBeforeCreate + 1);
        FileUploaderStatus testFileUploaderStatus = fileUploaderStatusList.get(fileUploaderStatusList.size() - 1);
        assertThat(testFileUploaderStatus.getFileSystem()).isEqualTo(DEFAULT_FILE_SYSTEM);
        assertThat(testFileUploaderStatus.getFileName()).isEqualTo(DEFAULT_FILE_NAME);
        assertThat(testFileUploaderStatus.getContentType()).isEqualTo(DEFAULT_CONTENT_TYPE);
        assertThat(testFileUploaderStatus.isIsFileProcessed()).isEqualTo(DEFAULT_IS_FILE_PROCESSED);
        assertThat(testFileUploaderStatus.getFileLocation()).isEqualTo(DEFAULT_FILE_LOCATION);
    }

    @Test
    @Transactional
    public void createFileUploaderStatusWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = fileUploaderStatusRepository.findAll().size();

        // Create the FileUploaderStatus with an existing ID
        FileUploaderStatus existingFileUploaderStatus = new FileUploaderStatus();
        existingFileUploaderStatus.setId(1L);
        FileUploaderStatusDTO existingFileUploaderStatusDTO = fileUploaderStatusMapper.fileUploaderStatusToFileUploaderStatusDTO(existingFileUploaderStatus);

        // An entity with an existing ID cannot be created, so this API call must fail
        restFileUploaderStatusMockMvc.perform(post("/api/file-uploader-statuses")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(existingFileUploaderStatusDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<FileUploaderStatus> fileUploaderStatusList = fileUploaderStatusRepository.findAll();
        assertThat(fileUploaderStatusList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkFileSystemIsRequired() throws Exception {
        int databaseSizeBeforeTest = fileUploaderStatusRepository.findAll().size();
        // set the field null
        fileUploaderStatus.setFileSystem(null);

        // Create the FileUploaderStatus, which fails.
        FileUploaderStatusDTO fileUploaderStatusDTO = fileUploaderStatusMapper.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus);

        restFileUploaderStatusMockMvc.perform(post("/api/file-uploader-statuses")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fileUploaderStatusDTO)))
            .andExpect(status().isBadRequest());

        List<FileUploaderStatus> fileUploaderStatusList = fileUploaderStatusRepository.findAll();
        assertThat(fileUploaderStatusList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkFileNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = fileUploaderStatusRepository.findAll().size();
        // set the field null
        fileUploaderStatus.setFileName(null);

        // Create the FileUploaderStatus, which fails.
        FileUploaderStatusDTO fileUploaderStatusDTO = fileUploaderStatusMapper.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus);

        restFileUploaderStatusMockMvc.perform(post("/api/file-uploader-statuses")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fileUploaderStatusDTO)))
            .andExpect(status().isBadRequest());

        List<FileUploaderStatus> fileUploaderStatusList = fileUploaderStatusRepository.findAll();
        assertThat(fileUploaderStatusList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkIsFileProcessedIsRequired() throws Exception {
        int databaseSizeBeforeTest = fileUploaderStatusRepository.findAll().size();
        // set the field null
        fileUploaderStatus.setIsFileProcessed(null);

        // Create the FileUploaderStatus, which fails.
        FileUploaderStatusDTO fileUploaderStatusDTO = fileUploaderStatusMapper.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus);

        restFileUploaderStatusMockMvc.perform(post("/api/file-uploader-statuses")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fileUploaderStatusDTO)))
            .andExpect(status().isBadRequest());

        List<FileUploaderStatus> fileUploaderStatusList = fileUploaderStatusRepository.findAll();
        assertThat(fileUploaderStatusList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllFileUploaderStatuses() throws Exception {
        // Initialize the database
        fileUploaderStatusRepository.saveAndFlush(fileUploaderStatus);

        // Get all the fileUploaderStatusList
        restFileUploaderStatusMockMvc.perform(get("/api/file-uploader-statuses?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(fileUploaderStatus.getId().intValue())))
            .andExpect(jsonPath("$.[*].fileSystem").value(hasItem(DEFAULT_FILE_SYSTEM.toString())))
            .andExpect(jsonPath("$.[*].fileName").value(hasItem(DEFAULT_FILE_NAME.toString())))
            .andExpect(jsonPath("$.[*].contentType").value(hasItem(DEFAULT_CONTENT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].isFileProcessed").value(hasItem(DEFAULT_IS_FILE_PROCESSED.booleanValue())))
            .andExpect(jsonPath("$.[*].fileLocation").value(hasItem(DEFAULT_FILE_LOCATION.toString())));
    }

    @Test
    @Transactional
    public void getFileUploaderStatus() throws Exception {
        // Initialize the database
        fileUploaderStatusRepository.saveAndFlush(fileUploaderStatus);

        // Get the fileUploaderStatus
        restFileUploaderStatusMockMvc.perform(get("/api/file-uploader-statuses/{id}", fileUploaderStatus.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(fileUploaderStatus.getId().intValue()))
            .andExpect(jsonPath("$.fileSystem").value(DEFAULT_FILE_SYSTEM.toString()))
            .andExpect(jsonPath("$.fileName").value(DEFAULT_FILE_NAME.toString()))
            .andExpect(jsonPath("$.contentType").value(DEFAULT_CONTENT_TYPE.toString()))
            .andExpect(jsonPath("$.isFileProcessed").value(DEFAULT_IS_FILE_PROCESSED.booleanValue()))
            .andExpect(jsonPath("$.fileLocation").value(DEFAULT_FILE_LOCATION.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingFileUploaderStatus() throws Exception {
        // Get the fileUploaderStatus
        restFileUploaderStatusMockMvc.perform(get("/api/file-uploader-statuses/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFileUploaderStatus() throws Exception {
        // Initialize the database
        fileUploaderStatusRepository.saveAndFlush(fileUploaderStatus);
        int databaseSizeBeforeUpdate = fileUploaderStatusRepository.findAll().size();

        // Update the fileUploaderStatus
        FileUploaderStatus updatedFileUploaderStatus = fileUploaderStatusRepository.findOne(fileUploaderStatus.getId());
        updatedFileUploaderStatus
                .fileSystem(UPDATED_FILE_SYSTEM)
                .fileName(UPDATED_FILE_NAME)
                .contentType(UPDATED_CONTENT_TYPE)
                .isFileProcessed(UPDATED_IS_FILE_PROCESSED)
                .fileLocation(UPDATED_FILE_LOCATION);
        FileUploaderStatusDTO fileUploaderStatusDTO = fileUploaderStatusMapper.fileUploaderStatusToFileUploaderStatusDTO(updatedFileUploaderStatus);

        restFileUploaderStatusMockMvc.perform(put("/api/file-uploader-statuses")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fileUploaderStatusDTO)))
            .andExpect(status().isOk());

        // Validate the FileUploaderStatus in the database
        List<FileUploaderStatus> fileUploaderStatusList = fileUploaderStatusRepository.findAll();
        assertThat(fileUploaderStatusList).hasSize(databaseSizeBeforeUpdate);
        FileUploaderStatus testFileUploaderStatus = fileUploaderStatusList.get(fileUploaderStatusList.size() - 1);
        assertThat(testFileUploaderStatus.getFileSystem()).isEqualTo(UPDATED_FILE_SYSTEM);
        assertThat(testFileUploaderStatus.getFileName()).isEqualTo(UPDATED_FILE_NAME);
        assertThat(testFileUploaderStatus.getContentType()).isEqualTo(UPDATED_CONTENT_TYPE);
        assertThat(testFileUploaderStatus.isIsFileProcessed()).isEqualTo(UPDATED_IS_FILE_PROCESSED);
        assertThat(testFileUploaderStatus.getFileLocation()).isEqualTo(UPDATED_FILE_LOCATION);
    }

    @Test
    @Transactional
    public void updateNonExistingFileUploaderStatus() throws Exception {
        int databaseSizeBeforeUpdate = fileUploaderStatusRepository.findAll().size();

        // Create the FileUploaderStatus
        FileUploaderStatusDTO fileUploaderStatusDTO = fileUploaderStatusMapper.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus);

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restFileUploaderStatusMockMvc.perform(put("/api/file-uploader-statuses")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fileUploaderStatusDTO)))
            .andExpect(status().isCreated());

        // Validate the FileUploaderStatus in the database
        List<FileUploaderStatus> fileUploaderStatusList = fileUploaderStatusRepository.findAll();
        assertThat(fileUploaderStatusList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteFileUploaderStatus() throws Exception {
        // Initialize the database
        fileUploaderStatusRepository.saveAndFlush(fileUploaderStatus);
        int databaseSizeBeforeDelete = fileUploaderStatusRepository.findAll().size();

        // Get the fileUploaderStatus
        restFileUploaderStatusMockMvc.perform(delete("/api/file-uploader-statuses/{id}", fileUploaderStatus.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<FileUploaderStatus> fileUploaderStatusList = fileUploaderStatusRepository.findAll();
        assertThat(fileUploaderStatusList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
