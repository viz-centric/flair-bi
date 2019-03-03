package com.flair.bi.repository;

import com.flair.bi.domain.propertytype.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyTypeRepository extends JpaRepository<PropertyType, Long> {
}
