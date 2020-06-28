package com.flair.bi.service.dto;

import java.util.List;

import com.flair.bi.domain.visualmetadata.VisualMetadata;

public class VisualizationConfigurationDTO {

	private VisualMetadata visualMetadata;
	private List<VisualizationColorsDTO> VisualizationColors;

	public VisualizationConfigurationDTO() {
	}

	public VisualizationConfigurationDTO(VisualMetadata visualMetadata,
			List<VisualizationColorsDTO> visualizationColors) {
		super();
		this.visualMetadata = visualMetadata;
		VisualizationColors = visualizationColors;
	}

	public List<VisualizationColorsDTO> getVisualizationColors() {
		return VisualizationColors;
	}

	public void setVisualizationColors(List<VisualizationColorsDTO> visualizationColors) {
		VisualizationColors = visualizationColors;
	}

	public VisualMetadata getVisualMetadata() {
		return visualMetadata;
	}

	public void setVisualMetadata(VisualMetadata visualMetadata) {
		this.visualMetadata = visualMetadata;
	}

	@Override
	public String toString() {
		return "VisualizationConfigurationDTO [visualMetadata=" + visualMetadata + ", VisualizationColors="
				+ VisualizationColors + "]";
	}

}
