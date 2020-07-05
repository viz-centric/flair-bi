package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.property.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {
}
