package com.flair.bi.service.impl;

import com.flair.bi.service.FileUploaderStatusService;
import com.flair.bi.domain.FileUploaderStatus;
import com.flair.bi.repository.FileUploaderStatusRepository;
import com.flair.bi.service.dto.FileUploaderStatusDTO;
import com.flair.bi.service.mapper.FileUploaderStatusMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import javax.inject.Inject;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing FileUploaderStatus.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FileUploaderStatusServiceImpl implements FileUploaderStatusService{

    private final FileUploaderStatusRepository fileUploaderStatusRepository;

    private final FileUploaderStatusMapper fileUploaderStatusMapper;

    /**
     * Save a fileUploaderStatus.
     *
     * @param fileUploaderStatusDTO the entity to save
     * @return the persisted entity
     */
    public FileUploaderStatusDTO save(FileUploaderStatusDTO fileUploaderStatusDTO) {
        log.debug("Request to save FileUploaderStatus : {}", fileUploaderStatusDTO);
        FileUploaderStatus fileUploaderStatus = fileUploaderStatusMapper.fileUploaderStatusDTOToFileUploaderStatus(fileUploaderStatusDTO);
        fileUploaderStatus = fileUploaderStatusRepository.save(fileUploaderStatus);
        FileUploaderStatusDTO result = fileUploaderStatusMapper.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus);
        return result;
    }

    /**
     *  Get all the fileUploaderStatuses.
     *  
     *  @param pageable the pagination information
     *  @return the list of entities
     */
    @Transactional(readOnly = true) 
    public Page<FileUploaderStatusDTO> findAll(Pageable pageable) {
        log.debug("Request to get all FileUploaderStatuses");
        Page<FileUploaderStatus> result = fileUploaderStatusRepository.findAll(pageable);
        return result.map(fileUploaderStatus -> fileUploaderStatusMapper.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus));
    }

    /**
     *  Get one fileUploaderStatus by id.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    @Transactional(readOnly = true) 
    public FileUploaderStatusDTO findOne(Long id) {
        log.debug("Request to get FileUploaderStatus : {}", id);
        FileUploaderStatus fileUploaderStatus = fileUploaderStatusRepository.findOne(id);
        FileUploaderStatusDTO fileUploaderStatusDTO = fileUploaderStatusMapper.fileUploaderStatusToFileUploaderStatusDTO(fileUploaderStatus);
        return fileUploaderStatusDTO;
    }

    /**
     *  Delete the  fileUploaderStatus by id.
     *
     *  @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete FileUploaderStatus : {}", id);
        fileUploaderStatusRepository.delete(id);
    }
}
