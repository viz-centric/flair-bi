package com.flair.bi.service;

import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.DatasourceStatus;
import com.flair.bi.domain.QDatasource;
import com.flair.bi.repository.DatasourceRepository;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        BooleanBuilder b = new BooleanBuilder(predicate);
        b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED)
                .or(QDatasource.datasource.status.isNull()));
        return (List<Datasource>) datasourceRepository.findAll(b);
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
        datasource.setStatus(DatasourceStatus.DELETED);
        datasourceRepository.save(datasource);
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
        BooleanBuilder b = new BooleanBuilder(predicate);
        b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED)
                .or(QDatasource.datasource.status.isNull()));
        final Iterable<Datasource> datasources = datasourceRepository.findAll(b);
        for (Datasource datasource : datasources) {
            datasource.setStatus(DatasourceStatus.DELETED);
        }
        datasourceRepository.save(datasources);
    }

	@Override
	@Transactional(readOnly = true)
	public Page<Datasource> search(Pageable pageable, Predicate predicate) {
        log.debug("Request to get Seached Datasource");
        BooleanBuilder b = new BooleanBuilder(predicate);
        b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED)
                .or(QDatasource.datasource.status.isNull()));
        return datasourceRepository.findAll(b, pageable);
	}
}
