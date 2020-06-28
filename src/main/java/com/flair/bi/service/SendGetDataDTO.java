package com.flair.bi.service;

import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.service.dto.QueryValidationType;
import com.project.bi.query.dto.QueryDTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SendGetDataDTO {
	private Long datasourcesId;
	private String userId;
	private VisualMetadata visualMetadata;
	private QueryDTO queryDTO;
	private String visualMetadataId;
	private String type;
	private QueryValidationType validationType;
}
