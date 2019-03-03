package com.flair.bi.service.dto;

import java.sql.Timestamp;

public class ReleasesAlertsDTO {
	
	private String releaseType;
	private String releaseComments;
	private String releaseName;
	private Timestamp lastModifiedDate;
	
	public ReleasesAlertsDTO(){}
	
	
	
	
	public ReleasesAlertsDTO(String releaseType, String releaseComments, String releaseName,
			Timestamp lastModifiedDate) {
		super();
		this.releaseType = releaseType;
		this.releaseComments = releaseComments;
		this.releaseName = releaseName;
		this.lastModifiedDate = lastModifiedDate;
	}




	public String getReleaseType() {
		return releaseType;
	}
	public void setReleaseType(String releaseType) {
		this.releaseType = releaseType;
	}
	public String getReleaseComments() {
		return releaseComments;
	}
	public void setReleaseComments(String releaseComments) {
		this.releaseComments = releaseComments;
	}
	public String getReleaseName() {
		return releaseName;
	}
	public void setReleaseName(String releaseName) {
		this.releaseName = releaseName;
	}
	public Timestamp getLastModifiedDate() {
		return lastModifiedDate;
	}
	public void setLastModifiedDate(Timestamp lastModifiedDate) {
		this.lastModifiedDate = lastModifiedDate;
	}
	
	
	

}
