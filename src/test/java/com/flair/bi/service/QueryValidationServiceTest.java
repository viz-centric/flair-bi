package com.flair.bi.service;

import com.project.bi.query.dto.FieldDTO;
import com.project.bi.query.dto.HavingDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.dto.SortDTO;
import org.junit.Before;
import org.junit.Test;

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
        QueryValidationResult result = service.validate(query);
        assertTrue(result.success());
    }

    @Test
    public void validateQuerySucceeds() {
        QueryDTO query = new QueryDTO();
        query.setFields(asList(new FieldDTO("order", "COUNT", "alias")));
        query.setGroupBy(asList(new FieldDTO("order", "COUNT", "alias")));
        query.setHaving(asList(new HavingDTO(
                new FieldDTO("name", "MAX", "namemax"),
                "190",
                HavingDTO.ComparatorType.GT
        )));
        query.setOrders(asList(new SortDTO(
                new FieldDTO("order"),
                SortDTO.Direction.ASC
        )));
        QueryValidationResult result = service.validate(query);
        assertTrue(result.success());
    }

    @Test
    public void validateInvalidFieldAggregation() {
        QueryDTO query = new QueryDTO();
        FieldDTO field = new FieldDTO();
        field.setAggregation("TEST-");
        query.setFields(asList(field));
        QueryValidationResult result = service.validate(query);
        assertEquals(QueryValidationResult.Group.SELECT, result.getGroup());
        assertEquals(asList(QueryValidationError.of("TEST-", "FieldAggregationInvalid")), result.getErrors());
    }

    @Test
    public void validateInvalidFieldName() {
        QueryDTO query = new QueryDTO();
        FieldDTO field = new FieldDTO();
        field.setName("TEST-");
        query.setFields(asList(field));
        QueryValidationResult result = service.validate(query);
        assertEquals(QueryValidationResult.Group.SELECT, result.getGroup());
        assertEquals(asList(QueryValidationError.of("TEST-", "FieldNameInvalid")), result.getErrors());
    }

    @Test
    public void validateInvalidFieldAlias() {
        QueryDTO query = new QueryDTO();
        FieldDTO field = new FieldDTO();
        field.setAlias("TEST-");
        query.setFields(asList(field));
        QueryValidationResult result = service.validate(query);
        assertEquals(QueryValidationResult.Group.SELECT, result.getGroup());
        assertEquals(asList(QueryValidationError.of("TEST-", "FieldAliasInvalid")), result.getErrors());
    }

    @Test
    public void validateInvalidGroupBy() {
        QueryDTO query = new QueryDTO();
        FieldDTO field = new FieldDTO();
        field.setName("TEST-");
        query.setGroupBy(asList(field));
        QueryValidationResult result = service.validate(query);
        assertEquals(QueryValidationResult.Group.GROUP_BY, result.getGroup());
        assertEquals(asList(QueryValidationError.of("TEST-", "FieldNameInvalid")), result.getErrors());
    }

    @Test
    public void validateInvalidHaving() {
        QueryDTO query = new QueryDTO();
        FieldDTO field = new FieldDTO();
        field.setName("TEST-");
        query.setHaving(asList(new HavingDTO(field, "100", HavingDTO.ComparatorType.GT)));
        QueryValidationResult result = service.validate(query);
        assertEquals(QueryValidationResult.Group.HAVING, result.getGroup());
        assertEquals(asList(QueryValidationError.of("TEST-", "FieldNameInvalid")), result.getErrors());
    }

    @Test
    public void validateInvalidHavingValue() {
        QueryDTO query = new QueryDTO();
        FieldDTO field = new FieldDTO();
        field.setName("TEST");
        query.setHaving(asList(new HavingDTO(field, "100-", HavingDTO.ComparatorType.GT)));
        QueryValidationResult result = service.validate(query);
        assertEquals(QueryValidationResult.Group.HAVING, result.getGroup());
        assertEquals(asList(QueryValidationError.of("100-", "HavingValueInvalid")), result.getErrors());
    }

    @Test
    public void validateInvalidOrderBy() {
        QueryDTO query = new QueryDTO();
        FieldDTO field = new FieldDTO();
        field.setName("TEST-");
        query.setOrders(asList(new SortDTO(field, SortDTO.Direction.ASC)));
        QueryValidationResult result = service.validate(query);
        assertEquals(QueryValidationResult.Group.ORDER_BY, result.getGroup());
        assertEquals(asList(QueryValidationError.of("TEST-", "FieldNameInvalid")), result.getErrors());
    }
}
