package com.flair.bi.repository;

import com.flair.bi.domain.DashboardRelease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;

public interface DashboardReleaseRepository extends
    JpaRepository<DashboardRelease, Long>,
    QueryDslPredicateExecutor<DashboardRelease> {
}
