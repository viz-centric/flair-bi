package com.flair.bi.web.rest.util;

import com.flair.bi.config.jackson.JacksonUtil;
import com.flair.bi.messages.Connection;
import com.flair.bi.messages.Query;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.UserService;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.project.bi.query.dto.ConditionExpressionDTO;
import com.project.bi.query.dto.FieldDTO;
import com.project.bi.query.dto.HavingDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.dto.QuerySource;
import com.project.bi.query.dto.SortDTO;
import com.project.bi.query.expression.condition.ConditionExpression;
import com.project.bi.query.expression.condition.impl.AndConditionExpression;
import com.project.bi.query.expression.condition.impl.BetweenConditionExpression;
import com.project.bi.query.expression.condition.impl.CompareConditionExpression;
import com.project.bi.query.expression.condition.impl.ContainsConditionExpression;
import com.project.bi.query.expression.condition.impl.LikeConditionExpression;
import com.project.bi.query.expression.condition.impl.NotContainsConditionExpression;
import com.project.bi.query.expression.condition.impl.OrConditionExpression;
import com.project.bi.query.expression.operations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.flair.bi.web.rest.util.GrpcUtils.orEmpty;

@Slf4j
public final class QueryGrpcUtils {

    public static Connection toProtoConnection(ConnectionDTO connection, UserService userService) {
        return Optional.ofNullable(connection)
                .map(c -> {
                    Connection.Builder builder = Connection.newBuilder()
                            .setConnectionPassword(orEmpty(c.getConnectionPassword()))
                            .setConnectionUsername(c.getConnectionUsername())
                            .setConnectionType(c.getConnectionTypeId())
                            .setName(c.getName())
                            .setRealmId(SecurityUtils.getUserAuth().getRealmId())
                            .putAllDetails(c.getDetails());
                    if (c.getConnectionParameters() != null) {
                        builder.putAllConnectionParameters(c.getConnectionParameters());
                    }
                    if (c.getId() != null) {
                        builder.setId(c.getId());
                    }
                    if (c.getLinkId() != null) {
                        builder.setLinkId(c.getLinkId());
                    }
                    return builder.build();
                })
                .orElse(null);
    }

    public static QueryDTO mapToQueryDTO(Query request) {
        QueryDTO queryDTO = new QueryDTO();
        queryDTO.setSource(request.getSource());
        queryDTO.setQuerySource(getQuerySourceDTO(request.getQuerySource()));
        queryDTO.setFields(toFieldDTOs(request.getFieldsList()));
        queryDTO.setGroupBy(toFieldDTOs(request.getGroupByList()));
        if (request.getLimit() != 0) {
            queryDTO.setLimit(request.getLimit());
        }
        if (request.getOffset() != 0) {
            queryDTO.setOffset(request.getOffset());
        }
        queryDTO.setDistinct(request.getDistinct());
        queryDTO.setOrders(getListSortDTO(request.getOrdersList()));
        queryDTO.setHaving(getListHavingDTO(request.getHavingList()));
        queryDTO.setConditionExpressions(getListConditionExpressionDTO(request.getConditionExpressionsList()));
        return queryDTO;
    }

    private static QuerySource getQuerySourceDTO(Query.QuerySource querySource) {
        if (!StringUtils.isEmpty(querySource.getSource())) {
            return JacksonUtil.fromString(querySource.getSource(), QuerySource.class);
        }
        return null;
    }

    private static List<FieldDTO> toFieldDTOs(List<Query.Field> fieldsList) {
        return fieldsList.stream()
                .map(QueryGrpcUtils::toFieldDTO)
                .collect(Collectors.toList());
    }

    private static FieldDTO toFieldDTO(Query.Field field) {
        return new FieldDTO(StringUtils.isEmpty(field.getName()) ? null : field.getName(),
                StringUtils.isEmpty(field.getAggregation()) ? null : field.getAggregation(),
                StringUtils.isEmpty(field.getAlias()) ? null : field.getAlias());
    }

    private static List<HavingDTO> getListHavingDTO(List<Query.HavingHolder> havingList) {
        return havingList.stream()
                .map(h -> HavingDTO.builder()
                        .feature(toFieldDTO(h.getFeature()))
                        .operation(createOperation(h.getOperation()))
                        .comparatorType(HavingDTO.ComparatorType.valueOf(h.getComparatorType().name()))
                        .operation(toQueryDTO(h.getOperation()))
                        .build()
                )
                .collect(Collectors.toList());
    }

    private static Operation toQueryDTO(String operationsJson) {
        if (!StringUtils.isEmpty(operationsJson)) {
            return JacksonUtil.fromString(operationsJson, Operation.class);
        }
        return null;
    }

    private static List<SortDTO> getListSortDTO(List<Query.SortHolder> orders) {
        return orders.stream().map(order -> {
            SortDTO sortDTO = new SortDTO();
            sortDTO.setFeature(toFieldDTO(order.getFeature()));
            sortDTO.setDirection(order.getDirectionValue() == 0 ? SortDTO.Direction.ASC : SortDTO.Direction.DESC);
            return sortDTO;
        }).collect(Collectors.toList());
    }

