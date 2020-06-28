package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import com.flair.bi.domain.ViewFeatureCriteria;

@Repository
public interface ViewFeatureCriteriaRepository
		extends JpaRepository<ViewFeatureCriteria, Long>, QuerydslPredicateExecutor<ViewFeatureCriteria> {

}
