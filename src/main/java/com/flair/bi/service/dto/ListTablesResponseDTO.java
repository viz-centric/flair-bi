package com.flair.bi.service.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
public class ListTablesResponseDTO {
    private List<String> tableNames;
}
