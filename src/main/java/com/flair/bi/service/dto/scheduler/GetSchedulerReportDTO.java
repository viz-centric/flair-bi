package com.flair.bi.service.dto.scheduler;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class GetSchedulerReportDTO {
    private final String message;
    private final SchedulerNotificationDTO report;
}
