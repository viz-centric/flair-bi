package com.flair.bi.web.rest.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Map;

@Data
@Accessors(chain = true)
public class ConnectionDTO {
    private Long id;
    private String name;
    private String connectionUsername;
    private String connectionPassword;
    private Long connectionTypeId;
    private String linkId;
    private Map<String, String> details;
    private Map<String, String> connectionParameters;
}
