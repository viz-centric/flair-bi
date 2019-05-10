package com.flair.bi.service.dto.scheduler;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.project.bi.query.dto.ConditionExpressionDTO;

public class ReportLineItem {
	
	private String query_name;
	private String table;
	private String visualization;
	private String dimension[];
	private String measure[];

	public ReportLineItem(){}

	
	public String getQuery_name() {
		return query_name;
	}


	public void setQuery_name(String query_name) {
		this.query_name = query_name;
	}


	public String getTable() {
		return table;
	}


	public void setTable(String table) {
		this.table = table;
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


	@Override
	public String toString() {
		return "ReportLineItem [query_name=" + query_name + ", table=" + table + ", visualization=" + visualization
				+ ", dimension=" + Arrays.toString(dimension) + ", measure=" + Arrays.toString(measure) + "]";
	}
	
}
