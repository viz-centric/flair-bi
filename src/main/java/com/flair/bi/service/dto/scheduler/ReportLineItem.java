package com.flair.bi.service.dto.scheduler;

import java.util.Arrays;
import java.util.List;

public class ReportLineItem {
	
	private String query_name;
	private String fields[];
	private String group_by[];
	private String order_by[];
	private String where;
	private Integer limit;
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

	public String[] getFields() {
		return fields;
	}

	public void setFields(String[] fields) {
		this.fields = fields;
	}

	public String[] getGroup_by() {
		return group_by;
	}

	public void setGroup_by(String[] group_by) {
		this.group_by = group_by;
	}

	public String[] getOrder_by() {
		return order_by;
	}

	public void setOrder_by(String[] order_by) {
		this.order_by = order_by;
	}

	public String getWhere() {
		return where;
	}

	public void setWhere(String where) {
		this.where = where;
	}

	public Integer getLimit() {
		return limit;
	}

	public void setLimit(Integer limit) {
		this.limit = limit;
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
		return "ReportLineItem [query_name=" + query_name + ", fields=" + Arrays.toString(fields) + ", group_by="
				+ Arrays.toString(group_by) + ", order_by=" + Arrays.toString(order_by) + ", where=" + where
				+ ", limit=" + limit + ", table=" + table + ", visualization=" + visualization + ", dimension="
				+ Arrays.toString(dimension) + ", measure=" + Arrays.toString(measure) + ", getClass()=" + getClass()
				+ ", hashCode()=" + hashCode() + ", toString()=" + super.toString() + "]";
	}
	
}
