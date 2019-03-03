package com.flair.bi.web.rest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class SaveViewStateDTO {

    @JsonProperty("_id")
    private String id;

    private List<VisualMetadata> visualMetadataSet = new ArrayList<>();
}
