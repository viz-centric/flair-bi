package com.flair.bi.service.dto;

import java.util.Map;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class RunQueryResponseDTO {

	private Map<String, Object> result;

}
