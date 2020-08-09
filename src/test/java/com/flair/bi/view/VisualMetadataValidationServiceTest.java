package com.flair.bi.view;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.SchedulerService;
import com.flair.bi.web.rest.dto.QueryValidationResponseDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.expression.condition.impl.LikeConditionExpression;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

@Ignore
@RunWith(MockitoJUnitRunner.class)
public class VisualMetadataValidationServiceTest {

	@Mock
	private GrpcQueryService grpcQueryService;

    @Mock
    private DatasourceService datasourceService;

    @Mock
    private SchedulerService schedulerService;

    @Mock
    private VisualMetadataService visualMetadataService;

    private VisualMetadataValidationService service;

    @Before
    public void setUp() {
        service = new VisualMetadataValidationService(grpcQueryService, datasourceService, schedulerService, visualMetadataService);
    }

	@Test
	public void validate() {
		long datasourceId = 1L;
		QueryDTO queryDTO = new QueryDTO();
		String visualId = "visualId";
		LikeConditionExpression conditionExpression = new LikeConditionExpression();
		String user_id = "user id";
		QueryValidationResponseDTO result = new QueryValidationResponseDTO();
		when(grpcQueryService.sendValidateQuery(datasourceId, queryDTO, visualId, conditionExpression, user_id))
				.thenReturn(result);

		QueryValidationResponseDTO validate = service.validate(datasourceId, queryDTO, visualId, conditionExpression,
				user_id);

		assertEquals(result, validate);
	}
}
