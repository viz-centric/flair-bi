package com.flair.bi.service.dto;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class ConnectionFilterParamsDTO {

	private String linkId;
	private Long connectionType;

}
