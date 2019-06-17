package com.flair.bi.service;

import com.flair.bi.domain.Feature;
import com.flair.bi.domain.QFeature;
import com.flair.bi.messages.Query;
import com.google.gson.Gson;
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

    public Query toQuery(QueryDTO queryDTO, String connectionName, String vId, String userId) {
        log.info("Map to query {}", queryDTO.toString());

        List<String> fields = queryDTO.getFields();
        List<String> groupBy = queryDTO.getGroupBy();

        if (connectionName != null) {
            Map<String, Feature> features = featureService.getFeatures(QFeature.feature.datasource.connectionName.eq(connectionName)
                    .and(QFeature.feature.datasource.name.eq(queryDTO.getSource())))
                    .stream()
                    .collect(Collectors.toMap(item -> item.getName(), item -> item));

            fields = transformFieldNames(fields, features);
            groupBy = transformGroupBy(groupBy, features);
        }

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
                    .setConditionExpression(getJsonFromConditionExpression(conditionExpressionDTO.getConditionExpression()))
                    .build()
            );
        });
        return builder.build();
    }

    private List<String> transformFieldNames(List<String> fields, Map<String, Feature> features) {
        return fields
                .stream()
                .map(field -> Optional.ofNullable(features.get(field))
                        .map(item -> item.getDefinition() + " as " + item.getName())
                        .orElse(field))
                .collect(Collectors.toList());
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

    private static String getJsonFromConditionExpression(ConditionExpression conditionExpression) {
        Gson gson = new Gson();
        return gson.toJson(sanitizeConditionalExpression(conditionExpression));
    }

    private static ConditionExpression sanitizeConditionalExpression(ConditionExpression conditionExpression) {
        if (conditionExpression instanceof OrConditionExpression) {
            OrConditionExpression orConditionExpression = (OrConditionExpression) conditionExpression;
            orConditionExpression.setFirstExpression(sanitizeConditionalExpression(orConditionExpression.getFirstExpression()));
            orConditionExpression.setSecondExpression(sanitizeConditionalExpression(orConditionExpression.getSecondExpression()));
        } else if (conditionExpression instanceof BetweenConditionExpression) {
            BetweenConditionExpression betweenConditionExpression = (BetweenConditionExpression) conditionExpression;
            betweenConditionExpression.setFeatureName(sanitize(betweenConditionExpression.getFeatureName()));
            betweenConditionExpression.setValue(sanitize(betweenConditionExpression.getValue()));
            betweenConditionExpression.setSecondValue(sanitize(betweenConditionExpression.getSecondValue()));
        } else if (conditionExpression instanceof CompareConditionExpression) {
            CompareConditionExpression compareConditionExpression = (CompareConditionExpression) conditionExpression;
            compareConditionExpression.setFeatureName(sanitize(compareConditionExpression.getFeatureName()));
            compareConditionExpression.setValue(sanitize(compareConditionExpression.getValue()));
        } else if (conditionExpression instanceof AndConditionExpression) {
            AndConditionExpression andConditionExpression = (AndConditionExpression) conditionExpression;
            andConditionExpression.setSecondExpression(sanitizeConditionalExpression(andConditionExpression.getSecondExpression()));
            andConditionExpression.setFirstExpression(sanitizeConditionalExpression(andConditionExpression.getFirstExpression()));
        } else if (conditionExpression instanceof ContainsConditionExpression) {
            ContainsConditionExpression containsConditionExpression = (ContainsConditionExpression) conditionExpression;
            containsConditionExpression.setFeatureName(containsConditionExpression.getFeatureName());
            containsConditionExpression.setValues(sanitizeList(containsConditionExpression.getValues()));
        } else if (conditionExpression instanceof NotContainsConditionExpression) {
            NotContainsConditionExpression notContainsConditionExpression = (NotContainsConditionExpression) conditionExpression;
            notContainsConditionExpression.setFeatureName(sanitize(notContainsConditionExpression.getFeatureName()));
            notContainsConditionExpression.setValues(sanitizeList(notContainsConditionExpression.getValues()));
        } else if (conditionExpression instanceof LikeConditionExpression) {
            LikeConditionExpression likeConditionExpression = (LikeConditionExpression) conditionExpression;
            likeConditionExpression.setValue(sanitize(likeConditionExpression.getValue()));
            likeConditionExpression.setFeatureName(sanitize(likeConditionExpression.getFeatureName()));
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
