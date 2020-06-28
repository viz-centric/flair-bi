package com.flair.bi.web.rest.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardDTO {

	private Long id;
	private String dashboardName;
	private String category;
	private String description;
	private boolean published;
	private byte[] image;
	private String imageLocation;
	private String imageContentType;

}
