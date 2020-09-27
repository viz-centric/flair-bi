package com.flair.bi.service;

import com.flair.bi.domain.Visualization;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.repository.PropertyTypeRepository;
import com.flair.bi.repository.VisualizationRepository;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
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

	private final FieldTypeService fieldTypeService;

	private final PropertyTypeRepository propertyTypeRepository;

	/**
	 * Save a visualization.
	 *
	 * @param visualization the entity to save
	 * @return the persisted entity
	 */
	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
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
		Optional<Visualization> visualization = visualizationRepository.findById(id);
		return visualization.map(x -> {
			x.getFieldTypes().size();
			x.getPropertyTypes().size();
			return x;
		}).orElse(null);
	}

	/**
	 * Delete the visualizations by id.
	 *
	 * @param id the id of the entity
	 */
	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
	public void delete(Long id) {
		log.debug("Request to delete Visualization : {}", id);
		visualizationRepository.deleteById(id);
	}

	@Transactional(readOnly = true)
	public Page<FieldType> getFieldTypes(Long visualizationId, Pageable pageable) {
		log.debug("Request to get field types for visualizations: {}", visualizationId);
		return fieldTypeService.findByVisualizationId(visualizationId, pageable);
	}

	@Transactional(readOnly = true)
	public FieldType getFieldType(Long visualizationsId, Long fieldTypeId) {
		log.debug("Request to get field type with visualizations id: {} and field type id: {}", visualizationsId,
				fieldTypeId);

		final FieldType fieldType = fieldTypeService.findByIdAndVisualizationId(fieldTypeId, visualizationsId);
		fieldType.getPropertyTypes().size();// fetch property types

		return fieldType;
	}

	public Visualization saveFieldType(Long visualizationId, FieldType fieldType) {
		return visualizationRepository.findById(visualizationId).map(x -> x.addFieldType(fieldType))
				.map(visualizationRepository::save).orElseThrow(EntityNotFoundException::new);
	}

	public Visualization deleteFieldType(Long visualizationsId, Long fieldTypeId) {
		return visualizationRepository.findById(visualizationsId).map(x -> x.removeFieldType(fieldTypeId))
				.map(visualizationRepository::save).orElseThrow(EntityNotFoundException::new);
	}

	public Visualization assignPropertyType(Long id, Long propertyTypeId) {
		final PropertyType propertyType = propertyTypeRepository.getOne(propertyTypeId);
		return visualizationRepository.findById(id).map(x -> x.addPropertyType(propertyType))
				.map(visualizationRepository::save).orElseThrow(EntityNotFoundException::new);
	}

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
	public Visualization assignPropertyTypeByAdmin(Long id, Long propertyTypeId) {
		final PropertyType propertyType = propertyTypeRepository.getOne(propertyTypeId);
		return visualizationRepository.findById(id).map(x -> x.addPropertyType(propertyType))
				.map(visualizationRepository::save).orElseThrow(EntityNotFoundException::new);
	}

	public Visualization removePropertyType(Long id, Long propertyTypeId) {
		return visualizationRepository.findById(id).map(x -> x.removePropertyType(propertyTypeId))
				.map(visualizationRepository::save).orElseThrow(EntityNotFoundException::new);
	}
}
