package com.flair.bi.web.rest.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
public class QueryValidationResponseDTO {
    private String rawQuery;
    private String validationResultType;
    private Object error;
}
