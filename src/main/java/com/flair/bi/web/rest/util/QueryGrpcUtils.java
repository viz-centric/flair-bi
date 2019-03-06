package com.flair.bi.web.rest.util;

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
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class QueryGrpcUtils {

    public static Query mapToQuery(QueryDTO queryDTO, String sourceId, String queryId, String userId) {
        log.info(queryDTO.toString());
        Query.Builder builder = Query.newBuilder();
        builder.setSourceId(sourceId)
            .setSource(queryDTO.getSource())
            .setLimit(queryDTO.getLimit())
            .setDistinct(queryDTO.isDistinct())
            .addAllFields(queryDTO.getFields())
            .addAllGroupBy(queryDTO.getGroupBy());

        if (queryId != null) {
            builder.setQueryId(queryId);
        }

        if (userId != null) {
            builder.setUserId(userId);
        }

        builder.setEnableCaching(queryDTO.isEnableCaching());

        queryDTO.getOrders().forEach(sortDTO -> builder.addOrders(Query.SortHolder.newBuilder()
            .setDirectionValue(getDirectionValue(sortDTO.getDirection().ordinal()))
            .setFeatureName(sortDTO.getFeatureName())
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

    public static int getDirectionValue(int direction) {
        switch (direction) {
            case 0:
                return Query.SortHolder.Direction.ASC_VALUE;
            case 1:
                return Query.SortHolder.Direction.DESC_VALUE;
            default:
                return 0;
        }
    }

    public static int getFilterType(int sourceType) {
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

    public static int getExpressionType(ConditionExpression conditionExpression) {
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

    public static Query.ConditionExpressionHolder.AndOrExpressionType getAndOrExpressionType(ConditionExpression conditionExpression) {
        Query.ConditionExpressionHolder.AndOrExpressionType.Builder builder = Query.ConditionExpressionHolder.AndOrExpressionType.newBuilder();
        if (getExpressionType(conditionExpression) < 2) {
            CompositeConditionExpression compositeConditionExpression = (CompositeConditionExpression) conditionExpression;
            builder.setFirstExpressionTypeValue(getExpressionType(compositeConditionExpression.getFirstExpression()))
                .setSecondExpressionTypeValue(getExpressionType(compositeConditionExpression.getSecondExpression()));
        }
        return builder.build();
    }

    public static String getJsonFromConditionExpression(ConditionExpression conditionExpression) {
        Gson gson = new Gson();
        return gson.toJson(conditionExpression);
    }
}
