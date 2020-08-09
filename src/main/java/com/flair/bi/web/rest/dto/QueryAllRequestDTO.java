package com.flair.bi.web.rest.dto;

import com.project.bi.query.dto.QueryDTO;

import lombok.Data;

@Data
public class QueryAllRequestDTO {
    private QueryDTO query;
    private String connectionLinkId;
    private String sql;
    private Long sourceId;
    private ConnectionDTO connection;
}
