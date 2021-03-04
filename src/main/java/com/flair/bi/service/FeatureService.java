package com.flair.bi.service;

import com.flair.bi.domain.Feature;
import com.flair.bi.domain.FeatureCacheType;
import com.flair.bi.domain.QFeature;
import com.flair.bi.repository.FeatureRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.dto.FunctionsDTO;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FeatureService {

	private final FeatureRepository featureRepository;
	private final FunctionsService functionsService;
	private final UserService userService;

	@Transactional(readOnly = true)
	public List<Feature> getFeatures(Predicate predicate) {
		log.debug("Attempt to retrieve features with predicate {}", predicate);
		return ImmutableList.copyOf(
				featureRepository.findAll(hasRealmPermissions().and(predicate))
		);
	}

	@Transactional(readOnly = true)
	public Feature getOne(Long id) {
		log.debug("Attempt to retrieve feature with id: {}", id);
		return featureRepository.findOne(hasRealmPermissions().and(QFeature.feature.id.eq(id))).orElseThrow();
	}

	public Feature save(Feature feature) {
		log.debug("Saving feature {}", feature);
		validatePermissions(feature);
		return featureRepository.save(feature);
	}

	private void validatePermissions(Feature feature) {
		Long datasourceRealmId = feature.getDatasource().getRealm().getId();
		if (!Objects.equals(datasourceRealmId, SecurityUtils.getUserAuth().getRealmId())) {
			throw new IllegalStateException("Cannot save feature for with realm " + datasourceRealmId);
		}
	}

	public void delete(Long id) {
		log.debug("Attempt to delete feature with id {}", id);
		Feature feature = getOne(id);
		featureRepository.delete(feature);
	}

	public FeatureValidationResult validate(Feature feature) {
		log.info("Validating feature {}", feature);
		if (feature == null) {
			return FeatureValidationResult.FEATURE_NULL;
		}
		if (feature.getDefinition() == null) {
			return FeatureValidationResult.DEFINITION_NULL;
		}
		if (feature.getFunctionId() != null) {
			FunctionsDTO function = functionsService.findOne(feature.getFunctionId());
			if (function == null) {
				return FeatureValidationResult.FUNCTION_DOES_NOT_EXIST;
			}
			if (function.getValidation() != null) {
				boolean matches = feature.getDefinition().matches(function.getValidation());
				if (!matches) {
					return FeatureValidationResult.VALIDATION_FAIL;
				}
			}
		}
		List<Feature> existingFeatures = Optional.ofNullable(feature.getId())
				.map(id -> getFeatures(QFeature.feature.datasource.eq(feature.getDatasource())
						.and(QFeature.feature.name.eq(feature.getName())).and(QFeature.feature.id.ne(feature.getId()))))
				.orElseGet(() -> getFeatures(QFeature.feature.datasource.eq(feature.getDatasource())
						.and(QFeature.feature.name.eq(feature.getName()))));
		if (!existingFeatures.isEmpty()) {
			return FeatureValidationResult.ALREADY_EXISTS;
		}
		return FeatureValidationResult.OK;
	}

	public void save(List<Feature> features) {
		log.debug("Saving feature {}", features);
		features.forEach(f -> validatePermissions(f));
		featureRepository.saveAll(features);
	}

	public void markFavouriteFilter(Boolean favouriteFilter, Long id) {
		log.debug("FeatureService markFavouriteFilter {} {}", favouriteFilter, id);
		featureRepository.markFavouriteFilter(favouriteFilter, id, SecurityUtils.getUserAuth().getRealmId());
	}

	public void pinFilter(Boolean pin, Long id) {
		log.debug("FeatureService pinFilter {} {}", pin, id);
		featureRepository.pinFilter(pin, id);
	}

	public List<FeatureValidationResult> validate(List<Feature> features) {
		return features.stream().map(f -> validate(f)).collect(Collectors.toList());
	}

	public List<Feature> getCacheableFeatures() {
		List<Feature> cacheableFeatures = ImmutableList.copyOf(
				featureRepository.findAll(QFeature.feature.featureCacheType.eq(FeatureCacheType.ENABLED))
		);
		return cacheableFeatures;
	}

	private BooleanExpression hasRealmPermissions() {
		return QFeature.feature.datasource.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
	}
}
