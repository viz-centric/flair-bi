package com.flair.bi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.fieldtype.FieldType;

public interface FieldTypeRepository extends JpaRepository<FieldType, Long> {

	Page<FieldType> findByVisualizationId(Long visualizationId, Pageable pageable);

	FieldType findByIdAndVisualizationId(Long id, Long visualizationsId);
}
