package com.flair.bi.service.dto.scheduler;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ConnectionPropertiesDTO {
	private String displayName;
	private String fieldName;
	private Integer order;
	private String fieldType;
	private Boolean required;
}
