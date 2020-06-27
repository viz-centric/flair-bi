package com.flair.bi.service;

import com.flair.bi.domain.Datasource;
import com.querydsl.core.types.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DatasourceService {
    /**
     * Save a datasource.
     *
     * @param datasource the entity to save
     * @return the persisted entity
     */
    Datasource save(Datasource datasource);

    /**
     * Get all the datasources.
     *
     * @param predicate predicate
     * @return the list of entities
     */
    List<Datasource> findAll(Predicate predicate);

    Page<Datasource> findAll(Pageable pageable);

    /**
     * Get all the datasources paginated.
     * 
     * @param predicate
     * @param pageable
     * @return
     */
    Page<Datasource> findAll(Predicate predicate, Pageable pageable);

    /**
     * Find all datasources that are logically deleted.
     * 
     * @param predicate
     * @return
     */
    List<Datasource> findAllAndDeleted(Predicate predicate);

    /**
     * Get one datasources by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Datasource findOne(Long id);

    /**
     * Delete the datasources by id.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

    Long getCount(Predicate predicate);

    /**
     * Delete datasources by given predicate
     *
     * @param predicate predicate that defines deletion
     */
    void delete(Predicate predicate);

    /**
     * Get searched datasources.
     *
     * @param pageable  pageable
     * @param predicate predicate
     * @return the list of entities
     */
    Page<Datasource> search(Pageable pageable, Predicate predicate);

    List<Datasource> findAllByConnectionAndName(String connectionName, String datasourceName);

    void deleteByConnectionAndName(String connectionName, String datasourceName);
}
