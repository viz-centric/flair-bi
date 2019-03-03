package com.flair.bi.web.rest.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
public class ConnectionPropertiesSchemaDTO {

    private String connectionDetailsClass;

    private String connectionDetailsType;

    private String imagePath;

    private List<ConnectionPropertyDTO> connectionProperties;

}
