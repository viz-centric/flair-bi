package com.flair.bi.service.impl;

import com.flair.bi.service.FunctionsService;
import com.flair.bi.domain.Functions;
import com.flair.bi.repository.FunctionsRepository;
import com.flair.bi.service.dto.FunctionsDTO;
import com.flair.bi.service.mapper.FunctionsMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import javax.inject.Inject;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Functions.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FunctionsServiceImpl implements FunctionsService{

    private final FunctionsRepository functionsRepository;

    private final FunctionsMapper functionsMapper;

    /**
     * Save a functions.
     *
     * @param functionsDTO the entity to save
     * @return the persisted entity
     */
    public FunctionsDTO save(FunctionsDTO functionsDTO) {
        log.debug("Request to save Functions : {}", functionsDTO);
        Functions functions = functionsMapper.functionsDTOToFunctions(functionsDTO);
        functions = functionsRepository.save(functions);
        FunctionsDTO result = functionsMapper.functionsToFunctionsDTO(functions);
        return result;
    }

    /**
     *  Get all the functions.
     *  
     *  @return the list of entities
     */
    @Transactional(readOnly = true) 
    public List<FunctionsDTO> findAll() {
        log.debug("Request to get all Functions");
        List<FunctionsDTO> result = functionsRepository.findAll().stream()
            .map(functionsMapper::functionsToFunctionsDTO)
            .collect(Collectors.toCollection(LinkedList::new));

        return result;
    }

    /**
     *  Get one functions by id.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    @Transactional(readOnly = true) 
    public FunctionsDTO findOne(Long id) {
        log.debug("Request to get Functions : {}", id);
        Functions functions = functionsRepository.findOne(id);
        FunctionsDTO functionsDTO = functionsMapper.functionsToFunctionsDTO(functions);
        return functionsDTO;
    }

    /**
     *  Delete the  functions by id.
     *
     *  @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete Functions : {}", id);
        functionsRepository.delete(id);
    }
}
