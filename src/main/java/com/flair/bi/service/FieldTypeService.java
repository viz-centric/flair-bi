package com.flair.bi.service;

import com.flair.bi.domain.User;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.fieldtype.QFieldType;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.repository.FieldTypeRepository;
import com.flair.bi.repository.PropertyTypeRepository;
import com.querydsl.core.types.dsl.BooleanExpression;
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
		return fieldTypeRepository.findOne(hasRealmPermission()
				.and(QFieldType.fieldType.id.eq(id))).orElseThrow();
	}

	public FieldType assignPropertyType(Long fieldTypeId, Long propertyTypeId) {
		final PropertyType propertyType = propertyTypeRepository.getOne(propertyTypeId);
		FieldType fieldType = getOne(fieldTypeId);
		fieldType.addPropertyType(propertyType);
		return fieldTypeRepository.save(fieldType);
	}

	public FieldType removePropertyType(Long fieldTypeId, Long propertyTypeId) {
		FieldType fieldType = getOne(fieldTypeId);
		fieldType.removePropertyType(propertyTypeId);
		return fieldTypeRepository.save(fieldType);
	}

	public Page<FieldType> findByVisualizationId(Long visualizationId, Pageable pageable) {
		return fieldTypeRepository.findAll(
				hasRealmPermission().and(QFieldType.fieldType.visualization.id.eq(visualizationId)),
				pageable);
	}

	public FieldType findByIdAndVisualizationId(Long fieldTypeId, Long visualizationsId) {
		return fieldTypeRepository.findOne(hasRealmPermission()
				.and(QFieldType.fieldType.id.eq(fieldTypeId))
				.and(QFieldType.fieldType.visualization.id.eq(visualizationsId)))
				.orElseThrow();
	}

	private BooleanExpression hasRealmPermission() {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		return QFieldType.fieldType.realm.id.eq(user.getRealm().getId());
	}
}
