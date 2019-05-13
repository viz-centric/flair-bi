package com.flair.bi.service.dto.scheduler;

import com.flair.bi.messages.Query;

public class SchedulerNotificationResponseDTO {

	private ReportDTO report;
	private ReportLineItem report_line_item;
	private AssignReport assign_report;
	private Schedule schedule;
	private String query;
	
	public SchedulerNotificationResponseDTO(){}

	public ReportDTO getReport() {
		return report;
	}

	public void setReport(ReportDTO report) {
		this.report = report;
	}

	public ReportLineItem getReport_line_item() {
		return report_line_item;
	}

	public void setReport_line_item(ReportLineItem report_line_item) {
		this.report_line_item = report_line_item;
	}

	public AssignReport getAssign_report() {
		return assign_report;
	}

	public void setAssign_report(AssignReport assign_report) {
		this.assign_report = assign_report;
	}

	public Schedule getSchedule() {
		return schedule;
	}

	public void setSchedule(Schedule schedule) {
		this.schedule = schedule;
	}
	
	public String getQuery() {
		return query;
	}

	public void setQuery(String query) {
		this.query = query;
	}

	@Override
	public String toString() {
		return "SchedulerNotificationResponseDTO [report=" + report + ", report_line_item=" + report_line_item
				+ ", assign_report=" + assign_report + ", schedule=" + schedule + ", query=" + query + "]";
	}
	
	
}
