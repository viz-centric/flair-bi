package com.flair.bi.web.rest.dto;

import com.project.bi.query.dto.QueryDTO;
import lombok.Data;
import lombok.Value;

@Data
public class QueryAllRequestDTO {
    private QueryDTO query;
    private String connectionLinkId;
    private ConnectionDTO connection;
}
