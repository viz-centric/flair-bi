package com.flair.bi.service.dto;

import java.util.List;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class ListTablesResponseDTO {
	private List<String> tableNames;
}
