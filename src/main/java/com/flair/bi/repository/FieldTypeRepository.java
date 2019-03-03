package com.flair.bi.repository;

import com.flair.bi.domain.fieldtype.FieldType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FieldTypeRepository extends JpaRepository<FieldType, Long> {

    Page<FieldType> findByVisualizationId(Long visualizationId, Pageable pageable);

    FieldType findByIdAndVisualizationId(Long id, Long visualizationsId);
}
