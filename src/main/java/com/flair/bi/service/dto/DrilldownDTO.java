package com.flair.bi.service.dto;

import lombok.Data;

@Data
public class DrilldownDTO {

    private Long id;

    private Long hierarchyId;

    private FeatureDTO feature;

    private int order;

}
