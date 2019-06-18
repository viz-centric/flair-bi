package com.flair.bi.repository;

import com.flair.bi.domain.DashboardRelease;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;

public interface DashboardReleaseRepository extends
    JpaRepository<DashboardRelease, Long>,
    QueryDslPredicateExecutor<DashboardRelease>{

    @Query(value = "select dashboardReleases from DashboardRelease dashboardReleases where dashboardReleases.dashboard.id = :id")
    List<DashboardRelease> findByDashboardId(@Param("id") Long id);

}
