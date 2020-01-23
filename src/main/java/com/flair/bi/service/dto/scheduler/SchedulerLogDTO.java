package com.flair.bi.service.dto.scheduler;

import com.project.bi.query.dto.QueryDTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchedulerLogDTO {
	private final String taskStatus;
	private final String taskExecuted;
	private final Boolean thresholdMet;
	private final Boolean notificationSent;
	private final String channel;;
	private final String schedulerTaskMetaId;
	private final String dashboardName;
	private final String viewName;
	private final String viewData;
	private final String descripition;
	private final String comment;
	private final Boolean isTicketCreated;
	private final Boolean enableTicketCreation;
	private final String viewTicket;
	private final QueryDTO query;
}
