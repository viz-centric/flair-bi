package com.flair.bi.service.impl;

import com.flair.bi.service.VisualizationColorsService;
import com.flair.bi.domain.VisualizationColors;
import com.flair.bi.repository.VisualizationColorsRepository;
import com.flair.bi.service.dto.VisualizationColorsDTO;
import com.flair.bi.service.mapper.VisualizationColorsMapper;
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
 * Service Implementation for managing VisualizationColors.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class VisualizationColorsServiceImpl implements VisualizationColorsService{

    private final VisualizationColorsRepository visualizationColorsRepository;

    private final VisualizationColorsMapper visualizationColorsMapper;

    /**
     * Save a visualizationColors.
     *
     * @param visualizationColorsDTO the entity to save
     * @return the persisted entity
     */
    public VisualizationColorsDTO save(VisualizationColorsDTO visualizationColorsDTO) {
        log.debug("Request to save VisualizationColors : {}", visualizationColorsDTO);
        VisualizationColors visualizationColors = visualizationColorsMapper.visualizationColorsDTOToVisualizationColors(visualizationColorsDTO);
        visualizationColors = visualizationColorsRepository.save(visualizationColors);
        VisualizationColorsDTO result = visualizationColorsMapper.visualizationColorsToVisualizationColorsDTO(visualizationColors);
        return result;
    }

    /**
     *  Get all the visualizationColors.
     *  
     *  @return the list of entities
     */
    @Transactional(readOnly = true) 
    public List<VisualizationColorsDTO> findAll() {
        log.debug("Request to get all VisualizationColors");
        List<VisualizationColorsDTO> result = visualizationColorsRepository.findAll().stream()
            .map(visualizationColorsMapper::visualizationColorsToVisualizationColorsDTO)
            .collect(Collectors.toCollection(LinkedList::new));

        return result;
    }

    /**
     *  Get one visualizationColors by id.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    @Transactional(readOnly = true) 
    public VisualizationColorsDTO findOne(Long id) {
        log.debug("Request to get VisualizationColors : {}", id);
        VisualizationColors visualizationColors = visualizationColorsRepository.findOne(id);
        VisualizationColorsDTO visualizationColorsDTO = visualizationColorsMapper.visualizationColorsToVisualizationColorsDTO(visualizationColors);
        return visualizationColorsDTO;
    }

    /**
     *  Delete the  visualizationColors by id.
     *
     *  @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete VisualizationColors : {}", id);
        visualizationColorsRepository.delete(id);
    }
}
