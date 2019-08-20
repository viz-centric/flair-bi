package com.flair.bi.service;

import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerReportsDTO;

public interface INotificationsGrpcService {

    GetSchedulerReportDTO getSchedulerReport(String visualizationId);

    GetSchedulerReportDTO createSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO);

    GetSchedulerReportDTO updateSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO);

    SchedulerReportsDTO getScheduledReportsByUser(String username, Integer pageSize, Integer page);

    GetSchedulerReportDTO deleteSchedulerReport(String visualizationId);
}
