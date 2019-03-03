package com.flair.bi.web.rest.dto;

import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.expression.condition.ConditionExpression;
import lombok.Data;
import lombok.ToString;

import javax.validation.constraints.NotNull;

@Data
@ToString(exclude = {"queryDTO"})
public class ValidateVisualMetadataDTO {

    @NotNull
    private Long datasourceId;

    private String visualMetadataId;

    private ConditionExpression conditionExpression;

    @NotNull
    private QueryDTO queryDTO;
}
