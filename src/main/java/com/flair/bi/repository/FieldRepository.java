package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.field.Field;

public interface FieldRepository extends JpaRepository<Field, Long> {
}
