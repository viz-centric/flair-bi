package com.flair.bi.service.dto.scheduler;

public class Schedule {
private String  timezone;
private String start_date;
private String end_date;

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

@Override
public String toString() {
	return "Schedule [timezone=" + timezone + ", start_date=" + start_date + ", end_date=" + end_date + "]";
}

}
