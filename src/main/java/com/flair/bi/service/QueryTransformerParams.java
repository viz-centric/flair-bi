package com.flair.bi.service;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@Getter
@ToString
public class QueryTransformerParams {
    private String connectionName;
    private String vId;
    private String userId;
    private Long datasourceId;
}
