package com.flair.bi.repository;

import com.flair.bi.domain.field.Field;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FieldRepository extends JpaRepository<Field, Long> {
}
