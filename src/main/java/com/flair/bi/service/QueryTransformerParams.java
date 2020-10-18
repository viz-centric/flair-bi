package com.flair.bi.service;

import com.flair.bi.service.dto.QueryActionType;
import com.flair.bi.service.dto.QueryValidationType;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@Getter
@ToString
public class QueryTransformerParams {
    private final String connectionName;
    private final String sourceName;
    private final String sourceAlias;
    private final String sql;
    private final String vId;
    private final String userId;
    private final Long datasourceId;
    private final Long dashboardId;
    private final QueryActionType action;
    @Builder.Default
    private final QueryValidationType validationType = QueryValidationType.NONE;
}
