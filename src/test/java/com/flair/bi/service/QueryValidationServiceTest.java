package com.flair.bi.service;

import com.flair.bi.domain.DateFilterType;
import com.flair.bi.domain.Feature;
import com.flair.bi.service.dto.QueryValidationType;
import com.project.bi.query.dto.ConditionExpressionDTO;
import com.project.bi.query.dto.FieldDTO;
import com.project.bi.query.dto.HavingDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.dto.SortDTO;
import com.project.bi.query.expression.condition.impl.BetweenConditionExpression;
import com.project.bi.query.expression.operations.ScalarOperation;
import org.junit.Before;
import org.junit.Test;
import org.testcontainers.shaded.com.google.common.collect.ImmutableMap;

import static com.flair.bi.service.QueryValidationError.Error.HavingValueInvalid;
import static com.flair.bi.service.QueryValidationError.Error.RequiredConditionFeatureMissing;
import static java.util.Arrays.asList;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class QueryValidationServiceTest {

    private QueryValidationService service;

    @Before
    public void setUp() throws Exception {
        service = new QueryValidationService();
    }

    @Test
    public void validateEmptyQuerySucceeds() {
        QueryDTO query = new QueryDTO();
        QueryValidationResult result = service.validate(query, QueryValidationParams.builder().build());
        assertTrue(result.success());
    }

    @Test
    public void validateQuerySucceeds() {
        QueryDTO query = new QueryDTO();
        query.setFields(asList(new FieldDTO("order", "COUNT", "alias")));
        query.setGroupBy(asList(new FieldDTO("order", "COUNT", "alias")));
        query.setHaving(asList(new HavingDTO(
                new FieldDTO("name", "MAX", "namemax"),
                HavingDTO.ComparatorType.GT,
                new ScalarOperation("190")
        )));
        query.setOrders(asList(new SortDTO(
                new FieldDTO("order"),
                SortDTO.Direction.ASC
        )));
        BetweenConditionExpression conditionExpression = new BetweenConditionExpression();
        conditionExpression.setFeatureName("order_date");
        query.setConditionExpressions(asList(new ConditionExpressionDTO(
                ConditionExpressionDTO.SourceType.FILTER,
                conditionExpression
        )));

        Feature feature = new Feature();
        feature.setName("order_date");
        feature.setDateFilter(DateFilterType.ENABLED);
        ImmutableMap<String, Feature> features = ImmutableMap.of("order_date", feature);

        QueryValidationParams validationParams = QueryValidationParams.builder()
                .validationType(QueryValidationType.REQUIRED_FIELDS)
                .features(features)
                .build();

        QueryValidationResult result = service.validate(query, validationParams);
        assertTrue(result.success());
    }

    @Test
    public void validateInvalidHavingValue() {
        QueryDTO query = new QueryDTO();
        FieldDTO field = new FieldDTO();
        field.setName("TEST");
        query.setHaving(asList(new HavingDTO(field, HavingDTO.ComparatorType.GT, null)));
        QueryValidationResult result = service.validate(query, QueryValidationParams.builder().build());
        assertEquals(QueryValidationResult.Group.HAVING, result.getGroup());
        assertEquals(asList(QueryValidationError.of("", HavingValueInvalid)), result.getErrors());
    }

    @Test
    public void validateInvalidCondition() {
        QueryDTO query = new QueryDTO();
        query.setFields(asList(new FieldDTO("order", "COUNT", "alias")));
        query.setGroupBy(asList(new FieldDTO("order", "COUNT", "alias")));
        query.setHaving(asList(new HavingDTO(
                new FieldDTO("name", "MAX", "namemax"),
                HavingDTO.ComparatorType.GT,
                new ScalarOperation("190")
        )));
        query.setOrders(asList(new SortDTO(
                new FieldDTO("order"),
                SortDTO.Direction.ASC
        )));

        BetweenConditionExpression conditionExpression = new BetweenConditionExpression();
        conditionExpression.setFeatureName("order_date_invalid");
        query.setConditionExpressions(asList(new ConditionExpressionDTO(
                ConditionExpressionDTO.SourceType.FILTER,
                conditionExpression
        )));

        Feature feature = new Feature();
        feature.setName("order_date");
        feature.setDateFilter(DateFilterType.ENABLED);
        ImmutableMap<String, Feature> features = ImmutableMap.of("order_date", feature);

        QueryValidationParams validationParams = QueryValidationParams.builder()
                .validationType(QueryValidationType.REQUIRED_FIELDS)
                .features(features)
                .build();
        QueryValidationResult result = service.validate(query, validationParams);
        assertEquals(QueryValidationResult.Group.CONDITIONS, result.getGroup());
        assertEquals(asList(QueryValidationError.of("order_date", RequiredConditionFeatureMissing)), result.getErrors());


    }
}
