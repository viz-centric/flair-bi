package com.flair.bi.service;

import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.repository.FieldTypeRepository;
import com.flair.bi.repository.PropertyTypeRepository;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class FieldTypeService {

	private final FieldTypeRepository fieldTypeRepository;

	private final PropertyTypeRepository propertyTypeRepository;
	private final UserService userService;

	public FieldType getOne(Long id) {
		return fieldTypeRepository.getOne(id);
	}

	public FieldType assignPropertyType(Long fieldTypeId, Long propertyTypeId) {
		final PropertyType propertyType = propertyTypeRepository.getOne(propertyTypeId);

		return fieldTypeRepository.findById(fieldTypeId).map(x -> x.addPropertyType(propertyType))
				.map(fieldTypeRepository::save).orElseThrow(EntityNotFoundException::new);
	}

	public FieldType removePropertyType(Long fieldTypeId, Long propertyTypeId) {
		return fieldTypeRepository.findById(fieldTypeId).map(x -> x.removePropertyType(propertyTypeId))
				.map(fieldTypeRepository::save).orElseThrow(EntityNotFoundException::new);
	}

	public Page<FieldType> findByVisualizationId(Long visualizationId, Pageable pageable) {
		return fieldTypeRepository.findByVisualizationId(visualizationId, pageable);
	}

	public FieldType findByIdAndVisualizationId(Long fieldTypeId, Long visualizationsId) {
		return fieldTypeRepository.findByIdAndVisualizationId(fieldTypeId, visualizationsId);
	}

//	private BooleanExpression hasRealmPermission() {
//		User user = userService.getUserWithAuthoritiesByLoginOrError();
//		return QFieldType.fieldType.visualization.
//	}
}
