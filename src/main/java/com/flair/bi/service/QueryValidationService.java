package com.flair.bi.service;

import com.flair.bi.domain.DateFilterType;
import com.flair.bi.domain.Feature;
import com.flair.bi.domain.enumeration.FeatureType;
import com.flair.bi.service.dto.QueryValidationType;
import com.project.bi.query.dto.ConditionExpressionDTO;
import com.project.bi.query.dto.FieldDTO;
import com.project.bi.query.dto.HavingDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.dto.SortDTO;
import com.project.bi.query.expression.condition.ConditionExpression;
import com.project.bi.query.expression.condition.impl.AndConditionExpression;
import com.project.bi.query.expression.condition.impl.BetweenConditionExpression;
import com.project.bi.query.expression.condition.impl.CompareConditionExpression;
import com.project.bi.query.expression.condition.impl.ContainsConditionExpression;
import com.project.bi.query.expression.condition.impl.LikeConditionExpression;
import com.project.bi.query.expression.condition.impl.OrConditionExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static com.flair.bi.service.QueryValidationError.Error.RequiredConditionFeatureMissing;
import static com.flair.bi.service.QueryValidationError.Error.RestrictedFeatureUsed;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueryValidationService {

    public QueryValidationResult validate(QueryDTO queryDTO, QueryValidationParams params) {
        log.info("Validate query {}", queryDTO);

        QueryValidationResult selectFieldsValidationResult = validateSelectFields(params, queryDTO.getFields());
        if (!selectFieldsValidationResult.success()) {
            return selectFieldsValidationResult;
        }

        QueryValidationResult groupByValidationResult = validateGroupByFields(selectFieldsValidationResult.getRestrictedFieldNames(), queryDTO.getGroupBy());
        if (!groupByValidationResult.success()) {
            return groupByValidationResult;
        }

        if (selectFieldsValidationResult.hasModifications() || groupByValidationResult.hasModifications()) {
            return QueryValidationResult.builder()
                    .newGroupByFields(groupByValidationResult.getNewGroupByFields())
                    .newSelectFields(selectFieldsValidationResult.getNewSelectFields())
                    .build();
        }

        List<QueryValidationError> orderByValidationResult = validateOrders(queryDTO.getOrders());
        if (!orderByValidationResult.isEmpty()) {
            return QueryValidationResult.builder()
                    .errors(orderByValidationResult)
                    .group(QueryValidationResult.Group.ORDER_BY)
                    .build();
        }

        List<QueryValidationError> havingResult = validateHavings(queryDTO.getHaving());
        if (!havingResult.isEmpty()) {
            return QueryValidationResult.builder()
                    .errors(havingResult)
                    .group(QueryValidationResult.Group.HAVING)
                    .build();
        }

        if (params.getValidationType() == QueryValidationType.REQUIRED_FIELDS) {
            List<QueryValidationError> conditionsResult = validateConditions(queryDTO.getConditionExpressions(),
                    params.getFeatures());
            if (!conditionsResult.isEmpty()) {
                return QueryValidationResult.builder()
                        .errors(conditionsResult)
                        .group(QueryValidationResult.Group.CONDITIONS)
                        .build();
            }
        }

        return QueryValidationResult.builder()
                .build();
    }

    private List<QueryValidationError> validateConditions(List<ConditionExpressionDTO> conditionExpressions, Map<String, Feature> features) {
        Set<String> featureNamesWithDateFilterEnabled = new HashSet<>(getRequiredByConditionFeatureNames(features));
        conditionExpressions
                .forEach(conditionExpressionDTO ->
                        validateCondition(conditionExpressionDTO.getConditionExpression(), features)
                                .forEach(featureName -> featureNamesWithDateFilterEnabled.remove(featureName)));
        return featureNamesWithDateFilterEnabled.stream()
                .map(featureName -> QueryValidationError.of(featureName, RequiredConditionFeatureMissing))
                .collect(toList());
    }

    private Set<String> validateCondition(ConditionExpression conditionExpression, Map<String, Feature> features) {
        return getConditionFeatureNames(conditionExpression);
    }

    private Set<String> getRequiredByConditionFeatureNames(Map<String, Feature> features) {
        return features.values()
                    .stream()
                    .filter(feature -> feature.getDateFilter() == DateFilterType.ENABLED)
                    .map(feature -> feature.getName())
                    .collect(toSet());
    }

    private Set<String> getConditionFeatureNames(ConditionExpression conditionExpression) {
        Set<String> set = new HashSet<>();
        if (conditionExpression instanceof OrConditionExpression) {
            OrConditionExpression orConditionExpression = (OrConditionExpression) conditionExpression;
            set.addAll(getConditionFeatureNames(orConditionExpression.getFirstExpression()));
            set.addAll(getConditionFeatureNames(orConditionExpression.getSecondExpression()));
        } else if (conditionExpression instanceof BetweenConditionExpression) {
            BetweenConditionExpression betweenConditionExpression = (BetweenConditionExpression) conditionExpression;
            if (betweenConditionExpression.getFeatureName() != null) {
                set.add(betweenConditionExpression.getFeatureName());
            }
        } else if (conditionExpression instanceof CompareConditionExpression) {
            CompareConditionExpression compareConditionExpression = (CompareConditionExpression) conditionExpression;
            if (compareConditionExpression.getFeatureName() != null) {
                set.add(compareConditionExpression.getFeatureName());
            }
            if (compareConditionExpression.getFeatureProperty() != null && compareConditionExpression.getFeatureProperty().getProperty() != null) {
                set.add(compareConditionExpression.getFeatureProperty().getProperty());
            }
        } else if (conditionExpression instanceof AndConditionExpression) {
            AndConditionExpression andConditionExpression = (AndConditionExpression) conditionExpression;
            set.addAll(getConditionFeatureNames(andConditionExpression.getFirstExpression()));
            set.addAll(getConditionFeatureNames(andConditionExpression.getSecondExpression()));
        } else if (conditionExpression instanceof ContainsConditionExpression) {
            ContainsConditionExpression containsConditionExpression = (ContainsConditionExpression) conditionExpression;
            if (containsConditionExpression.getFeatureName() != null) {
                set.add(containsConditionExpression.getFeatureName());
            }
        } else if (conditionExpression instanceof LikeConditionExpression) {
            LikeConditionExpression likeConditionExpression = (LikeConditionExpression) conditionExpression;
            if (likeConditionExpression.getFeatureName() != null) {
                set.add(likeConditionExpression.getFeatureName());
            }
            if (likeConditionExpression.getFeatureType() != null) {
                set.add(likeConditionExpression.getFeatureType().getFeatureName());
            }
        }
        return set;
    }

    private List<QueryValidationError> validateOrders(List<SortDTO> orders) {
        return orders.stream()
                .map(order -> validateOrder(order))
                .filter(optional -> optional.isPresent())
                .map(optional -> optional.get())
                .collect(toList());
    }

    private Optional<QueryValidationError> validateOrder(SortDTO order) {
        return validateField(order.getFeature());
    }

    private List<QueryValidationError> validateHavings(List<HavingDTO> havings) {
        return havings.stream()
                .map(having -> validateHaving(having))
                .filter(optional -> optional.isPresent())
                .map(optional -> optional.get())
                .collect(toList());
    }

    private Optional<QueryValidationError> validateHaving(HavingDTO having) {
        Optional<QueryValidationError> validationError = validateField(having.getFeature());
        if (validationError.isPresent()) {
            return validationError;
        }
        if (having.getOperation() == null) {
            return Optional.ofNullable(
                    QueryValidationError.of("", QueryValidationError.Error.HavingValueInvalid)
            );
        }
        return Optional.empty();
    }

    private List<QueryValidationError> validateFields(List<FieldDTO> fields) {
        return fields.stream()
                .map(field -> validateField(field))
                .filter(field -> field.isPresent())
                .map(field -> field.get())
                .collect(toList());
    }

    private QueryValidationResult validateGroupByFields(Set<String> restrictedFieldNames, List<FieldDTO> fields) {
        List<FieldDTO> newGroupByFields;
        if (restrictedFieldNames != null) {
            newGroupByFields = fields.stream()
                    .filter(f -> !restrictedFieldNames.contains(f.getName()))
                    .collect(toList());
        } else {
            newGroupByFields = fields;
        }

        List<QueryValidationError> errors = validateFields(newGroupByFields);

        if (!errors.isEmpty()) {
            return QueryValidationResult.builder()
                    .group(QueryValidationResult.Group.GROUP_BY)
                    .errors(errors)
                    .build();
        }

        if (!newGroupByFields.equals(fields)) {
            return QueryValidationResult.builder()
                    .newGroupByFields(newGroupByFields)
                    .build();
        }

        return QueryValidationResult.builder()
                .build();
    }

    private QueryValidationResult validateSelectFields(QueryValidationParams params, List<FieldDTO> fields) {
        List<QueryValidationError> errors = fields.stream()
                .map(field -> validateField(params, field))
                .filter(field -> field.isPresent())
                .map(field -> field.get())
                .collect(toList());

        Map<FeatureType, List<Feature>> featuresMap = fields.stream()
                .map(f -> params.getFeatures().get(f.getName()))
                .filter(f -> f != null)
                .collect(groupingBy(f -> f.getFeatureType()));

        Map<FeatureType, List<QueryValidationError>> restrictedErrorsMap = errors.stream()
                .filter(e -> e.getError() == RestrictedFeatureUsed)
                .collect(groupingBy(e -> {
                    Feature feature = params.getFeatures().get(e.getValue());
                    return feature.getFeatureType();
                }));

        Set<String> restrictedFieldNames = restrictedErrorsMap.values().stream()
                .flatMap(v -> v.stream())
                .map(e -> e.getValue())
                .collect(toSet());

        boolean allowRestrictedFeatures = restrictedErrorsMap.keySet()
                .stream()
                .allMatch(ft -> {
                    int featuresCount = featuresMap.get(ft).size();
                    int errorsCount = restrictedErrorsMap.get(ft).size();
                    return featuresCount - errorsCount > 0;
                });

        if (allowRestrictedFeatures) {
            List<FieldDTO> nonRestrictedFields = fields.stream()
                    .filter(f -> !restrictedFieldNames.contains(f.getName()))
                    .collect(toList());
            return QueryValidationResult.builder()
                    .newSelectFields(nonRestrictedFields)
                    .restrictedFieldNames(restrictedFieldNames)
                    .build();
        }

        return QueryValidationResult
                .builder()
                .errors(errors)
                .group(QueryValidationResult.Group.SELECT)
                .build();
    }

    private Optional<QueryValidationError> validateField(QueryValidationParams params, FieldDTO field) {
        Feature feature = params.getFeatures().get(field.getName());
        Optional<QueryValidationError> restrictedFeatureUsed = Optional.ofNullable(feature)
                .filter(item -> params.getRestrictedFeatureIds().contains(item.getId()))
                .map(item -> QueryValidationError.of(field.getName(), QueryValidationError.Error.RestrictedFeatureUsed));
        return restrictedFeatureUsed;
    }

    private Optional<QueryValidationError> validateField(FieldDTO field) {
        return Optional.empty();
    }
}
