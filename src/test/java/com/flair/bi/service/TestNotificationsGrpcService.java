package com.flair.bi.service;

import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerReportDTO;
import org.junit.Ignore;
import org.springframework.stereotype.Service;

@Ignore
@Service
public class TestNotificationsGrpcService implements INotificationsGrpcService {
    @Override
    public SchedulerReportDTO getSchedulerReport(String visualizationId) {
        return null;
    }

    @Override
    public SchedulerReportDTO createSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO) {
        return null;
    }

    @Override
    public SchedulerReportDTO updateSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO) {
        return null;
    }
}
