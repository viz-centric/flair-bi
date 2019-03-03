package com.flair.bi.service;

import com.flair.bi.domain.Datasource;
import com.flair.bi.repository.DatasourceRepository;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service Implementation for managing Datasource.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DatasourceServiceImpl implements DatasourceService {

    private final DatasourceRepository datasourceRepository;

    private final DashboardService dashboardService;

    /**
     * Save a datasource.
     *
     * @param datasource the entity to save
     * @return the persisted entity
     */
    @Override
    public Datasource save(Datasource datasource) {
        log.debug("Request to save Datasource : {}", datasource);
        return datasourceRepository.save(datasource);
    }

    /**
     * Get all the datasources.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<Datasource> findAll(Predicate predicate) {
        log.debug("Request to get all Datasource");
        return (List<Datasource>) datasourceRepository.findAll(predicate);
    }

    /**
     * Get one datasources by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Datasource findOne(Long id) {
        log.debug("Request to get Datasource : {}", id);
        return datasourceRepository.findOne(id);
    }

    /**
     * Delete the  datasources by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Datasource : {}", id);
        final Datasource datasource = datasourceRepository.findOne(id);
        // delete all dashboards
        datasource.getDashboardSet().forEach(x -> dashboardService.delete(x.getId()));
        datasourceRepository.delete(datasource);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getCount(Predicate predicate) {
        log.debug("Request to get Datasource count with predicate {}", predicate);
        return datasourceRepository.count(predicate);
    }

     /**
     * Delete datasources by given predicate
     *
     * @param predicate predicate that defines deletion
     */
    @Override
    public void delete(Predicate predicate) {
        final Iterable<Datasource> datasources = datasourceRepository.findAll(predicate);
        // remove all dashboards before you delete datasource
        datasources.forEach(x -> x.getDashboardSet().forEach(y -> dashboardService.delete(y.getId())));
        datasourceRepository.delete(datasources);
    }

	@Override
	@Transactional(readOnly = true)
	public Page<Datasource> search(Pageable pageable, Predicate predicate) {
        log.debug("Request to get Seached Datasource");
        BooleanBuilder booleanBuilder = new BooleanBuilder(predicate);
        return datasourceRepository.findAll(booleanBuilder,pageable);
	}
}
