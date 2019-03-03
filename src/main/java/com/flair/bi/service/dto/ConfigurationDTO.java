package com.flair.bi.service.dto;

public class ConfigurationDTO {


	private String vizualizationServiceMode;

	private String maxImageSize;
	
	private String maxDataFileSize;
	
	public ConfigurationDTO(){}
	
	public ConfigurationDTO(String maxImageSize) {
		super();
		this.maxImageSize = maxImageSize;
	}
	
	public ConfigurationDTO(String maxImageSize, String maxDataFileSize) {
		super();
		this.maxImageSize = maxImageSize;
		this.maxDataFileSize = maxDataFileSize;
	}
	
	
	public String getVizualizationServiceMode() {
		return vizualizationServiceMode;
	}

	public void setVizualizationServiceMode(String vizualizationServiceMode) {
		this.vizualizationServiceMode = vizualizationServiceMode;
		
	}

	public String getMaxImageSize() {
		return maxImageSize;
	}

	public void setMaxImageSize(String maxImageSize) {
		this.maxImageSize = maxImageSize;
	}

	public String getMaxDataFileSize() {
		return maxDataFileSize;
	}

	public void setMaxDataFileSize(String maxDataFileSize) {
		this.maxDataFileSize = maxDataFileSize;
	}
	
	
}
