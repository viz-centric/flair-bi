package com.flair.bi.service;

import com.flair.bi.domain.User;
import com.flair.bi.domain.hierarchy.Hierarchy;
import com.flair.bi.domain.hierarchy.QHierarchy;
import com.flair.bi.repository.HierarchyRepository;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@Transactional
@RequiredArgsConstructor
public class HierarchyService {

	private final HierarchyRepository hierarchyRepository;
	private final UserService userService;

	@Transactional(readOnly = true)
	public List<Hierarchy> findAll(Predicate predicate) {
		return ImmutableList.copyOf(hierarchyRepository.findAll(hasRealmPermission().and(predicate)));
	}

	@Transactional(readOnly = true)
	public Hierarchy findOne(Long id) {
		return hierarchyRepository.findOne(hasRealmPermission()
				.and(QHierarchy.hierarchy.id.eq(id)))
				.orElse(null);
	}

	public Hierarchy save(Hierarchy hierarchy) {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		Long realmId = hierarchy.getDatasource().getRealm().getId();
		if (!Objects.equals(realmId, user.getRealm().getId())) {
			throw new IllegalStateException("Cannot update hierarchy for realm " + realmId);
		}
		return hierarchyRepository.save(hierarchy);
	}

	public void delete(Long id) {
		Hierarchy hierarchy = findOne(id);
		hierarchyRepository.delete(hierarchy);
	}

	private BooleanExpression hasRealmPermission() {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		return QHierarchy.hierarchy.datasource.realm.id.eq(user.getRealm().getId());
	}
}
