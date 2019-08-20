package com.flair.bi.service;

import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;

public interface INotificationsGrpcService {

    GetSchedulerReportDTO getSchedulerReport(String visualizationId);

    GetSchedulerReportDTO createSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO);

    GetSchedulerReportDTO updateSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO);
}
