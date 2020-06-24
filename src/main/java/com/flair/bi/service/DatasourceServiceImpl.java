package com.flair.bi.service;

import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.DatasourceStatus;
import com.flair.bi.domain.QDatasource;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.repository.DatasourceRepository;
import com.flair.bi.security.AuthoritiesConstants;
import com.flair.bi.security.SecurityUtils;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Datasource.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DatasourceServiceImpl implements DatasourceService {

    private final DatasourceRepository datasourceRepository;
    private final AccessControlManager accessControlManager;

    /**
     * Save a datasource.
     *
     * @param datasource the entity to save
     * @return the persisted entity
     */
    @Override
    @Transactional
    public Datasource save(Datasource datasource) {
        log.debug("Request to save Datasource : {}", datasource);

        boolean create = null == datasource.getId();
        Datasource ds = datasourceRepository.save(datasource);

        if (create) {
            Set<Permission> permissions = new HashSet<>(accessControlManager.addPermissions(ds.getPermissions()));
            accessControlManager.grantAccess(SecurityUtils.getCurrentUserLogin(), permissions);
            accessControlManager.assignPermissions(AuthoritiesConstants.ADMIN, permissions);
        }
        return ds;
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
        b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull()));
        List<Datasource> result = (List<Datasource>) datasourceRepository.findAll(b);
        return filterByPermissions(result);
    }

    private List<Datasource> filterByPermissions(List<Datasource> result) {
        return result.stream()
                .filter(ds -> accessControlManager.hasAccess(ds.getId().toString(), Action.READ, ds.getScope()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Datasource> findAll(Pageable pageable) {
        log.debug("Request to get all Datasource");
        BooleanExpression predicate = QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull());
        Page<Datasource> result = datasourceRepository.findAll(predicate, pageable);
        return filterByPermissions(result, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Datasource> findAll(Predicate predicate, Pageable pageable) {
        log.debug("Request to get all Datasource");
        final BooleanBuilder b = new BooleanBuilder(predicate);
        b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull()));
        Page<Datasource> result = datasourceRepository.findAll(b, pageable);
        return filterByPermissions(result, pageable);
    }

    @Override
    public List<Datasource> findAllAndDeleted(Predicate predicate) {
        log.debug("Request to get all Datasource including deleted");
        List<Datasource> result = (List<Datasource>) datasourceRepository.findAll(predicate);
        return filterByPermissions(result);
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
     * Delete the datasources by id.
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
        return (long) findAll(predicate).size();
    }

    /**
     * Delete datasources by given predicate
     *
     * @param predicate predicate that defines deletion
     */
    @Override
    public void delete(Predicate predicate) {
        BooleanBuilder b = new BooleanBuilder(predicate);
        b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull()));
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
        b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull()));
        Page<Datasource> result = datasourceRepository.findAll(b, pageable);
        return filterByPermissions(result, pageable);
    }

    private Page<Datasource> filterByPermissions(Page<Datasource> result, Pageable pageable) {
        List<Datasource> filteredResult = filterByPermissions(result.getContent());
        return new PageImpl<>(filteredResult, pageable, filteredResult.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Datasource> findAllByConnectionAndName(String connectionName, String datasourceName) {
        return findAll(QDatasource.datasource.connectionName.eq(connectionName)
                .and(QDatasource.datasource.name.eq(datasourceName)));
    }

    @Override
    public void deleteByConnectionAndName(String connectionName, String datasourceName) {
        delete(QDatasource.datasource.connectionName.eq(connectionName)
                .and(QDatasource.datasource.name.eq(datasourceName)));
    }

}
