package com.flair.bi.service.dto.scheduler;

import com.project.bi.query.dto.QueryDTO;
import lombok.Getter;
import lombok.Setter;

public class SchedulerDTO {

	private long datasourceid;
	private ReportDTO report;
	private ReportLineItem report_line_item;
	private AssignReport assign_report;
	private Schedule schedule;
	@Getter
	@Setter
	private String constraints;
	private QueryDTO queryDTO;
	private boolean putcall;
	private boolean emailReporter;
	private Long dashboardId;

	public SchedulerDTO() {
	}

	public SchedulerDTO(long datasourceid, ReportDTO report, ReportLineItem report_line_item,
			AssignReport assign_report, Schedule schedule, QueryDTO queryDTO, boolean putcall, boolean emailReporter,
			String constraints) {
		super();
		this.datasourceid = datasourceid;
		this.report = report;
		this.report_line_item = report_line_item;
		this.assign_report = assign_report;
		this.constraints = constraints;
		this.schedule = schedule;
		this.queryDTO = queryDTO;
		this.putcall = putcall;
		this.emailReporter = emailReporter;
	}

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

	public long getDatasourceid() {
		return datasourceid;
	}

	public void setDatasourceid(long datasourceid) {
		this.datasourceid = datasourceid;
	}

	public QueryDTO getQueryDTO() {
		return queryDTO;
	}

	public void setQueryDTO(QueryDTO queryDTO) {
		this.queryDTO = queryDTO;
	}

	public boolean getPutcall() {
		return putcall;
	}

	public void setPutcall(boolean putcall) {
		this.putcall = putcall;
	}

	public boolean getEmailReporter() {
		return emailReporter;
	}

	@Override
	public String toString() {
		return "SchedulerDTO [datasourceid=" + datasourceid + ", report=" + report + ", report_line_item="
				+ report_line_item + ", assign_report=" + assign_report + ", schedule=" + schedule + ", queryDTO="
				+ queryDTO + ", putcall=" + putcall + ", emailReporter=" + emailReporter + ", dashboardId=" + dashboardId + "]";
	}

	public Long getDashboardId() {
		return dashboardId;
	}

	public void setDashboardId(Long dashboardId) {
		this.dashboardId = dashboardId;
	}
}
