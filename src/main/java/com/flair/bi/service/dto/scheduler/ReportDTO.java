package com.flair.bi.service.dto.scheduler;

import lombok.Getter;
import lombok.Setter;

public class ReportDTO {

	private String userid;
	private String mail_body;
	private String subject;
	private String report_name;
	private String title_name;
	private String dashboard_name;
	private String view_name;
	@Getter
	@Setter
	private Long view_id;
	private String share_link;
	private String build_url;
	private boolean thresholdAlert;
	private String createdDate;

	public ReportDTO() {
	}

	public String getMail_body() {
		return mail_body;
	}

	public void setMail_body(String mail_body) {
		this.mail_body = mail_body;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getReport_name() {
		return report_name;
	}

	public void setReport_name(String report_name) {
		this.report_name = report_name;
	}

	public String getTitle_name() {
		return title_name;
	}

	public void setTitle_name(String title_name) {
		this.title_name = title_name;
	}

	public String getUserid() {
		return userid;
	}

	public void setUserid(String userid) {
		this.userid = userid;
	}

	public String getDashboard_name() {
		return dashboard_name;
	}

	public void setDashboard_name(String dashboard_name) {
		this.dashboard_name = dashboard_name;
	}

	public String getView_name() {
		return view_name;
	}

	public void setView_name(String view_name) {
		this.view_name = view_name;
	}

	public String getShare_link() {
		return share_link;
	}

	public void setShare_link(String share_link) {
		this.share_link = share_link;
	}

	public String getBuild_url() {
		return build_url;
	}

	public void setBuild_url(String build_url) {
		this.build_url = build_url;
	}

	public boolean getThresholdAlert() {
		return thresholdAlert;
	}

	public void setThresholdAlert(boolean thresholdAlert) {
		this.thresholdAlert = thresholdAlert;
	}

	public String getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(String createdDate) {
		this.createdDate = createdDate;
	}

	@Override
	public String toString() {
		final StringBuilder sb = new StringBuilder("ReportDTO{");
		sb.append("userid='").append(userid).append('\'');
		sb.append(", mail_body='").append(mail_body).append('\'');
		sb.append(", subject='").append(subject).append('\'');
		sb.append(", report_name='").append(report_name).append('\'');
		sb.append(", title_name='").append(title_name).append('\'');
		sb.append(", dashboard_name='").append(dashboard_name).append('\'');
		sb.append(", view_name='").append(view_name).append('\'');
		sb.append(", view_id=").append(view_id);
		sb.append(", share_link='").append(share_link).append('\'');
		sb.append(", build_url='").append(build_url).append('\'');
		sb.append(", thresholdAlert=").append(thresholdAlert);
		sb.append(", createdDate=").append(createdDate);
		sb.append('}');
		return sb.toString();
	}

}
