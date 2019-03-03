package com.flair.bi.web.rest.dto;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class ConnectionPropertyDTO {

    private String displayName;

    private String fieldName;

    private Integer order;

    private String fieldType;

    private String defaultValue;

    private boolean required;

}
