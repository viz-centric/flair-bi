package com.flair.bi.service;

import com.flair.bi.domain.DatasourceGroupConstraint;
import com.flair.bi.domain.QDatasourceGroupConstraint;
import com.flair.bi.domain.User;
import com.flair.bi.domain.constraintdefinition.FeatureConstraintGroupExpression;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.DatasourceGroupConstraintRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.security.UserGroupService;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DatasourceGroupConstraintService {

	private final UserGroupService userGroupService;
	private final DatasourceGroupConstraintRepository datasourceGroupConstraintRepository;
	private final UserService userService;

	public DatasourceGroupConstraint save(DatasourceGroupConstraint datasourceGroupConstraint) {
		log.debug("Request to save DatasourceGroupConstraint : {}", datasourceGroupConstraint);
		UserGroup userGroup = datasourceGroupConstraint.getUserGroup();
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		if (!Objects.equals(userGroup.getRealm().getId(), SecurityUtils.getUserAuth().getRealmId())) {
			throw new IllegalStateException("Realm of user group " + userGroup.getRealm().getId() + " does not match current user realms " + SecurityUtils.getUserAuth().getRealmId());
		}
		return datasourceGroupConstraintRepository.save(datasourceGroupConstraint);
	}

	@Transactional(readOnly = true)
	public List<DatasourceGroupConstraint> findAll(Predicate predicate) {
		log.debug("Request to get all DatasourceGroupConstraint");
		Predicate b = hasRealmPermissions().and(predicate);
		return (List<DatasourceGroupConstraint>) datasourceGroupConstraintRepository.findAll(b);
	}

	private BooleanExpression hasRealmPermissions() {
		return QDatasourceGroupConstraint.datasourceGroupConstraint.userGroup.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
	}

	@Transactional(readOnly = true)
	public List<DatasourceGroupConstraint> findAllByUserGroupName(String userGroup) {
		log.debug("Request to get all DatasourceGroupConstraint");
		UserGroup ug = userGroupService.findOne(userGroup);
		return datasourceGroupConstraintRepository.findAllByUserGroupId(ug.getId());
	}

	/**
	 * Get one datasourceConstraint by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Transactional(readOnly = true)
	public DatasourceGroupConstraint findOne(Long id) {
		log.debug("Request to get DatasourceGroupConstraint : {}", id);
		BooleanExpression expression = hasRealmPermissions().and(QDatasourceGroupConstraint.datasourceGroupConstraint.id.eq(id));
		return datasourceGroupConstraintRepository.findOne(expression)
				.orElseThrow(() -> new EntityNotFoundException("Datasource constraint cannot be found"));
	}

	/**
	 * Delete the datasourceConstraint by id.
	 *
	 * @param id the id of the entity
	 */
	public void delete(Long id) {
		log.debug("Request to delete DatasourceGroupConstraint : {}", id);
		DatasourceGroupConstraint one = findOne(id);
		datasourceGroupConstraintRepository.delete(one);
	}

	public List<Long> getRestrictedFeatureIds(Long datasourceId, String username) {
		if (username == null) {
			return new ArrayList<>();
		}
		User user = userService.getUserWithAuthoritiesByLogin(username).orElseThrow();
		Set<Long> userGroupIds = user.getUserGroups().stream().map(UserGroup::getId).collect(Collectors.toSet());
		List<DatasourceGroupConstraint> constraints = datasourceGroupConstraintRepository.findAllByDatasourceIdAndUserGroupIdIn(datasourceId, userGroupIds);
		return constraints.stream()
				.flatMap(c -> c.getConstraintDefinition().getFeatureConstraints()
						.stream()
						.filter(fc -> fc instanceof FeatureConstraintGroupExpression)
						.map(fc -> ((FeatureConstraintGroupExpression) fc).getId()))
				.collect(Collectors.toList());
	}
}
