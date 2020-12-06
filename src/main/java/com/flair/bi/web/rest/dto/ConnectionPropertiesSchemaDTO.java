package com.flair.bi.web.rest.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Data
@Accessors(chain = true)
public class ConnectionPropertiesSchemaDTO {

	private String connectionDetailsClass;

	private String connectionDetailsType;

	private String imagePath;

	private List<ConnectionPropertyDTO> connectionProperties;

	private Map<String, String> config = new ConcurrentHashMap<>();

}
