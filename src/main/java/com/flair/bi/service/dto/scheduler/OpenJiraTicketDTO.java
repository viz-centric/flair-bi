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
public class OpenJiraTicketDTO {
	private String project;
	private Integer webhookID;
	private String channels[];
}
