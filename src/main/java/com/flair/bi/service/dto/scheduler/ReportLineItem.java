package com.flair.bi.service.dto.scheduler;

import java.util.Arrays;

public class ReportLineItem {
	private String visualizationid;
	private String visualization;
	private String dimension[];
	private String measure[];

	public ReportLineItem() {
	}

	public String getVisualization() {
		return visualization;
	}

	public void setVisualization(String visualization) {
		this.visualization = visualization;
	}

	public String[] getDimension() {
		return dimension;
	}

	public void setDimension(String[] dimension) {
		this.dimension = dimension;
	}

	public String[] getMeasure() {
		return measure;
	}

	public void setMeasure(String[] measure) {
		this.measure = measure;
	}

	public String getVisualizationid() {
		return visualizationid;
	}

	public void setVisualizationid(String visualizationid) {
		this.visualizationid = visualizationid;
	}

	@Override
	public String toString() {
		return "ReportLineItem [visualizationid=" + visualizationid + ", visualization=" + visualization
				+ ", dimension=" + Arrays.toString(dimension) + ", measure=" + Arrays.toString(measure) + "]";
	}

}
