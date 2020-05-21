package com.flair.bi.service.dto.scheduler;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class GetSchedulerReportLogsDTO {
	private final Integer totalRecords;
	private final String message;
	private final List<SchedulerLogDTO> schedulerLogs;
}
