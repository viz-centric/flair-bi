package com.flair.bi.service.dto;

import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.project.bi.query.dto.QueryDTO;
import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * Request body that contains which widget is making request with which queries.
 */
@Data
public class FbiEngineDTO {

	private VisualMetadata visualMetadata;

	@NotNull
	private QueryDTO queryDTO;

	private String vId;

	private String type;

	private QueryActionType actionType;

	private QueryValidationType validationType;

	public String getvId() {
		return vId;
	}

	public void setvId(String vId) {
		this.vId = vId;
	}

}
