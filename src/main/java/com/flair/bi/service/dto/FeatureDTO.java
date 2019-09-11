package com.flair.bi.service.dto;

import com.flair.bi.domain.enumeration.FeatureType;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Data
public class FeatureDTO {

    private Long id;

    @NotNull
    @Size(max = 40)
    @Pattern(regexp = "[a-z_0-9]+")
    private String name;

    @NotNull
    @Size(max = 40)
    private String type;

    @NotNull
    private String definition;
    @NotNull
    private FeatureType featureType;

    private Boolean isSelected;

    private Long functionId;

}
