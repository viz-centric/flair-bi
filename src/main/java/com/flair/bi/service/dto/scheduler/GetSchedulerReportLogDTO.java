package com.flair.bi.service.dto.scheduler;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class GetSchedulerReportLogDTO {
    private final SchedulerLogDTO reportLog;
    private final ApiErrorDTO error;
}
