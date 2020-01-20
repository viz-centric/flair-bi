package com.flair.bi.service.dto.scheduler;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class JiraTicketsDTO {
	private Integer issueID;
	private String projectKey;
	private String status;
	private String createDate;
	private String assignPerson;
	private String priority;
	private String reporter;
	private String summary;
	private String createdBy;
	private String viewTicket;
}
