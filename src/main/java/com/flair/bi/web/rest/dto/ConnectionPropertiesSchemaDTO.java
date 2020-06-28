package com.flair.bi.web.rest.dto;

import java.util.List;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class ConnectionPropertiesSchemaDTO {

	private String connectionDetailsClass;

	private String connectionDetailsType;

	private String imagePath;

	private List<ConnectionPropertyDTO> connectionProperties;

}
