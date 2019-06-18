package com.flair.bi.service;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.DashboardRelease;
import com.querydsl.core.types.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;

public interface DashboardService {

    /**
     * Save a dashboard.
     *
     * @param dashboard the entity to save
     * @return the persisted entity
     */
    Dashboard save(Dashboard dashboard);

    /**
     * Get all the dashboards.
     *
     * @return the list of entities
     */
    List<Dashboard> findAll();

    /**
     * Get all the dashboards that principal has permission to.
     *
     * @param pageable pageable
     * @param predicate predicate
     * @return the list of entities
     */
    Page<Dashboard> findAllByPrincipalPermissions(Pageable pageable, Predicate predicate);

    /**
     * Get the number of dashboards user has access to
     *
     * @return number of dashboards
     */
    Long countByPrincipalPermissions();

    /**
     * Get one dashboards by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Dashboard findOne(Long id);

    /**
     * Delete the  dashboards by id.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

    /**
     * Retrieve all dashboards with views and permissions
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    Page<Dashboard> findAll(Pageable pageable);

    /**
     * Find all dashboards by datasource ids
     *
     * @param datasourceIds list of datasource ids
     * @return the list of dashboards
     */
    List<Dashboard> findAllByDatasourceIds(List<Long> datasourceIds);

    /**
     * Launch a new release of a dashboard
     * <p>
     * Release has to be previously approved else it will be rejected
     *
     * @param id      id of a dashboard
     * @param release release to be published
     * @return updated dashboard
     */
    Dashboard publishRelease(Long id, DashboardRelease release);

    /**
     * Retrieve latest release
     *
     * @param dashboardId id of a view
     * @return latest dashboard release, can be null
     */
    DashboardRelease getCurrentDashboardRelease(Long dashboardId);

    /**
     * Retrieve release by version
     *
     * @param dashboardId id of a dashboard
     * @param version     version of dashboard release
     * @return dashboard release, can be null if not exists
     */
    DashboardRelease getReleaseByVersion(Long dashboardId, Long version);

    /**
     * Get all releases for that dashboard
     *
     * @param dashboardId id of a view
     * @return collection of view releases
     */
    Collection<DashboardRelease> getDashboardReleases(Long dashboardId);
    
    
    /**
     * Get all releases for that dashboard
     *
     * @param dashboardId id of a view
     * @return list of view releases
     */
    List<DashboardRelease> getDashboardReleasesList(Long dashboardId);


    /**
     * Change the version of current release
     *
     * @param id      id of a dashboard
     * @param version version of the release
     * @return changed dashboard, or untouched if version is not valid
     */
    Dashboard changeCurrentReleaseVersion(Long id, Long version);
    
    void updateImageLocation(String imageLocation,Long id);
    
    String getImageLocation(Long id);


}
