package com.flair.bi.web.rest.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class CreateViewFeatureCriteriaRequest {

    @NotNull
    private Long viewId;

    private List<ViewFeatureData> features;

    @Data
    public static class ViewFeatureData {
        @NotNull
        private String value;
        @NotNull
        private Long featureId;
        private String metadata;
    }
}
