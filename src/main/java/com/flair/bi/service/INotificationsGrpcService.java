package com.flair.bi.service;

import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;

public interface INotificationsGrpcService {

    GetSchedulerReportDTO getSchedulerReport(String visualizationId);

}
