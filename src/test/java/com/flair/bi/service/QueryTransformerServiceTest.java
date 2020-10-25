package com.flair.bi.service;

import com.flair.bi.messages.Query;
import com.project.bi.query.dto.FieldDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.dto.SortDTO;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import static java.util.Arrays.asList;
import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@RunWith(MockitoJUnitRunner.class)
public class QueryTransformerServiceTest {

	@Mock
	private FeatureService featureService;

	@Mock
	private QueryValidationService queryValidationService;

	@Mock
	private DatasourceGroupConstraintService datasourceGroupConstraintService;

	private QueryTransformerService service;

	@Before
	public void setUp() throws Exception {
		service = new QueryTransformerService(featureService, queryValidationService, datasourceGroupConstraintService);
	}

	@Test(expected = QueryTransformerException.class)
	public void toQueryValidationFails() throws QueryTransformerException {
		QueryDTO query = new QueryDTO();
		QueryTransformerParams params = QueryTransformerParams.builder().build();

		QueryValidationResult result = QueryValidationResult.builder()
				.errors(asList(QueryValidationError.of("value", QueryValidationError.Error.HavingValueInvalid))).build();
		Mockito.when(queryValidationService.validate(eq(query), any(QueryValidationParams.class))).thenReturn(result);

		service.toQuery(query, params);
	}

	@Test
	public void toQueryValidationSucceeds() throws QueryTransformerException {
		QueryDTO query = new QueryDTO();
		FieldDTO feature = new FieldDTO("feature_name");
		query.setOrders(asList(new SortDTO(feature, SortDTO.Direction.ASC)));
		query.setFields(asList(feature));
		query.setLimit(100L);
		query.setOffset(2L);
		query.setDistinct(true);
		query.setSource("ecommerce");
		QueryTransformerParams params = QueryTransformerParams.builder().userId("123").datasourceId(914403L)
				.connectionName("conn_1").vId("vis_1").build();

		QueryValidationResult result = QueryValidationResult.builder().build();
		Mockito.when(queryValidationService.validate(eq(query), any(QueryValidationParams.class))).thenReturn(result);

		Query resultQuery = service.toQuery(query, params);
		assertEquals("123", resultQuery.getUserId());
	}
}
