package com.flair.bi.web.rest.dto;

import lombok.Data;
import org.hibernate.validator.constraints.NotEmpty;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class CreateDashboardReleaseDTO {

    private String comment;

    @NotEmpty
    @NotNull
    private List<Long> viewIds;
}
