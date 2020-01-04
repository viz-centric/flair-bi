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
    private final QueryDTO query;
}
