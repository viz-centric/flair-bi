package com.flair.bi.web.rest.dto;

import com.flair.bi.domain.visualmetadata.VisualMetadata;
import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * Data transfer object when saving {@link VisualMetadata}
 */
@Data
public class SaveVisualMetadataDTO {

    @NotNull
    private Long viewId;

    @NotNull
    private VisualMetadata visualMetadata;
}
