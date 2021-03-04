package com.flair.bi.service;

import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.fieldtype.QFieldType;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.repository.FieldTypeRepository;
import com.flair.bi.repository.PropertyTypeRepository;
import com.flair.bi.security.SecurityUtils;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Slf4j
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

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
	public FieldType assignPropertyTypeByAdmin(Long fieldTypeId, Long propertyTypeId) {
		final PropertyType propertyType = propertyTypeRepository.getOne(propertyTypeId);
		FieldType fieldType = fieldTypeRepository.getOne(fieldTypeId);
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
		return QFieldType.fieldType.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
	}

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
	public List<FieldType> getAllByRealmId(Long realmId) {
		return ImmutableList.copyOf(
				fieldTypeRepository.findAll(QFieldType.fieldType.realm.id.eq(realmId))
		);
	}

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
	public void saveAll(Collection<FieldType> fieldType) {
		fieldTypeRepository.saveAll(fieldType);
	}

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
	public void save(FieldType fieldType) {
		fieldTypeRepository.save(fieldType);
	}
}
