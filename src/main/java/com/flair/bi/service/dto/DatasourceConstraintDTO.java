package com.flair.bi.service.dto;

import com.flair.bi.domain.User;
import com.flair.bi.domain.constraintdefinition.ConstraintDefinition;
import com.flair.bi.web.rest.dto.DatasourceDTO;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class DatasourceConstraintDTO {

    private Long id;

    @NotNull
    private ConstraintDefinition constraintDefinition;

    @NotNull
    private User user;

    @NotNull
    private DatasourceDTO datasource;

}
