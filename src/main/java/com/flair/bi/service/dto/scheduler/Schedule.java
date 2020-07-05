package com.flair.bi.service.dto.scheduler;

public class Schedule {
	private String cron_exp;
	private String timezone;
	private String start_date;
	private String end_date;

	public Schedule() {
	}

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

	public String getCron_exp() {
		return cron_exp;
	}

	public void setCron_exp(String cron_exp) {
		this.cron_exp = cron_exp;
	}

	@Override
	public String toString() {
		return "Schedule [cron_exp=" + cron_exp + ", timezone=" + timezone + ", start_date=" + start_date
				+ ", end_date=" + end_date + "]";
	}

}
