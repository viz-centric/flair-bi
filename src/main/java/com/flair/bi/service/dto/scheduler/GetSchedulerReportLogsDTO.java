package com.flair.bi.service.dto.scheduler;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

@Getter
@Builder
@ToString
public class GetSchedulerReportLogsDTO {
    private final Integer totalRecords;
    private final String message;
    private final List<SchedulerLog> schedulerLogs;

    @Getter
    @Builder
    @ToString
    public static class SchedulerLog {
        @JsonProperty("task_status")
        private final String taskStatus;
        @JsonProperty("task_executed")
        private final String taskExecuted;
    }
}
