package com.flair.bi.service.dto;

import java.util.List;

public class ReleasesAlertsFinalDTO {
	
	private int id;
	private String name;
	private List<ReleasesAlertsDTO> alerts;
	private int count;
	
	public ReleasesAlertsFinalDTO(){}
	
	public ReleasesAlertsFinalDTO(int id, String name, List<ReleasesAlertsDTO> alerts, int count) {
		super();
		this.id = id;
		this.name = name;
		this.alerts = alerts;
		this.count = count;
	}

	public int getId() {
		return id;
	}


	public void setId(int id) {
		this.id = id;
	}


	public String getName() {
		return name;
	}


	public void setName(String name) {
		this.name = name;
	}

	public List<ReleasesAlertsDTO> getAlerts() {
		return alerts;
	}

	public void setAlerts(List<ReleasesAlertsDTO> alerts) {
		this.alerts = alerts;
	}

	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}
	
	

}
