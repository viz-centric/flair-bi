package com.flair.bi.service;

import com.flair.bi.domain.Visualization;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.repository.PropertyTypeRepository;
import com.flair.bi.repository.VisualizationRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.dto.VisualizationDTO;
import com.flair.bi.service.mapper.VisualizationMapper;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

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
	private final VisualizationMapper visualizationMapper;
	private final UserService userService;

	/**
	 * Save a visualization.
	 *
	 * @param visualization the entity to save
	 * @return the persisted entity
	 */
	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
	public VisualizationDTO save(Visualization visualization) {
		log.debug("Request to save Visualization : {}", visualization);
		Visualization vis = visualizationRepository.save(visualization);
		return visualizationMapper.visualizationToVisualizationDTO(vis);
	}

	/**
	 * Get all the visualizations.
	 *
	 * @return the list of entities
	 */
	@Transactional(readOnly = true)
	public List<VisualizationDTO> findAll() {
		log.debug("Request to get all Visualization");
		List<Visualization> all = visualizationRepository.findAll();
		return visualizationMapper.visualizationToVisualizationDTOs(all)
				.stream()
				.peek(x -> filterFieldTypesByRealm(x))
				.collect(Collectors.toList());
	}

	/**
	 * Get one visualizations by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Transactional(readOnly = true)
	public VisualizationDTO findOne(Long id) {
		log.debug("Request to get Visualization : {}", id);
		Optional<Visualization> visualization = visualizationRepository.findById(id);
		VisualizationDTO visualizationDTO = visualization
				.map(x -> {
					x.getFieldTypes().size();
					x.getPropertyTypes().size();
					return x;
				})
				.map(x -> visualizationMapper.visualizationToVisualizationDTO(x))
				.orElse(null);
		if (visualizationDTO != null) {
			filterFieldTypesByRealm(visualizationDTO);
		}
		return visualizationDTO;
    }

	private void filterFieldTypesByRealm(VisualizationDTO visualizationDTO) {
		visualizationDTO.setFieldTypes(
				visualizationDTO.getFieldTypes()
				.stream()
				.filter(x -> Objects.equals(SecurityUtils.getUserAuth().getRealmId(), x.getRealm().getId()))
				.collect(Collectors.toSet())
		);
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

	public VisualizationDTO saveFieldType(Long visualizationId, FieldType fieldType) {
		return visualizationRepository.findById(visualizationId)
				.map(x -> x.addFieldType(fieldType))
				.map(visualizationRepository::save)
				.map(x -> visualizationMapper.visualizationToVisualizationDTO(x))
				.orElseThrow(EntityNotFoundException::new);
	}

	public VisualizationDTO deleteFieldType(Long visualizationsId, Long fieldTypeId) {
		return visualizationRepository.findById(visualizationsId)
				.map(x -> x.removeFieldType(fieldTypeId))
				.map(visualizationRepository::save)
				.map(x -> visualizationMapper.visualizationToVisualizationDTO(x))
				.orElseThrow(EntityNotFoundException::new);
	}

	public VisualizationDTO assignPropertyType(Long id, Long propertyTypeId) {
		final PropertyType propertyType = propertyTypeRepository.getOne(propertyTypeId);
		return visualizationRepository.findById(id)
				.map(x -> x.addPropertyType(propertyType))
				.map(visualizationRepository::save)
				.map(x -> visualizationMapper.visualizationToVisualizationDTO(x))
				.orElseThrow(EntityNotFoundException::new);
	}

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
	public Visualization assignPropertyTypeByAdmin(Long id, Long propertyTypeId) {
		final PropertyType propertyType = propertyTypeRepository.getOne(propertyTypeId);
		return visualizationRepository.findById(id).map(x -> x.addPropertyType(propertyType))
				.map(visualizationRepository::save).orElseThrow(EntityNotFoundException::new);
	}

	public VisualizationDTO removePropertyType(Long id, Long propertyTypeId) {
		return visualizationRepository.findById(id)
				.map(x -> x.removePropertyType(propertyTypeId))
				.map(visualizationRepository::save)
				.map(x -> visualizationMapper.visualizationToVisualizationDTO(x))
				.orElseThrow(EntityNotFoundException::new);
	}
}
