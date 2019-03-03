package com.flair.bi.repository;

import com.flair.bi.domain.Functions;

import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the Functions entity.
 */
@SuppressWarnings("unused")
public interface FunctionsRepository extends JpaRepository<Functions,Long> {

}
