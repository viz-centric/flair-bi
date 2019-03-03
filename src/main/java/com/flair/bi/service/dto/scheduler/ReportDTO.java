package com.flair.bi.service.dto.scheduler;

public class ReportDTO {
	
private String connection_name;
private String mail_body;
private String subject;
private String report_name;
private String source_id;
private String title_name;

public ReportDTO(){}

public String getConnection_name() {
	return connection_name;
}

public void setConnection_name(String connection_name) {
	this.connection_name = connection_name;
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

public String getSource_id() {
	return source_id;
}

public void setSource_id(String source_id) {
	this.source_id = source_id;
}

public String getTitle_name() {
	return title_name;
}

public void setTitle_name(String title_name) {
	this.title_name = title_name;
}

@Override
public String toString() {
	return "ReportDTO [connection_name=" + connection_name + ", mail_body=" + mail_body + ", subject=" + subject
			+ ", report_name=" + report_name + ", source_id=" + source_id + ", title_name=" + title_name + "]";
}

}
