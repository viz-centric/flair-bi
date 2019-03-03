package com.flair.bi.service;

import com.flair.bi.domain.Visualization;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.repository.FieldTypeRepository;
import com.flair.bi.repository.PropertyTypeRepository;
import com.flair.bi.repository.VisualizationRepository;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service Implementation for managing Visualization.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class VisualizationService {

    private final VisualizationRepository visualizationRepository;

    private final FieldTypeRepository fieldTypeRepository;

    private final PropertyTypeRepository propertyTypeRepository;

    /**
     * Save a visualization.
     *
     * @param visualization the entity to save
     * @return the persisted entity
     */
    public Visualization save(Visualization visualization) {
        log.debug("Request to save Visualization : {}", visualization);
        return visualizationRepository.save(visualization);
    }

    /**
     * Get all the visualizations.
     *
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public List<Visualization> findAll() {
        log.debug("Request to get all Visualization");
        return visualizationRepository.findAll();
    }

    /**
     * Get one visualizations by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Visualization findOne(Long id) {
        log.debug("Request to get Visualization : {}", id);
        Visualization visualization = visualizationRepository.findOne(id);

        if (visualization == null) {
            return null;
        }

        visualization.getFieldTypes().size();
        visualization.getPropertyTypes().size();
        return visualization;
    }

    /**
     * Delete the  visualizations by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete Visualization : {}", id);
        visualizationRepository.delete(id);
    }

    @Transactional(readOnly = true)
    public Page<FieldType> getFieldTypes(Long visualizationId, Pageable pageable) {
        log.debug("Request to get field types for visualizations: {}", visualizationId);
        return fieldTypeRepository.findByVisualizationId(visualizationId, pageable);
    }

    @Transactional(readOnly = true)
    public FieldType getFieldType(Long visualizationsId, Long fieldTypeId) {
        log.debug("Request to get field type with visualizations id: {} and field type id: {}", visualizationsId, fieldTypeId);


        final FieldType fieldType = fieldTypeRepository.findByIdAndVisualizationId(fieldTypeId, visualizationsId);
        fieldType.getPropertyTypes().size();// fetch property types

        return fieldType;
    }


    public Visualization saveFieldType(Long visualizationId, FieldType fieldType) {
        return Optional.ofNullable(visualizationRepository.findOne(visualizationId))
            .map(x -> x.addFieldType(fieldType))
            .map(visualizationRepository::save)
            .orElseThrow(EntityNotFoundException::new);
    }

    public Visualization deleteFieldType(Long visualizationsId, Long fieldTypeId) {
        return Optional.ofNullable(visualizationRepository.findOne(visualizationsId))
            .map(x -> x.removeFieldType(fieldTypeId))
            .map(visualizationRepository::save)
            .orElseThrow(EntityNotFoundException::new);
    }


    public Visualization assignPropertyType(Long id, Long propertyTypeId) {
        final PropertyType propertyType = propertyTypeRepository.findOne(propertyTypeId);
        if (null == propertyType) {
            throw new EntityNotFoundException();
        }

        return Optional.ofNullable(visualizationRepository.findOne(id))
            .map(x -> x.addPropertyType(propertyType))
            .map(visualizationRepository::save)
            .orElseThrow(EntityNotFoundException::new);
    }

    public Visualization removePropertyType(Long id, Long propertyTypeId) {
        return Optional.ofNullable(visualizationRepository.findOne(id))
            .map(x -> x.removePropertyType(propertyTypeId))
            .map(visualizationRepository::save)
            .orElseThrow(EntityNotFoundException::new);
    }
}
