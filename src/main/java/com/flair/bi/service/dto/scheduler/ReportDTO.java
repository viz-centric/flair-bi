package com.flair.bi.service.dto.scheduler;

public class ReportDTO {

private String userid;
private String mail_body;
private String subject;
private String report_name;
private String title_name;
private String dashboard_name;
private String view_name;
private String share_link;

public ReportDTO(){}

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

@Override
public String toString() {
	return "ReportDTO [userid=" + userid + ", mail_body=" + mail_body + ", subject=" + subject + ", report_name="
			+ report_name + ", title_name=" + title_name + ", dashboard_name=" + dashboard_name + ", view_name="
			+ view_name + ", share_link=" + share_link + "]";
}

}
