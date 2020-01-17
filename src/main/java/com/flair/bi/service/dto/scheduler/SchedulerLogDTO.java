package com.flair.bi.service.dto.scheduler;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.bi.query.dto.QueryDTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchedulerLogDTO {
	@JsonProperty("task_status")
	private final String taskStatus;
	@JsonProperty("task_executed")
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
	private final QueryDTO query;
}
