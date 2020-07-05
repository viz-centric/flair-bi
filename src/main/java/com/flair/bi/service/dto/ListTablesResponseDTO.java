package com.flair.bi.service.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class ListTablesResponseDTO {
    private List<Table> tables;

    @Data
    @AllArgsConstructor
    public static class Table {
        private String name;
        private String sql;
    }
}
