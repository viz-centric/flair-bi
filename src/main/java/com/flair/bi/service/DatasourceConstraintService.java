package com.flair.bi.service;

import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.domain.QDatasourceConstraint;
import com.flair.bi.domain.User;
import com.flair.bi.repository.DatasourceConstraintRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
	private final UserService userService;

	/**
	 * Save a datasourceConstraint.
	 *
	 * @param datasourceConstraint the entity to save
	 * @return the persisted entity
	 */
	public DatasourceConstraint save(DatasourceConstraint datasourceConstraint) {
		log.debug("Request to save DatasourceConstraint : {}", datasourceConstraint);
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		if (datasourceConstraint.getUser() != null) {
			if (datasourceConstraint.getUser().getRealmById(SecurityUtils.getUserAuth().getRealmId()) == null) {
				throw new IllegalStateException("Data constraint for user " + datasourceConstraint.getUser().getId() + " is not allowed");
			}
		}
		return datasourceConstraintRepository.save(datasourceConstraint);
	}

	/**
	 * Get all the datasourceConstraints.
	 *
	 * @param predicate predicate
	 * @return the list of entities
	 */
	@Transactional(readOnly = true)
	public List<DatasourceConstraint> findAll(Predicate predicate) {
		log.debug("Request to get all DatasourceConstraints");
		return ImmutableList.copyOf(
				datasourceConstraintRepository.findAll(hasRealmAccess().and(predicate))
		);
	}

	private BooleanExpression hasRealmAccess() {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		return QDatasourceConstraint.datasourceConstraint.user.realms.contains(user.getRealmById(SecurityUtils.getUserAuth().getRealmId()));
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
		return datasourceConstraintRepository.findOne(hasRealmAccess().and(QDatasourceConstraint.datasourceConstraint.id.eq(id)))
				.orElseThrow(() -> new EntityNotFoundException("Datasource constraint cannot be found"));
	}

	/**
	 * Delete the datasourceConstraint by id.
	 *
	 * @param id the id of the entity
	 */
	public void delete(Long id) {
		log.debug("Request to delete DatasourceConstraint : {}", id);
		DatasourceConstraint datasourceConstraint = findOne(id);
		datasourceConstraintRepository.delete(datasourceConstraint);
	}

	@Transactional(readOnly = true)
	public DatasourceConstraint findByUserAndDatasource(String login, Long datasourceId) {
		return datasourceConstraintRepository.findOne(hasRealmAccess()
				.and(QDatasourceConstraint.datasourceConstraint.datasource.id.eq(datasourceId))
				.and(QDatasourceConstraint.datasourceConstraint.user.login.eq(login)))
				.orElse(null);
	}
}
