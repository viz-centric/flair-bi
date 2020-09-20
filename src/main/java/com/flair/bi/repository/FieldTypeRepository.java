package com.flair.bi.repository;

import com.flair.bi.domain.fieldtype.FieldType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface FieldTypeRepository extends JpaRepository<FieldType, Long>, QuerydslPredicateExecutor<FieldType> {

}