    private static List<ConditionExpressionDTO> getListConditionExpressionDTO(List<Query.ConditionExpressionHolder> conditionExpressions) {
        return conditionExpressions.stream().map(conditionExpressionHolder -> {
            ConditionExpressionDTO conditionExpressionDTO = new ConditionExpressionDTO();
            conditionExpressionDTO.setSourceType(getFilterSourceType(conditionExpressionHolder.getSourceTypeValue()));
            conditionExpressionDTO.setConditionExpression((conditionExpressionHolder.getExpressionTypeValue() > 1) ?
                    createConditionExpression(conditionExpressionHolder.getConditionExpression(), conditionExpressionHolder.getExpressionTypeValue()) :
                    createAndOrConditionExpression(conditionExpressionHolder.getConditionExpression(), conditionExpressionHolder.getExpressionTypeValue(), conditionExpressionHolder.getAndOrExpressionType()));
            return conditionExpressionDTO;
        }).collect(Collectors.toList());
    }

    private static ConditionExpressionDTO.SourceType getFilterSourceType(Integer value) {
        if (value == 0) {
            return ConditionExpressionDTO.SourceType.BASE;
        } else if (value == 1) {
            return ConditionExpressionDTO.SourceType.FILTER;
        } else if (value == 2) {
            return ConditionExpressionDTO.SourceType.REDUCTION;
        }
        return null;
    }

    private static ConditionExpression createConditionExpression(String conditionExpressionString, Integer expressionType) {
        return JacksonUtil.fromString(
                conditionExpressionString,
                getConditionExpressionInstance(expressionType).getClass()
        );
    }

    private static Operation createOperation(String operationJson) {
        return JacksonUtil.fromString(
                operationJson,
                Operation.class
        );
    }

    private static ConditionExpression createAndOrConditionExpression(String conditionExpressionString, Integer expressionType, Query.ConditionExpressionHolder.AndOrExpressionType andOrExpressionType) {
        JsonParser parser = new JsonParser();
        JsonElement jsonTree = parser.parse(conditionExpressionString);
        if (jsonTree.isJsonObject()) {
            ConditionExpression firstExpression = JacksonUtil.fromString(
                    jsonTree.getAsJsonObject().get(GrpcConstants.FIRST_EXPRESSION).toString(),
                    getConditionExpressionInstance(andOrExpressionType.getFirstExpressionTypeValue()).getClass()
            );

            ConditionExpression secondExpression = JacksonUtil.fromString(
                    jsonTree.getAsJsonObject().get(GrpcConstants.SECOND_EXPRESSION).toString(),
                    getConditionExpressionInstance(andOrExpressionType.getSecondExpressionTypeValue()).getClass()
            );

            return (expressionType == 0) ?
                    createAndConditionExpression(firstExpression, secondExpression) :
                    createOrConditionExpression(firstExpression, secondExpression);
        }
        return null;
    }

    private static ConditionExpression createAndConditionExpression(ConditionExpression firstConditionExpression, ConditionExpression secondConditionExpression) {
        AndConditionExpression andConditionExpression = new AndConditionExpression();
        andConditionExpression.setFirstExpression(firstConditionExpression);
        andConditionExpression.setSecondExpression(secondConditionExpression);
        return andConditionExpression;
    }

    private static ConditionExpression createOrConditionExpression(ConditionExpression firstConditionExpression, ConditionExpression secondConditionExpression) {
        OrConditionExpression orConditionExpression = new OrConditionExpression();
        orConditionExpression.setFirstExpression(firstConditionExpression);
        orConditionExpression.setSecondExpression(secondConditionExpression);
        return orConditionExpression;
    }

    private static ConditionExpression getConditionExpressionInstance(Integer type) {
        switch (type) {
            case 0:
                return GrpcConstants.andConditionExpression;
            case 1:
                return GrpcConstants.orConditionExpression;
            case 2:
                return GrpcConstants.betweenConditionExpression;
            case 3:
                return GrpcConstants.compareConditionExpression;
            case 4:
                return GrpcConstants.containsConditionExpression;
            case 5:
                return GrpcConstants.notContainsConditionExpression;
            case 6:
                return GrpcConstants.likeConditionExpression;
            default:
                throw new IllegalArgumentException("No conditional expression found for type " + type);
        }
    }

    private static class GrpcConstants {

        public final static String FIRST_EXPRESSION = "firstExpression";
        public final static String SECOND_EXPRESSION = "secondExpression";

        public final static ConditionExpression andConditionExpression = new AndConditionExpression();
        public final static ConditionExpression orConditionExpression = new OrConditionExpression();
        public final static ConditionExpression betweenConditionExpression = new BetweenConditionExpression();
        public final static ConditionExpression compareConditionExpression = new CompareConditionExpression();
        public final static ConditionExpression containsConditionExpression = new ContainsConditionExpression();
        public final static ConditionExpression notContainsConditionExpression = new NotContainsConditionExpression();
        public final static ConditionExpression likeConditionExpression = new LikeConditionExpression();
    }
}
