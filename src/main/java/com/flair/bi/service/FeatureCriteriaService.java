package com.flair.bi.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flair.bi.domain.FeatureBookmark;
import com.flair.bi.domain.FeatureCriteria;
import com.flair.bi.domain.QFeatureCriteria;
import com.flair.bi.repository.FeatureBookmarkRepository;
import com.flair.bi.repository.FeatureCriteriaRepository;
import com.flair.bi.security.SecurityUtils;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service Implementation for managing FeatureCriteria.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FeatureCriteriaService {

	private final FeatureCriteriaRepository featureCriteriaRepository;

	private final FeatureBookmarkRepository featureBookmarkRepository;

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
			FeatureBookmark featureBookmark = featureBookmarkRepository
					.getOne(featureCriteria.getFeatureBookmark().getId());
			featureBookmark.addFeatureCriteria(featureCriteria);
			return featureCriteriaRepository.save(featureCriteria);
		} else {
			FeatureCriteria featureCrit = featureCriteriaRepository.getOne(featureCriteria.getId());
			featureCrit.setFeature(featureCrit.getFeature());
			featureCrit.setValue(featureCrit.getValue());
			return featureCriteriaRepository.save(featureCrit);
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

		BooleanExpression pred = QFeatureCriteria.featureCriteria.featureBookmark.user.login
				.eq(SecurityUtils.getCurrentUserLogin());
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
		return featureCriteriaRepository.getOne(id);
	}

	/**
	 * Delete the featureCriteria by id.
	 *
	 * @param id the id of the entity
	 */
	public void delete(Long id) {
		log.debug("Request to delete FeatureCriteria : {}", id);
		Optional<FeatureCriteria> featureCriteria = featureCriteriaRepository.findById(id);

		featureCriteria.ifPresent(x -> {
			Optional<FeatureBookmark> featureBookmark = featureBookmarkRepository
					.findById(x.getFeatureBookmark().getId());
			featureBookmark.ifPresent(y -> {
				y.removeFeatureCriteria(x);
				featureBookmarkRepository.save(y);
			});

		});
	}
}
