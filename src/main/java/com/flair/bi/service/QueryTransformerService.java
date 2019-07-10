package com.flair.bi.service;

import com.flair.bi.domain.Feature;
import com.flair.bi.domain.QFeature;
import com.flair.bi.messages.Query;
import com.google.gson.Gson;
import com.project.bi.query.dto.HavingDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.expression.condition.CompositeConditionExpression;
import com.project.bi.query.expression.condition.ConditionExpression;
import com.project.bi.query.expression.condition.impl.AndConditionExpression;
import com.project.bi.query.expression.condition.impl.BetweenConditionExpression;
import com.project.bi.query.expression.condition.impl.CompareConditionExpression;
import com.project.bi.query.expression.condition.impl.ContainsConditionExpression;
import com.project.bi.query.expression.condition.impl.LikeConditionExpression;
import com.project.bi.query.expression.condition.impl.NotContainsConditionExpression;
import com.project.bi.query.expression.condition.impl.OrConditionExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.project.bi.query.SQLUtil.sanitize;

@Service
@Slf4j
@RequiredArgsConstructor
public class QueryTransformerService {

    private final FeatureService featureService;

    public Query toQuery(QueryDTO queryDTO, QueryTransformerParams params) {
        log.info("Map to query {} params {}", queryDTO.toString(), params);
        return toQuery(queryDTO, params.getConnectionName(), params.getVId(), params.getUserId(), params.getDatasourceId());
    }

    private Query toQuery(QueryDTO queryDTO, String connectionName, String vId, String userId, Long datasourceId) {
        Map<String, Feature> features = Optional.ofNullable(datasourceId)
                .map(ds -> featureService.getFeatures(QFeature.feature.datasource.id.eq(ds))
                        .stream()
                        .collect(Collectors.toMap(item -> item.getName(), item -> item)))
                .orElseGet(() -> new HashMap<>());

        List<String> fields = transformFieldNames(queryDTO.getFields(), features);
        List<String> groupBy = transformGroupBy(queryDTO.getGroupBy(), features);

        Query.Builder builder = Query.newBuilder();
        builder
                .setSource(sanitize(queryDTO.getSource()))
                .setLimit(queryDTO.getLimit())
                .setDistinct(queryDTO.isDistinct())
                .addAllFields(fields)
                .addAllGroupBy(groupBy);

        if (vId != null) {
            builder.setQueryId(vId);
        }

        if (connectionName != null) {
            builder.setSourceId(sanitize(connectionName));
        }

        if (userId != null) {
            builder.setUserId(sanitize(userId));
        }

        if (queryDTO.getHaving().size() > 0) {
            builder.addAllHaving(toHaving(queryDTO.getHaving(), features));
        }

        queryDTO.getOrders().forEach(sortDTO -> builder.addOrders(Query.SortHolder.newBuilder()
                .setDirectionValue(getDirectionValue(sortDTO.getDirection().ordinal()))
                .setFeatureName(sanitize(sortDTO.getFeatureName()))
                .build()
        ));

        queryDTO.getConditionExpressions().forEach(conditionExpressionDTO -> {
            builder.addConditionExpressions(Query.ConditionExpressionHolder.newBuilder()
                    .setSourceTypeValue(getFilterType(conditionExpressionDTO.getSourceType().ordinal()))
                    .setExpressionTypeValue(getExpressionType(conditionExpressionDTO.getConditionExpression()))
                    .setAndOrExpressionType(getAndOrExpressionType(conditionExpressionDTO.getConditionExpression()))
                    .setConditionExpression(getJsonFromConditionExpression(conditionExpressionDTO.getConditionExpression(), features))
                    .build()
            );
        });
        return builder.build();
    }

    private List<Query.HavingHolder> toHaving(List<HavingDTO> having, Map<String, Feature> features) {
        return having.stream()
                .map(h -> Query.HavingHolder.newBuilder()
                        .setFeatureName(transformFieldNameOrSanitize(features, h.getFeatureName()))
                        .setValue(sanitize(h.getValue()))
                        .setComparatorType(Query.HavingHolder.ComparatorType.valueOf(h.getComparatorType().name()))
                        .build())
                .collect(Collectors.toList());
    }

    private List<String> transformFieldNames(List<String> fields, Map<String, Feature> features) {
        return fields
                .stream()
                .map(field -> Optional.ofNullable(features.get(field))
                        .map(item -> item.getDefinition() + " as " + item.getName())
                        .orElse(field))
                .collect(Collectors.toList());
    }

    private String transformFieldNameOrSanitize(Map<String, Feature> features, String field) {
        return Optional.ofNullable(features.get(field))
                .map(item -> item.getDefinition())
                .orElseGet(() -> sanitize(field));
    }

    private List<String> transformGroupBy(List<String> fields, Map<String, Feature> features) {
        return fields
                .stream()
                .map(field -> Optional.ofNullable(features.get(field))
                        .map(item -> item.getDefinition())
                        .orElse(field))
                .collect(Collectors.toList());
    }

    private static int getDirectionValue(int direction) {
        switch (direction) {
            case 0:
                return Query.SortHolder.Direction.ASC_VALUE;
            case 1:
                return Query.SortHolder.Direction.DESC_VALUE;
            default:
                return 0;
        }
    }

    private static int getFilterType(int sourceType) {
        switch (sourceType) {
            case 0:
                return Query.ConditionExpressionHolder.SourceType.BASE_VALUE;
            case 1:
                return Query.ConditionExpressionHolder.SourceType.FILTER_VALUE;
            case 2:
                return Query.ConditionExpressionHolder.SourceType.REDUCTION_VALUE;
            default:
                return Query.ConditionExpressionHolder.SourceType.FILTER_VALUE;
        }
    }

