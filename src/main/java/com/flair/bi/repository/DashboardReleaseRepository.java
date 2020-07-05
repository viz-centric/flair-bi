package com.flair.bi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;

import com.flair.bi.domain.DashboardRelease;

public interface DashboardReleaseRepository
		extends JpaRepository<DashboardRelease, Long>, QuerydslPredicateExecutor<DashboardRelease> {

	@Query(value = "select dashboardReleases from DashboardRelease dashboardReleases where dashboardReleases.dashboard.id = :id")
	List<DashboardRelease> findByDashboardId(@Param("id") Long id);

}
