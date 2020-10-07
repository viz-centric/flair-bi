package com.flair.bi.service;

import com.flair.bi.domain.Feature;
import com.flair.bi.domain.QFeature;
import com.flair.bi.repository.FeatureRepository;
import com.flair.bi.service.dto.FunctionsDTO;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FeatureService {

	private final FeatureRepository featureRepository;
	private final FunctionsService functionsService;

	@Transactional(readOnly = true)
	public List<Feature> getFeatures(Predicate predicate) {
		log.debug("Attempt to retrieve features with predicate {}", predicate);
		return ImmutableList.copyOf(featureRepository.findAll(predicate));
	}

	@Transactional(readOnly = true)
	public Feature getOne(Long id) {
		log.debug("Attempt to retrieve feature with id: {}", id);
		return featureRepository.getOne(id);
	}

	public Feature save(Feature feature) {
		log.debug("Saving feature {}", feature);
		return featureRepository.save(feature);
	}

	public void delete(Long id) {
		log.debug("Attempt to delete feature with id {}", id);
		featureRepository.deleteById(id);
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
		featureRepository.saveAll(features);
	}

	public void markFavouriteFilter(Boolean favouriteFilter, Long id) {
		log.debug("FeatureService markFavouriteFilter ", favouriteFilter, id);
		featureRepository.markFavouriteFilter(favouriteFilter, id);
	}

	public void pinFilter(Boolean pin, Long id) {
		log.debug("FeatureService pinFilter ", pin, id);
		featureRepository.pinFilter(pin, id);
	}

	public List<FeatureValidationResult> validate(List<Feature> features) {
		return features.stream().map(f -> validate(f)).collect(Collectors.toList());
	}
}
