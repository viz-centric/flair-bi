package com.flair.bi.repository;

import com.flair.bi.domain.ViewFeatureCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.stereotype.Repository;


@Repository
public interface ViewFeatureCriteriaRepository extends JpaRepository<ViewFeatureCriteria, Long>,
    QueryDslPredicateExecutor<ViewFeatureCriteria> {

}
