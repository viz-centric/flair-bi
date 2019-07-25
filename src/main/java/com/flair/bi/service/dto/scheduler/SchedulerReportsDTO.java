package com.flair.bi.service.dto.scheduler;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

@Getter
@Builder
@ToString
public class SchedulerReportsDTO {
    private final String message;
    private final List<SchedulerNotificationDTO> report;
}
