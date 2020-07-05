package com.flair.bi.service;

import static com.flair.bi.web.rest.util.QueryGrpcUtils.toProtoConnection;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flair.bi.config.Constants;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.messages.Connection;
import com.flair.bi.messages.Query;
import com.flair.bi.messages.QueryAllResponse;
import com.flair.bi.messages.QueryResponse;
import com.flair.bi.messages.QueryValidationResponse;
import com.flair.bi.messages.RunQueryResponse;
import com.flair.bi.service.dto.RunQueryResponseDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.web.rest.dto.QueryAllRequestDTO;
import com.flair.bi.web.rest.dto.QueryValidationResponseDTO;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import com.flair.bi.web.websocket.FbEngineWebSocketService;
import com.google.common.collect.ImmutableMap;
import com.project.bi.query.dto.ConditionExpressionDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.expression.condition.ConditionExpression;

import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class GrpcQueryService {

    private final DatasourceService datasourceService;
    private final DatasourceConstraintService datasourceConstraintService;
    private final FbEngineWebSocketService fbEngineWebSocketService;
    private final IEngineGrpcService grpcService;
    private final QueryTransformerService queryTransformerService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RunQueryResponseDTO sendRunQuery(QueryDTO queryDTO, Datasource datasource) {
        log.debug("Sending run query request for datasource {} id {}", datasource.getName(),
                datasource.getConnectionName());

        Query query;
        try {
            query = queryTransformerService.toQuery(queryDTO, QueryTransformerParams.builder()
                    .connectionName(datasource.getConnectionName())
                    .sql(datasource.getSql())
                    .sourceName(datasource.getName())
                    .datasourceId(datasource.getId())
                    .build());
        } catch (QueryTransformerException e) {
            log.error("Error validating a query " + queryDTO, e);
            throw new RuntimeException(e);
        }

        RunQueryResponse result;
        try {
            result = grpcService.runQuery(query, queryDTO.isMetaRetrieved());
        } catch (StatusRuntimeException e) {
            log.error("Error running a query {}", queryDTO, e);
            return new RunQueryResponseDTO();
        }

        String resultString = result.getResult();

        log.debug("Sending run query result {}", resultString);

        Map<String, Object> map = Optional.ofNullable(resultString).filter(r -> StringUtils.isNotEmpty(resultString))
                .map(r -> {
                    try {
                        return (Map<String, Object>) objectMapper.readValue(resultString, Map.class);
                    } catch (IOException e) {
                        log.error("Error parsing run query result for query {}", queryDTO, e);
                        return null;
                    }
                }).orElse(null);

        return new RunQueryResponseDTO().setResult(map);
    }

    public QueryValidationResponseDTO sendValidateQuery(Long datasourceId, QueryDTO queryDTO, String visualMetadataId,
            ConditionExpression conditionExpression, String userId) {
        Datasource datasource = getDatasource(datasourceId);

        Optional.ofNullable(conditionExpression).map(x -> {
            ConditionExpressionDTO dto = new ConditionExpressionDTO();
            dto.setSourceType(ConditionExpressionDTO.SourceType.BASE);
            dto.setConditionExpression(x);
            return dto;
        }).ifPresent(queryDTO.getConditionExpressions()::add);

        DatasourceConstraint constraint = datasourceConstraintService.findByUserAndDatasource(userId,
                datasource.getId());
        Optional.ofNullable(constraint).map(DatasourceConstraint::build)
                .ifPresent(queryDTO.getConditionExpressions()::add);

        Query query;
        try {
            query = queryTransformerService.toQuery(queryDTO,
                    QueryTransformerParams.builder()
                            .connectionName(datasource.getConnectionName())
                            .vId(visualMetadataId != null ? visualMetadataId : "")
                            .userId(userId)
                            .sql(datasource.getSql())
                            .sourceName(datasource.getName())
                            .datasourceId(datasource.getId())
                            .build());
        } catch (QueryTransformerException e) {
            log.error("Error validating a query " + queryDTO, e);
            throw new RuntimeException(e);
        }

        log.debug("Invoking gRPC query {}", query);
        QueryValidationResponse queryResponse = grpcService.validate(query);
        log.debug("Received gRPC response {}", queryResponse);

        return new QueryValidationResponseDTO()
                .setValidationResultType(queryResponse.getValidationResult().getType().name())
                .setRawQuery(queryResponse.getRawQuery()).setError(queryResponse.getValidationResult().getData());
    }

    private Datasource getDatasource(Long datasourceId) {
        return Optional.ofNullable(datasourceService.findOne(datasourceId))
                .orElseThrow(() -> new EntityNotFoundException("Datasource with id " + datasourceId + " not found"));
    }

    public void sendGetDataStream(SendGetDataDTO sendGetDataDTO) throws InterruptedException {
        Datasource datasource = getDatasource(sendGetDataDTO.getDatasourcesId());

        DatasourceConstraint constraint = datasourceConstraintService.findByUserAndDatasource(sendGetDataDTO.getUserId(),
                datasource.getId());

        QueryDTO queryDTO = sendGetDataDTO.getQueryDTO();

        Optional.ofNullable(sendGetDataDTO.getVisualMetadata()).map(VisualMetadata::getConditionExpression).map(x -> {
            ConditionExpressionDTO dto = new ConditionExpressionDTO();
            dto.setSourceType(ConditionExpressionDTO.SourceType.BASE);
            dto.setConditionExpression(x);
            return dto;
        }).ifPresent(queryDTO.getConditionExpressions()::add);

        Optional.ofNullable(constraint).map(DatasourceConstraint::build)
                .ifPresent(queryDTO.getConditionExpressions()::add);

        if (sendGetDataDTO.getVisualMetadata() != null && sendGetDataDTO.getType() == null) {
            callGrpcBiDirectionalAndPushInSocket(datasource, sendGetDataDTO.getVisualMetadata().getId(), "vizualization", sendGetDataDTO);
        } else if (sendGetDataDTO.getVisualMetadata() != null && sendGetDataDTO.getType().equals(Constants.SHARED_LINK)) {
            callGrpcBiDirectionalAndPushInSocket(datasource, sendGetDataDTO.getVisualMetadata().getId(), sendGetDataDTO.getType(), sendGetDataDTO);
        } else if (sendGetDataDTO.getVisualMetadata() == null && sendGetDataDTO.getType().equals(Constants.SHARED_LINK_FILTER)) {
            callGrpcBiDirectionalAndPushInSocket(datasource, sendGetDataDTO.getVisualMetadataId(), sendGetDataDTO.getType(), sendGetDataDTO);
        } else {
            callGrpcBiDirectionalAndPushInSocket(datasource, sendGetDataDTO.getVisualMetadataId(), "filters", sendGetDataDTO);
        }
    }

    public void sendQueryAll(String userId, QueryAllRequestDTO requestDTO) {
        fbEngineWebSocketService.pushGRPCMetaDeta(queryAll(userId, requestDTO));
    }

    public QueryResponse queryAll(String userId, QueryAllRequestDTO requestDTO) {
        Query query;
        try {
            query = queryTransformerService.toQuery(requestDTO.getQuery(),
                    QueryTransformerParams.builder()
                            .userId(userId)
                            .sql(requestDTO.getSql())
                            .sourceName(requestDTO.getQuery().getSource())
                            .datasourceId(requestDTO.getSourceId())
                            .build());
        } catch (QueryTransformerException e) {
            log.error("Error validating a query " + requestDTO.getQuery(), e);
            throw new RuntimeException(e);
        }

        Connection connection = toProtoConnection(requestDTO.getConnection());
        QueryAllResponse queryAllResponse = grpcService.queryAll(requestDTO.getConnectionLinkId(), query, connection);

        return QueryResponse.newBuilder().setUserId(queryAllResponse.getUserId())
                .setQueryId(queryAllResponse.getQueryId()).setData(queryAllResponse.getData()).build();

    }

    private void callGrpcBiDirectionalAndPushInSocket(Datasource datasource, String vId,
                                                      String request,
                                                      SendGetDataDTO sendGetDataDTO) throws InterruptedException {
        QueryDTO queryDTO = sendGetDataDTO.getQueryDTO();
        String userId = sendGetDataDTO.getUserId();
        Query query;
        try {
            query = queryTransformerService.toQuery(queryDTO,
                    QueryTransformerParams.builder()
                            .datasourceId(datasource.getId())
                            .sourceName(datasource.getName())
                            .sql(datasource.getSql())
                            .connectionName(datasource.getConnectionName())
                            .validationType(sendGetDataDTO.getValidationType())
                            .vId(vId)
                            .userId(userId)
                            .build());
        } catch (QueryTransformerException e) {
            log.error("Error validating a query " + queryDTO + " error " + e.getValidationMessage());
            fbEngineWebSocketService.pushGRPCMetaDataError(userId, Status.FAILED_PRECONDITION,
                    ImmutableMap.of("group", e.getValidationResult().getGroup().name().toLowerCase(),
                            "error", e.getValidationResult().getErrors().get(0).getError(),
                            "value", e.getValidationResult().getErrors().get(0).getValue()));
            return;
        }

        StreamObserver<QueryResponse> responseObserver = new StreamObserver<QueryResponse>() {
            @Override
            public void onNext(QueryResponse queryResponse) {
                log.debug("Finished trip with===" + queryResponse.toString());
                fbEngineWebSocketService.pushGRPCMetaDeta(queryResponse, request);
            }

            @Override
            public void onError(Throwable t) {
                log.error("callGrpcBiDirectionalAndPushInSocket Failed:", t);
                if (t instanceof StatusRuntimeException) {
                    StatusRuntimeException statusRuntimeException = (StatusRuntimeException) t;
                    fbEngineWebSocketService.pushGRPCMetaDataError(userId, statusRuntimeException.getStatus());
                }
            }

            @Override
            public void onCompleted() {
                log.debug("Finished Request");
            }
        };

        StreamObserver<Query> requestObserver = grpcService.getDataStream(responseObserver);
        try {
            requestObserver.onNext(query);
        } catch (RuntimeException e) {
            // Cancel RPC
            requestObserver.onError(e);
            throw e;
        }
        // Mark the end of requests
        requestObserver.onCompleted();

    }

    public void callGrpcBiDirectionalAndPushInSocket(SchedulerNotificationDTO schedulerNotificationResponseDTO,
            Query query, String request, String userId) throws InterruptedException {
        StreamObserver<QueryResponse> responseObserver = new StreamObserver<QueryResponse>() {
            @Override
            public void onNext(QueryResponse queryResponse) {
                log.debug("Finished trip with===" + queryResponse.toString());
                fbEngineWebSocketService.pushGRPCMetaDeta(schedulerNotificationResponseDTO, queryResponse, request);
            }

            @Override
            public void onError(Throwable t) {
                log.error("callGrpcBiDirectionalAndPushInSocket Failed:", t);
                if (t instanceof StatusRuntimeException) {
                    StatusRuntimeException statusRuntimeException = (StatusRuntimeException) t;
                    fbEngineWebSocketService.pushGRPCMetaDataError(userId, statusRuntimeException.getStatus());
                }
            }

            @Override
            public void onCompleted() {
                log.debug("Finished Request");
            }
        };

        StreamObserver<Query> requestObserver = grpcService.getDataStream(responseObserver);
        try {
            requestObserver.onNext(query);
        } catch (RuntimeException e) {
            // Cancel RPC
            requestObserver.onError(e);
            throw e;
        }
        // Mark the end of requests
        requestObserver.onCompleted();

    }

}
