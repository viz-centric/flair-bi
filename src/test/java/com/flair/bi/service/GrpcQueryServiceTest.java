package com.flair.bi.service;

import com.flair.bi.domain.Datasource;
import com.flair.bi.messages.Query;
import com.flair.bi.messages.QueryValidationResponse;
import com.flair.bi.messages.RunQueryResponse;
import com.flair.bi.service.dto.RunQueryResponseDTO;
import com.flair.bi.web.rest.dto.QueryValidationResponseDTO;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import com.flair.bi.web.websocket.FbEngineWebSocketService;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.expression.condition.impl.LikeConditionExpression;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import java.util.ArrayList;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.when;

@Ignore
@RunWith(MockitoJUnitRunner.class)
public class GrpcQueryServiceTest {

    @Mock
    private DatasourceService datasourceService;
    @Mock
    private DatasourceConstraintService datasourceConstraintService;
    @Mock
    private IGrpcService grpcService;
    @Mock
    private FbEngineWebSocketService fbEngineWebSocketService;

    private GrpcQueryService grpcQueryService;

    @Before
    public void setUp() {
        grpcQueryService = new GrpcQueryService(datasourceService, datasourceConstraintService,
                fbEngineWebSocketService, grpcService);
    }

    @Test(expected = EntityNotFoundException.class)
    public void sendValidateQueryThrowsErrorIfDatasourceNotFound() {
        QueryDTO queryDTO = new QueryDTO();
        QueryValidationResponseDTO validateQuery = grpcQueryService.sendValidateQuery(1L, queryDTO, "visualMetadataId",
                new LikeConditionExpression(), "userid");
    }

    @Test
    public void sendValidateQueryWorks() {
        Datasource datasource = new Datasource();
        datasource.setName("datasourcename");
        datasource.setConnectionName("datasourcconnname");
        when(datasourceService.findOne(1L)).thenReturn(datasource);
        when(grpcService.validate(any(Query.class))).thenReturn(QueryValidationResponse.newBuilder()
                .setValidationResult(QueryValidationResponse.ValidationResult.newBuilder()
                        .setType(QueryValidationResponse.ValidationResult.ValidationResultType.INVALID).setData("data")
                        .build())
                .setRawQuery("raw query").setUserId("user id").setQueryId("query id").build());

        QueryDTO queryDTO = new QueryDTO();
        queryDTO.setLimit(10L);
        queryDTO.setDistinct(false);
        queryDTO.setFields(new ArrayList<>());
        queryDTO.setGroupBy(new ArrayList<>());
        queryDTO.setGroupBy(new ArrayList<>());
        QueryValidationResponseDTO validateQuery = grpcQueryService.sendValidateQuery(1L, queryDTO, "visualMetadataId",
                new LikeConditionExpression(), "userid");

        assertEquals(QueryValidationResponse.ValidationResult.ValidationResultType.INVALID.name(),
                validateQuery.getValidationResultType());
        assertEquals("raw query", validateQuery.getRawQuery());
        assertEquals("data", validateQuery.getError());
    }

    @Test
    public void sendValidateQueryWorksWithoutVisualMetadataId() {
        Datasource datasource = new Datasource();
        datasource.setName("datasourcename");
        datasource.setConnectionName("datasourcconnname");
        when(datasourceService.findOne(1L)).thenReturn(datasource);
        when(grpcService.validate(any(Query.class))).thenReturn(QueryValidationResponse.newBuilder()
                .setValidationResult(QueryValidationResponse.ValidationResult.newBuilder()
                        .setType(QueryValidationResponse.ValidationResult.ValidationResultType.INVALID).setData("data")
                        .build())
                .setRawQuery("raw query").setUserId("user id").setQueryId("query id").build());

        QueryDTO queryDTO = new QueryDTO();
        queryDTO.setLimit(10L);
        queryDTO.setDistinct(false);
        queryDTO.setFields(new ArrayList<>());
        queryDTO.setGroupBy(new ArrayList<>());
        queryDTO.setGroupBy(new ArrayList<>());
        QueryValidationResponseDTO validateQuery = grpcQueryService.sendValidateQuery(1L, queryDTO, null,
                new LikeConditionExpression(), "userid");

        assertEquals(QueryValidationResponse.ValidationResult.ValidationResultType.INVALID.name(),
                validateQuery.getValidationResultType());
        assertEquals("raw query", validateQuery.getRawQuery());
        assertEquals("data", validateQuery.getError());
    }

    @Test
    public void testSendRunQuerySucceeds() {
        Datasource datasource = new Datasource();
        datasource.setName("sales");
        datasource.setConnectionName("3423452524535");

        QueryDTO queryDTO = new QueryDTO();
        queryDTO.setLimit(10L);
        queryDTO.setMetaRetrieved(true);
        queryDTO.setDistinct(false);
        queryDTO.setFields(new ArrayList<>());
        queryDTO.setGroupBy(new ArrayList<>());
        queryDTO.setGroupBy(new ArrayList<>());

        when(grpcService.runQuery(any(Query.class), eq(true)))
                .thenReturn(RunQueryResponse.newBuilder().setResult("{\"result\":\"data\"}").build());

        RunQueryResponseDTO result = grpcQueryService.sendRunQuery(queryDTO, datasource);

        assertEquals("data", result.getResult().get("result"));
    }

    @Test
    public void testSendRunQueryFailsIfGrpcException() {
        Datasource datasource = new Datasource();
        datasource.setName("sales");
        datasource.setConnectionName("3423452524535");

        QueryDTO queryDTO = new QueryDTO();
        queryDTO.setLimit(10L);
        queryDTO.setMetaRetrieved(true);
        queryDTO.setDistinct(false);
        queryDTO.setFields(new ArrayList<>());
        queryDTO.setGroupBy(new ArrayList<>());
        queryDTO.setGroupBy(new ArrayList<>());

        when(grpcService.runQuery(any(Query.class), eq(true))).thenThrow(new StatusRuntimeException(Status.NOT_FOUND));

        RunQueryResponseDTO result = grpcQueryService.sendRunQuery(queryDTO, datasource);

        assertNull(result.getResult());
    }
}
