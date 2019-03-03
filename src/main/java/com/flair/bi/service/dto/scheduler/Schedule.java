package com.flair.bi.service.dto.scheduler;

public class Schedule {
private String  timezone;
private String start_date;
private String end_date;
private String duration_type;

public Schedule(){}

public String getTimezone() {
	return timezone;
}

public void setTimezone(String timezone) {
	this.timezone = timezone;
}

public String getStart_date() {
	return start_date;
}

public void setStart_date(String start_date) {
	this.start_date = start_date;
}

public String getEnd_date() {
	return end_date;
}

public void setEnd_date(String end_date) {
	this.end_date = end_date;
}

public String getDuration_type() {
	return duration_type;
}

public void setDuration_type(String duration_type) {
	this.duration_type = duration_type;
}

@Override
public String toString() {
	return "Schedule [timezone=" + timezone + ", start_date=" + start_date + ", end_date=" + end_date
			+ ", duration_type=" + duration_type + "]";
}

}
