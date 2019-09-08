package com.flair.bi.service.dto;

import com.flair.bi.domain.FeatureCriteria;
import com.flair.bi.web.rest.dto.DatasourceDTO;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

@Data
public class FeatureBookmarkDTO {

    private Long id;

    @NotNull
    @Size(min = 0, max = 50)
    private String name;

    private Set<FeatureCriteria> featureCriteria = new HashSet<>();

    private UserDTO user;

    @NotNull
    private DatasourceDTO datasource;

    private boolean dateRange;

}
