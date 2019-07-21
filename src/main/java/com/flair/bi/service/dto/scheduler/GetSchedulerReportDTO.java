package com.flair.bi.service.dto.scheduler;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GetSchedulerReportDTO {
    private final String message;
    private final SchedulerNotificationDTO report;
}
