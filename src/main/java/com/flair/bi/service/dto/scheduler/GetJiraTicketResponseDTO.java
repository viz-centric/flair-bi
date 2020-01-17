package com.flair.bi.service.dto.scheduler;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class GetJiraTicketResponseDTO {
	private String message;
	private String jiraTicketLink;
}
