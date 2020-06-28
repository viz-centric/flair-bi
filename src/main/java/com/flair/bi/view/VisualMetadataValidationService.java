package com.flair.bi.view;

import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.SchedulerService;
import com.flair.bi.web.rest.dto.QueryValidationResponseDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.expression.condition.ConditionExpression;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisualMetadataValidationService {

    private final GrpcQueryService grpcQueryService;
    private final DatasourceService datasourceService;
    private final SchedulerService schedulerService;
    private final VisualMetadataService visualMetadataService;

    public QueryValidationResponseDTO validate(Long datasourceId, QueryDTO queryDTO, String visualMetadataId,
                                               ConditionExpression conditionExpression, String userId) {
        log.info("Validating grpc query for connection {} visual metadata {} cond expr {} user {}",
            datasourceId, visualMetadataId, queryDTO.getConditionExpressions(), userId);
        VisualMetadata visualMetadata = visualMetadataService.findOne(visualMetadataId);
        Datasource datasource = datasourceService.findOne(datasourceId);
        schedulerService.preprocessQuery(queryDTO, visualMetadata, datasource, userId);
        return grpcQueryService.sendValidateQuery(datasourceId, queryDTO, visualMetadataId, conditionExpression, userId);
    }
}