    private static int getExpressionType(ConditionExpression conditionExpression) {
        if (conditionExpression instanceof AndConditionExpression) {
            return Query.ConditionExpressionHolder.ExpressionType.AND_VALUE;
        } else if (conditionExpression instanceof OrConditionExpression) {
            return Query.ConditionExpressionHolder.ExpressionType.OR_VALUE;
        } else if (conditionExpression instanceof BetweenConditionExpression) {
            return Query.ConditionExpressionHolder.ExpressionType.BETWEEN_VALUE;
        } else if (conditionExpression instanceof CompareConditionExpression) {
            return Query.ConditionExpressionHolder.ExpressionType.COMPARE_VALUE;
        } else if (conditionExpression instanceof ContainsConditionExpression) {
            return Query.ConditionExpressionHolder.ExpressionType.CONTAINS_VALUE;
        } else if (conditionExpression instanceof NotContainsConditionExpression) {
            return Query.ConditionExpressionHolder.ExpressionType.NOTCONTAINS_VALUE;
        } else if (conditionExpression instanceof LikeConditionExpression) {
            return Query.ConditionExpressionHolder.ExpressionType.LIKE_VALUE;
        }
        return 0;
    }

    private static Query.ConditionExpressionHolder.AndOrExpressionType getAndOrExpressionType(ConditionExpression conditionExpression) {
        Query.ConditionExpressionHolder.AndOrExpressionType.Builder builder = Query.ConditionExpressionHolder.AndOrExpressionType.newBuilder();
        if (getExpressionType(conditionExpression) < 2) {
            CompositeConditionExpression compositeConditionExpression = (CompositeConditionExpression) conditionExpression;
            builder.setFirstExpressionTypeValue(getExpressionType(compositeConditionExpression.getFirstExpression()))
                    .setSecondExpressionTypeValue(getExpressionType(compositeConditionExpression.getSecondExpression()));
        }
        return builder.build();
    }

    private String getJsonFromConditionExpression(ConditionExpression conditionExpression, Map<String, Feature> features) {
        Gson gson = new Gson();
        return gson.toJson(sanitizeConditionalExpression(conditionExpression, features));
    }

    private ConditionExpression sanitizeConditionalExpression(ConditionExpression conditionExpression, Map<String, Feature> features) {
        if (conditionExpression instanceof OrConditionExpression) {
            OrConditionExpression orConditionExpression = (OrConditionExpression) conditionExpression;
            orConditionExpression.setFirstExpression(sanitizeConditionalExpression(orConditionExpression.getFirstExpression(), features));
            orConditionExpression.setSecondExpression(sanitizeConditionalExpression(orConditionExpression.getSecondExpression(), features));
        } else if (conditionExpression instanceof BetweenConditionExpression) {
            BetweenConditionExpression betweenConditionExpression = (BetweenConditionExpression) conditionExpression;
            betweenConditionExpression.setFeatureName(transformFieldNameOrSanitize(features, betweenConditionExpression.getFeatureName()));
            betweenConditionExpression.setValue(sanitize(betweenConditionExpression.getValue()));
            betweenConditionExpression.setSecondValue(sanitize(betweenConditionExpression.getSecondValue()));
        } else if (conditionExpression instanceof CompareConditionExpression) {
            CompareConditionExpression compareConditionExpression = (CompareConditionExpression) conditionExpression;
            compareConditionExpression.setFeatureName(transformFieldNameOrSanitize(features, compareConditionExpression.getFeatureName()));
            compareConditionExpression.setValue(sanitize(compareConditionExpression.getValue()));
        } else if (conditionExpression instanceof AndConditionExpression) {
            AndConditionExpression andConditionExpression = (AndConditionExpression) conditionExpression;
            andConditionExpression.setSecondExpression(sanitizeConditionalExpression(andConditionExpression.getSecondExpression(), features));
            andConditionExpression.setFirstExpression(sanitizeConditionalExpression(andConditionExpression.getFirstExpression(), features));
        } else if (conditionExpression instanceof ContainsConditionExpression) {
            ContainsConditionExpression containsConditionExpression = (ContainsConditionExpression) conditionExpression;
            containsConditionExpression.setFeatureName(transformFieldNameOrSanitize(features, containsConditionExpression.getFeatureName()));
            containsConditionExpression.setValues(sanitizeList(containsConditionExpression.getValues()));
        } else if (conditionExpression instanceof NotContainsConditionExpression) {
            NotContainsConditionExpression notContainsConditionExpression = (NotContainsConditionExpression) conditionExpression;
            notContainsConditionExpression.setFeatureName(transformFieldNameOrSanitize(features, notContainsConditionExpression.getFeatureName()));
            notContainsConditionExpression.setValues(sanitizeList(notContainsConditionExpression.getValues()));
        } else if (conditionExpression instanceof LikeConditionExpression) {
            LikeConditionExpression likeConditionExpression = (LikeConditionExpression) conditionExpression;
            likeConditionExpression.setValue(sanitize(likeConditionExpression.getValue()));
            likeConditionExpression.setFeatureName(transformFieldNameOrSanitize(features, likeConditionExpression.getFeatureName()));
        }
        return conditionExpression;
    }

    private static List<String> sanitizeList(List<String> list) {
        return list
                .stream()
                .map(item -> sanitize(item))
                .collect(Collectors.toList());
    }

}
