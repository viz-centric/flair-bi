package com.flair.bi.service;

import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerReportDTO;

public interface INotificationsGrpcService {

    SchedulerReportDTO getSchedulerReport(String visualizationId);

    SchedulerReportDTO createSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO);

    SchedulerReportDTO updateSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO);
}
