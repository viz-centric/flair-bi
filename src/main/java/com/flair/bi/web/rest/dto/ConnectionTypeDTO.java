package com.flair.bi.web.rest.dto;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class ConnectionTypeDTO {

	private Long id;

	private String name;

	private String bundleClass;

	private ConnectionPropertiesSchemaDTO connectionPropertiesSchema;

}
