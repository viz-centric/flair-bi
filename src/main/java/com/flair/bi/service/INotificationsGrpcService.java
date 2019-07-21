package com.flair.bi.service;

import com.flair.bi.service.dto.scheduler.SchedulerNotificationResponseDTO;

public interface INotificationsGrpcService {

    SchedulerNotificationResponseDTO getSchedulerReport(String visualizationId);

}
