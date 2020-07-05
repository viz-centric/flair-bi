package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.Functions;

/**
 * Spring Data JPA repository for the Functions entity.
 */
@SuppressWarnings("unused")
public interface FunctionsRepository extends JpaRepository<Functions, Long> {

}
