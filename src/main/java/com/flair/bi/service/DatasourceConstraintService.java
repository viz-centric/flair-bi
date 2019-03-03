package com.flair.bi.service;

import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.repository.DatasourceConstraintRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service Implementation for managing DatasourceConstraint.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DatasourceConstraintService {

    private final DatasourceConstraintRepository datasourceConstraintRepository;

    /**
     * Save a datasourceConstraint.
     *
     * @param datasourceConstraint the entity to save
     * @return the persisted entity
     */
    public DatasourceConstraint save(DatasourceConstraint datasourceConstraint) {
        log.debug("Request to save DatasourceConstraint : {}", datasourceConstraint);
        return datasourceConstraintRepository.save(datasourceConstraint);
    }

    /**
     * Get all the datasourceConstraints.
     *
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public List<DatasourceConstraint> findAll(Predicate predicate) {
        log.debug("Request to get all DatasourceConstraints");
        return (List<DatasourceConstraint>) datasourceConstraintRepository.findAll(predicate);
    }

    /**
     * Get one datasourceConstraint by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public DatasourceConstraint findOne(Long id) {
        log.debug("Request to get DatasourceConstraint : {}", id);
        return datasourceConstraintRepository.findOne(id);
    }

    /**
     * Delete the  datasourceConstraint by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete DatasourceConstraint : {}", id);
        datasourceConstraintRepository.delete(id);
    }

    @Transactional(readOnly = true)
    public DatasourceConstraint findByUserAndDatasource(String login, Long datasourceId) {
        return datasourceConstraintRepository.findByUserLoginAndDatasourceId(login, datasourceId);
    }
}
