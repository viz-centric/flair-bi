package com.flair.bi.service.dto.scheduler;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

@Getter
@Builder
@ToString
public class GetSearchReportsDTO {
    private final Integer totalRecords;
    private final List<SchedulerNotificationDTO> reports;
}
