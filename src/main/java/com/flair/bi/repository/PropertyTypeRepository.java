package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.propertytype.PropertyType;

public interface PropertyTypeRepository extends JpaRepository<PropertyType, Long> {
}
