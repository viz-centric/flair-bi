package com.flair.bi.service;

import com.flair.bi.domain.Feature;
import com.flair.bi.domain.FeatureBookmark;
import com.flair.bi.domain.FeatureCriteria;
import com.flair.bi.domain.QFeatureCriteria;
import com.flair.bi.domain.User;
import com.flair.bi.repository.FeatureCriteriaRepository;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * Service Implementation for managing FeatureCriteria.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FeatureCriteriaService {

	private final FeatureCriteriaRepository featureCriteriaRepository;

	private final FeatureBookmarkService featureBookmarkService;
	private final FeatureService featureService;
	private final UserService userService;

	/**
	 * Save a featureCriteria.
	 *
	 * @param featureCriteria the entity to save
	 * @return the persisted entity
	 */
	public FeatureCriteria save(FeatureCriteria featureCriteria) {
		log.debug("Request to save FeatureCriteria : {}", featureCriteria);

		boolean create = featureCriteria.getId() == null;

		if (create) {
			FeatureBookmark featureBookmark = featureBookmarkService
					.findOne(featureCriteria.getFeatureBookmark().getId());
			featureBookmark.addFeatureCriteria(featureCriteria);
			validatePermissions(featureCriteria);
			return featureCriteriaRepository.save(featureCriteria);
		} else {
			FeatureCriteria featureCrit = featureCriteriaRepository.getOne(featureCriteria.getId());
			featureCrit.setFeature(featureCrit.getFeature());
			featureCrit.setValue(featureCrit.getValue());
			validatePermissions(featureCrit);
			return featureCriteriaRepository.save(featureCrit);
		}
	}

	private void validatePermissions(FeatureCriteria featureCriteria) {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		Feature feature = featureService.getOne(featureCriteria.getFeature().getId());
		FeatureBookmark featureBookmark = featureBookmarkService.findOne(featureCriteria.getFeatureBookmark().getId());
		if (!Objects.equals(feature.getDatasource().getRealm().getId(), user.getRealm().getId())) {
			throw new IllegalStateException("Cannot save feature criteria because datasource does not belong to this realm " + feature.getDatasource().getRealm().getId());
		}
		if (!Objects.equals(featureBookmark.getUser().getRealm().getId(), user.getRealm().getId())) {
			throw new IllegalStateException("Cannot save feature criteria because bookmark user does not belong to this realm " + featureBookmark.getUser().getRealm().getId());
		}
	}

	/**
	 * Get all the featureCriteria.
	 *
	 * @param predicate predicate
	 * @return the list of entities
	 */
	@Transactional(readOnly = true)
	public List<FeatureCriteria> findAll(Predicate predicate) {
		log.debug("Request to get all FeatureCriteria");

		BooleanExpression pred = hasRealmPermissions();
		if (predicate != null) {
			pred = pred.and(predicate);
		}

		return (List<FeatureCriteria>) featureCriteriaRepository.findAll(pred);
	}

	/**
	 * Get one featureCriteria by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Transactional(readOnly = true)
	public FeatureCriteria findOne(Long id) {
		log.debug("Request to get FeatureCriteria : {}", id);
		return featureCriteriaRepository.findOne(hasRealmPermissions().and(QFeatureCriteria.featureCriteria.id.eq(id))).orElseThrow();
	}

	/**
	 * Delete the featureCriteria by id.
	 *
	 * @param id the id of the entity
	 */
	public void delete(Long id) {
		log.debug("Request to delete FeatureCriteria : {}", id);
		FeatureCriteria featureCriteria = findOne(id);

		FeatureBookmark featureBookmark = featureBookmarkService
				.findOne(featureCriteria.getFeatureBookmark().getId());
		if (featureBookmark != null) {
			featureBookmark.removeFeatureCriteria(featureCriteria);
			featureBookmarkService.save(featureBookmark);
		}
	}

	private BooleanExpression hasRealmPermissions() {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		return QFeatureCriteria.featureCriteria.featureBookmark.user.realm.id.eq(user.getRealm().getId());
	}
}
