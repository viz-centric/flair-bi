package com.flair.bi.web.rest.dto;

import javax.validation.constraints.NotNull;

import com.flair.bi.domain.visualmetadata.VisualMetadata;

import lombok.Data;

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
