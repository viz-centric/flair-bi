package com.flair.bi.service;

import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.DatasourceStatus;
import com.flair.bi.domain.QDatasource;
import com.flair.bi.domain.User;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.repository.DatasourceRepository;
import com.flair.bi.security.AuthoritiesConstants;
import com.flair.bi.security.SecurityUtils;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
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
    private final UserService userService;

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

        if (datasource.getRealm() == null) {
            User user = userService.getUserWithAuthoritiesByLoginOrError();
            datasource.setRealm(user.getRealmById(SecurityUtils.getUserAuth().getRealmId()));
        }

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
        return ImmutableList.copyOf(
                datasourceRepository.findAll(isNotDeleted().and(hasUserPermissions()).and(predicate).and(hasUserRealmAccess()))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Datasource> findAll(Pageable pageable) {
        log.debug("Request to get all Datasource");
        return datasourceRepository.findAll(
                isNotDeleted().and(hasUserPermissions()).andAnyOf(hasUserRealmAccess()), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Datasource> findAll(Predicate predicate, Pageable pageable) {
        log.debug("Request to get all Datasource");
        return datasourceRepository.findAll(
                isNotDeleted().and(predicate).and(hasUserPermissions()).and(hasUserRealmAccess()), pageable);
    }

    @Override
    public List<Datasource> findAllAndDeleted(Predicate predicate) {
        log.debug("Request to get all Datasource including deleted");
        return ImmutableList.copyOf(
                datasourceRepository.findAll(hasUserPermissions().and(predicate).and(hasUserRealmAccess()))
        );
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
        return datasourceRepository.findOne(
                hasUserPermissions().and(QDatasource.datasource.id.eq(id))).orElse(null);
    }

    /**
     * Delete the datasources by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Datasource : {}", id);
        final Optional<Datasource> datasource = datasourceRepository.findOne(
                hasUserPermissions().and(QDatasource.datasource.id.eq(id)));
        
        datasource.ifPresent(x-> {
        	 x.setStatus(DatasourceStatus.DELETED);
             datasourceRepository.save(x);
        });
       
    }

    @Override
    @Transactional(readOnly = true)
    public Long getCount(Predicate predicate) {
        log.debug("Request to get Datasource count with predicate {}", predicate);
        return datasourceRepository.count(
                hasUserPermissions().and(isNotDeleted()).and(predicate).and(hasUserRealmAccess()));
    }

    /**
     * Delete datasources by given predicate
     *
     * @param predicate predicate that defines deletion
     */
    @Override
    public void delete(Predicate predicate) {
        final Iterable<Datasource> datasources = datasourceRepository.findAll(
                isNotDeleted().and(hasUserPermissions()).and(predicate).and(hasUserRealmAccess()));
        for (Datasource datasource : datasources) {
            datasource.setStatus(DatasourceStatus.DELETED);
        }
        datasourceRepository.saveAll(datasources);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Datasource> search(Pageable pageable, Predicate predicate) {
        log.debug("Request to get Searched Datasource");
        return datasourceRepository.findAll(
                isNotDeleted().and(predicate).and(hasUserPermissions()).and(hasUserRealmAccess()), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Datasource> findAllByConnectionAndName(String connectionName, String datasourceName) {
        return findAll(hasUserPermissions().and(QDatasource.datasource.connectionName.eq(connectionName)
                .and(QDatasource.datasource.name.eq(datasourceName))
                .and(hasUserRealmAccess())));
    }

    @Override
    public void deleteByConnectionAndName(String connectionName, String datasourceName) {
        delete(hasUserPermissions().and(QDatasource.datasource.connectionName.eq(connectionName)
                .and(QDatasource.datasource.name.eq(datasourceName))
                .and(hasUserRealmAccess())));
    }

    @Override
    @PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'DELETE','APPLICATION')")
    public void deleteAllByRealmId(Long realmId) {
        datasourceRepository.deleteAllByRealmId(realmId);
    }

    @Override
    public void verifyConnectionLinkBelongsToRealm(String connectionLinkId) {
        List<Datasource> connections = findAll(hasUserRealmAccess().and(QDatasource.datasource.connectionName.eq(connectionLinkId)));
        if (connections.isEmpty()) {
            throw new IllegalStateException("No connection link " + connectionLinkId + " found for current realm");
        }
    }

    private BooleanExpression hasUserPermissions() {
        final Optional<User> loggedInUser = userService.getUserByLogin(SecurityUtils.getCurrentUserLogin());
        final User user = loggedInUser.orElseThrow(() -> new RuntimeException("User not found"));
        final Set<Permission> permissions = user
                .getPermissionsByActionAndPermissionType(Collections.singletonList(Action.READ), "DATASOURCE");
        return QDatasource.datasource.id
                .in(permissions.stream()
                        .map(x -> Long.parseLong(x.getResource()))
                        .collect(Collectors.toSet()));
    }

    private BooleanExpression hasUserRealmAccess() {
        return QDatasource.datasource.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
    }

    private BooleanBuilder isNotDeleted() {
        BooleanBuilder b = new BooleanBuilder();
        b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull()));
        return b;
    }

}
