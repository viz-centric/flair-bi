package com.flair.bi.service;

import com.flair.bi.domain.Feature;
import com.flair.bi.domain.FeatureBookmark;
import com.flair.bi.domain.FeatureCriteria;
import com.flair.bi.domain.User;
import com.flair.bi.repository.FeatureCriteriaRepository;
import com.flair.bi.security.SecurityUtils;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

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
		if (!Objects.equals(feature.getDatasource().getRealm().getId(), SecurityUtils.getUserAuth().getRealmId())) {
			throw new IllegalStateException("Cannot save feature criteria because datasource does not belong to this realm " + feature.getDatasource().getRealm().getId());
		}
		if (user.getRealmById(SecurityUtils.getUserAuth().getRealmId()) == null) {
			throw new IllegalStateException("Cannot save feature criteria because bookmark user does not belong to this realm " + SecurityUtils.getUserAuth().getRealmId());
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

		return filterByRealm((List<FeatureCriteria>) featureCriteriaRepository.findAll(predicate));
	}

	private List<FeatureCriteria> filterByRealm(List<FeatureCriteria> all) {
		return all.stream()
				.filter(fc -> Objects.equals(fc.getFeature().getDatasource().getRealm().getId(), SecurityUtils.getUserAuth().getRealmId()))
				.collect(Collectors.toList());
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
		FeatureCriteria result = featureCriteriaRepository.getOne(id);

		if (!Objects.equals(result.getFeature().getDatasource().getRealm().getId(), SecurityUtils.getUserAuth().getRealmId())) {
			throw new IllegalStateException("Cannot access feature criteria for realm " + result.getFeature().getDatasource().getRealm().getId());
		}
		return result;
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
}
