package com.flair.bi.service.dto.scheduler;

public class SchedulerDTO {

	private String userid;
	private String cron_exp;
	private ReportDTO report;
	private ReportLineItem report_line_item;
	private AssignReport assign_report;
	private Schedule schedule;
	
	public SchedulerDTO(){}

	public String getUserid() {
		return userid;
	}

	public void setUserid(String userid) {
		this.userid = userid;
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

	public String getCron_exp() {
		return cron_exp;
	}

	public void setCron_exp(String cron_exp) {
		this.cron_exp = cron_exp;
	}

	@Override
	public String toString() {
		return "SchedulerDTO [userid=" + userid + ", cron_exp=" + cron_exp + ", report=" + report
				+ ", report_line_item=" + report_line_item + ", assign_report=" + assign_report + ", schedule="
				+ schedule + "]";
	}	
	
}
