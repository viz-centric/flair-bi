package com.flair.bi.service;

import static com.project.bi.query.SQLUtil.sanitize;
import static java.util.stream.Collectors.toList;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import com.flair.bi.config.jackson.JacksonUtil;
import com.flair.bi.domain.Feature;
import com.flair.bi.domain.QFeature;
import com.flair.bi.messages.Query;
import com.project.bi.query.dto.FieldDTO;
import com.project.bi.query.dto.HavingDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.dto.QuerySourceDTO;
import com.project.bi.query.expression.condition.CompositeConditionExpression;
import com.project.bi.query.expression.condition.ConditionExpression;
import com.project.bi.query.expression.condition.impl.AndConditionExpression;
import com.project.bi.query.expression.condition.impl.BetweenConditionExpression;
import com.project.bi.query.expression.condition.impl.CompareConditionExpression;
import com.project.bi.query.expression.condition.impl.ContainsConditionExpression;
import com.project.bi.query.expression.condition.impl.LikeConditionExpression;
import com.project.bi.query.expression.condition.impl.NotContainsConditionExpression;
import com.project.bi.query.expression.condition.impl.OrConditionExpression;
import com.project.bi.query.expression.operations.Operation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class QueryTransformerService {

	public static final long MAX_LIMIT = 1000L;
	private final FeatureService featureService;
	private final QueryValidationService queryValidationService;

	public Query toQuery(QueryDTO queryDTO, QueryTransformerParams params) throws QueryTransformerException {
		log.debug("Map to query {} params {}", queryDTO.toString(), params);

		Map<String, Feature> features = Optional.ofNullable(params.getDatasourceId())
				.map(ds -> featureService.getFeatures(QFeature.feature.datasource.id.eq(ds)).stream()
						.collect(Collectors.toMap(item -> item.getName(), item -> item)))
				.orElseGet(() -> new ConcurrentHashMap<>());

		QueryValidationResult validationResult = queryValidationService.validate(queryDTO,
				QueryValidationParams.builder().features(features).validationType(params.getValidationType()).build());
		if (!validationResult.success()) {
			throw new QueryTransformerException("Query validation error", validationResult);
		}

		return toQuery(queryDTO, params.getConnectionName(), params.getVId(), params.getUserId(), features);
	}

	private Query toQuery(QueryDTO queryDTO, String connectionName, String vId, String userId,
			Map<String, Feature> features) {
		List<FieldDTO> fields = transformSelectFields(features, queryDTO.getFields());
		List<FieldDTO> groupBy = transformGroupByFields(features, queryDTO.getGroupBy());

		Query.Builder builder = Query.newBuilder();
		builder.setDistinct(queryDTO.isDistinct()).addAllFields(toProtoFields(fields))
				.addAllGroupBy(toProtoFields(groupBy));

		if (queryDTO.getQuerySource() != null) {
			builder.setQuerySource(toQuerySource(queryDTO.getQuerySource()));
		}

		if (queryDTO.getSource() != null) {
			builder.setSource(queryDTO.getSource());
		}

		if (queryDTO.getLimit() != null) {
			builder.setLimit(Math.min(queryDTO.getLimit(), MAX_LIMIT));
		}

		if (vId != null) {
			builder.setQueryId(vId);
		}

		if (connectionName != null) {
			builder.setSourceId(connectionName);
		}

		if (userId != null) {
			builder.setUserId(userId);
		}

		if (queryDTO.getHaving().size() > 0) {
			builder.addAllHaving(toHaving(features, queryDTO.getHaving()));
		}

		if (queryDTO.getOffset() != null) {
			builder.setOffset(queryDTO.getOffset());
		}

		queryDTO.getOrders()
				.forEach(sortDTO -> builder.addOrders(Query.SortHolder.newBuilder()
						.setDirectionValue(getDirectionValue(sortDTO.getDirection().ordinal()))
						.setFeature(toProtoField(sortDTO.getFeature())).build()));

		queryDTO.getConditionExpressions().forEach(conditionExpressionDTO -> {
			builder.addConditionExpressions(Query.ConditionExpressionHolder.newBuilder()
					.setSourceTypeValue(getFilterType(conditionExpressionDTO.getSourceType().ordinal()))
					.setExpressionTypeValue(getExpressionType(conditionExpressionDTO.getConditionExpression()))
					.setAndOrExpressionType(getAndOrExpressionType(conditionExpressionDTO.getConditionExpression()))
					.setConditionExpression(
							getJsonFromConditionExpression(conditionExpressionDTO.getConditionExpression(), features))
					.build());
		});
		return builder.build();
	}

	private Query.QuerySource toQuerySource(QuerySourceDTO querySource) {
		return Query.QuerySource.newBuilder().setSource(querySource.getSource()).setAlias(querySource.getAlias())
				.build();
	}

	private List<Query.Field> toProtoFields(List<FieldDTO> fields) {
		return fields.stream().map(this::toProtoField).collect(toList());
	}

	private Query.Field toProtoField(FieldDTO field) {
		return Query.Field.newBuilder().setName(StringUtils.isEmpty(field.getName()) ? "" : field.getName())
				.setAggregation(StringUtils.isEmpty(field.getAggregation()) ? "" : field.getAggregation())
				.setAlias(StringUtils.isEmpty(field.getAlias()) ? "" : field.getAlias()).build();
	}

	private List<Query.HavingHolder> toHaving(Map<String, Feature> features, List<HavingDTO> having) {
		return having.stream().map(h -> {
			FieldDTO fieldDTO = transformFieldNoAlias(features, h.getFeature());
			return Query.HavingHolder.newBuilder().setFeature(toProtoField(fieldDTO))
					.setOperation(getJsonFromOperation(h.getOperation()))
					.setComparatorType(Query.HavingHolder.ComparatorType.valueOf(h.getComparatorType().name())).build();
		}).collect(toList());
	}

	private List<FieldDTO> transformSelectFields(Map<String, Feature> features, List<FieldDTO> fields) {
		return fields.stream().map(field -> transformField(features, field)).collect(toList());
	}

	private List<FieldDTO> transformGroupByFields(Map<String, Feature> features, List<FieldDTO> fields) {
		return fields.stream().map(field -> transformFieldNoAlias(features, field)).collect(toList());
	}

	private FieldDTO transformField(Map<String, Feature> features, FieldDTO field) {
		return Optional.ofNullable(features.get(field.getName()))
				.map(item -> new FieldDTO(item.getDefinition(), field.getAggregation(), item.getName())).orElse(field);
	}

	private FieldDTO transformFieldNoAlias(Map<String, Feature> features, FieldDTO field) {
		return Optional.ofNullable(features.get(field.getName()))
				.map(item -> new FieldDTO(item.getDefinition(), field.getAggregation())).orElse(field);
	}

	private String transformFieldNameOrSanitize(Map<String, Feature> features, String field) {
		return Optional.ofNullable(features.get(field)).map(item -> item.getDefinition()).orElse(field);
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
		} else if (conditionExpression instanceof NotContainsConditionExpression) {
			return Query.ConditionExpressionHolder.ExpressionType.NOTCONTAINS_VALUE;
		} else if (conditionExpression instanceof ContainsConditionExpression) {
			return Query.ConditionExpressionHolder.ExpressionType.CONTAINS_VALUE;
		} else if (conditionExpression instanceof LikeConditionExpression) {
			return Query.ConditionExpressionHolder.ExpressionType.LIKE_VALUE;
		}
		return 0;
	}

	private static Query.ConditionExpressionHolder.AndOrExpressionType getAndOrExpressionType(
			ConditionExpression conditionExpression) {
		Query.ConditionExpressionHolder.AndOrExpressionType.Builder builder = Query.ConditionExpressionHolder.AndOrExpressionType
				.newBuilder();
		if (getExpressionType(conditionExpression) < 2) {
			CompositeConditionExpression compositeConditionExpression = (CompositeConditionExpression) conditionExpression;
			builder.setFirstExpressionTypeValue(getExpressionType(compositeConditionExpression.getFirstExpression()))
					.setSecondExpressionTypeValue(
							getExpressionType(compositeConditionExpression.getSecondExpression()));
		}
		return builder.build();
	}

	private String getJsonFromConditionExpression(ConditionExpression conditionExpression,
			Map<String, Feature> features) {
		return JacksonUtil.toString(sanitizeConditionalExpression(conditionExpression, features));
	}

	private String getJsonFromOperation(Operation operation) {
		return JacksonUtil.toString(operation);
	}

	private ConditionExpression sanitizeConditionalExpression(ConditionExpression conditionExpression,
			Map<String, Feature> features) {
		if (conditionExpression instanceof OrConditionExpression) {
			OrConditionExpression orConditionExpression = (OrConditionExpression) conditionExpression;
			orConditionExpression.setFirstExpression(
					sanitizeConditionalExpression(orConditionExpression.getFirstExpression(), features));
			orConditionExpression.setSecondExpression(
					sanitizeConditionalExpression(orConditionExpression.getSecondExpression(), features));
		} else if (conditionExpression instanceof BetweenConditionExpression) {
			BetweenConditionExpression betweenConditionExpression = (BetweenConditionExpression) conditionExpression;
			betweenConditionExpression.setFeatureName(
					transformFieldNameOrSanitize(features, betweenConditionExpression.getFeatureName()));
			betweenConditionExpression.setValue(sanitize(betweenConditionExpression.getValue()));
			betweenConditionExpression.setSecondValue(sanitize(betweenConditionExpression.getSecondValue()));
		} else if (conditionExpression instanceof CompareConditionExpression) {
			CompareConditionExpression compareConditionExpression = (CompareConditionExpression) conditionExpression;
			compareConditionExpression.setFeatureName(
					transformFieldNameOrSanitize(features, compareConditionExpression.getFeatureName()));
			compareConditionExpression.setValue(sanitize(compareConditionExpression.getValue()));
		} else if (conditionExpression instanceof AndConditionExpression) {
			AndConditionExpression andConditionExpression = (AndConditionExpression) conditionExpression;
			andConditionExpression.setSecondExpression(
					sanitizeConditionalExpression(andConditionExpression.getSecondExpression(), features));
			andConditionExpression.setFirstExpression(
					sanitizeConditionalExpression(andConditionExpression.getFirstExpression(), features));
		} else if (conditionExpression instanceof NotContainsConditionExpression) {
			NotContainsConditionExpression notContainsConditionExpression = (NotContainsConditionExpression) conditionExpression;
			notContainsConditionExpression.setFeatureName(
					transformFieldNameOrSanitize(features, notContainsConditionExpression.getFeatureName()));
			notContainsConditionExpression.setValues(sanitizeList(notContainsConditionExpression.getValues()));
		} else if (conditionExpression instanceof ContainsConditionExpression) {
			ContainsConditionExpression containsConditionExpression = (ContainsConditionExpression) conditionExpression;
			containsConditionExpression.setFeatureName(
					transformFieldNameOrSanitize(features, containsConditionExpression.getFeatureName()));
			containsConditionExpression.setValues(sanitizeList(containsConditionExpression.getValues()));
		} else if (conditionExpression instanceof LikeConditionExpression) {
			LikeConditionExpression likeConditionExpression = (LikeConditionExpression) conditionExpression;
			likeConditionExpression.setValue(sanitize(likeConditionExpression.getValue()));
			likeConditionExpression
					.setFeatureName(transformFieldNameOrSanitize(features, likeConditionExpression.getFeatureName()));
		}
		return conditionExpression;
	}

	private static List<String> sanitizeList(List<String> list) {
		return list.stream().map(item -> sanitize(item)).collect(toList());
	}

}
