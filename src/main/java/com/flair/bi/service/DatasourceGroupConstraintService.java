package com.flair.bi.service;

import com.flair.bi.domain.DatasourceGroupConstraint;
import com.flair.bi.domain.User;
import com.flair.bi.domain.constraintdefinition.FeatureConstraintGroupExpression;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.DatasourceGroupConstraintRepository;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DatasourceGroupConstraintService {

	private final DatasourceGroupConstraintRepository datasourceGroupConstraintRepository;
	private final UserService userService;

	public DatasourceGroupConstraint save(DatasourceGroupConstraint datasourceGroupConstraint) {
		log.debug("Request to save DatasourceGroupConstraint : {}", datasourceGroupConstraint);
		return datasourceGroupConstraintRepository.save(datasourceGroupConstraint);
	}

	/**
	 * Get all the datasourceConstraints.
	 *
	 * @param predicate predicate
	 * @return the list of entities
	 */
	@Transactional(readOnly = true)
	public List<DatasourceGroupConstraint> findAll(Predicate predicate) {
		log.debug("Request to get all DatasourceGroupConstraint");
		return (List<DatasourceGroupConstraint>) datasourceGroupConstraintRepository.findAll(predicate);
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
		return datasourceGroupConstraintRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Datasource constraint cannot be found"));
	}

	/**
	 * Delete the datasourceConstraint by id.
	 *
	 * @param id the id of the entity
	 */
	public void delete(Long id) {
		log.debug("Request to delete DatasourceGroupConstraint : {}", id);
		datasourceGroupConstraintRepository.deleteById(id);
	}

	public List<Long> getRestrictedFeatureIds(Long datasourceId, String username) {
		if (username == null) {
			return new ArrayList<>();
		}
		User user = userService.getUserWithAuthoritiesByLogin(username).orElseThrow();
		Set<String> userGroups = user.getUserGroups().stream().map(UserGroup::getName).collect(Collectors.toSet());
		List<DatasourceGroupConstraint> constraints = datasourceGroupConstraintRepository.findAllByDatasourceIdAndUserGroupNameIn(datasourceId, userGroups);
		return constraints.stream()
				.flatMap(c -> c.getConstraintDefinition().getFeatureConstraints()
						.stream()
						.filter(fc -> fc instanceof FeatureConstraintGroupExpression)
						.map(fc -> ((FeatureConstraintGroupExpression) fc).getId()))
				.collect(Collectors.toList());
	}
}
