package com.flair.bi.service;

import com.flair.bi.domain.DateFilterType;
import com.flair.bi.domain.Feature;
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
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueryValidationService {

    private static final Pattern FIELD_REGEX = Pattern.compile("[0-9a-zA-Z_]+");

    public QueryValidationResult validate(QueryDTO queryDTO, QueryValidationParams params) {
        log.info("Validate query {}", queryDTO);
        List<QueryValidationError> selectFieldsValidationResult = validateFields(queryDTO.getFields());
        if (!selectFieldsValidationResult.isEmpty()) {
            return QueryValidationResult.builder()
                    .errors(selectFieldsValidationResult)
                    .group(QueryValidationResult.Group.SELECT)
                    .build();
        }

        List<QueryValidationError> groupByValidationResult = validateFields(queryDTO.getGroupBy());
        if (!groupByValidationResult.isEmpty()) {
            return QueryValidationResult.builder()
                    .errors(groupByValidationResult)
                    .group(QueryValidationResult.Group.GROUP_BY)
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
                .map(featureName -> QueryValidationError.of(featureName, "RequiredConditionFeatureMissing"))
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
                    QueryValidationError.of("", "HavingValueInvalid")
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

    private Optional<QueryValidationError> validateField(FieldDTO field) {
        if (!StringUtils.isEmpty(field.getAggregation())
                && !FIELD_REGEX.matcher(field.getAggregation()).matches()) {
            return Optional.ofNullable(
                    QueryValidationError.of(field.getAggregation(),
                    "FieldAggregationInvalid")
            );
        }
        if (!StringUtils.isEmpty(field.getName())
                && !FIELD_REGEX.matcher(field.getName()).matches()) {
            return Optional.ofNullable(
                    QueryValidationError.of(field.getName(),
                    "FieldNameInvalid")
            );
        }
        if (!StringUtils.isEmpty(field.getAlias())
                && !FIELD_REGEX.matcher(field.getAlias()).matches()) {
            return Optional.ofNullable(
                    QueryValidationError.of(field.getAlias(),
                    "FieldAliasInvalid")
            );
        }
        return Optional.empty();
    }
}
