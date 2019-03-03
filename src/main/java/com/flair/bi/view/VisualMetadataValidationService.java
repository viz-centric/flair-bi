package com.flair.bi.view;

import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.web.rest.dto.QueryValidationResponseDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.expression.condition.ConditionExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisualMetadataValidationService {

    private final GrpcQueryService grpcQueryService;

    public QueryValidationResponseDTO validate(Long datasourceId, QueryDTO queryDTO, String visualMetadataId,
                                               ConditionExpression conditionExpression, String userId) {
        log.info("Validating grpc query for connection {} visual metadata {} cond expr {} user {}",
            datasourceId, visualMetadataId, queryDTO.getConditionExpressions(), userId);
        return grpcQueryService.sendValidateQuery(datasourceId, queryDTO, visualMetadataId, conditionExpression, userId);
    }
}
