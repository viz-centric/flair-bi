package com.flair.bi.service;

import com.flair.bi.service.dto.scheduler.SchedulerNotificationResponseDTO;
import org.junit.Ignore;
import org.springframework.stereotype.Service;

@Ignore
@Service
public class TestNotificationsGrpcService implements INotificationsGrpcService {
    @Override
    public SchedulerNotificationResponseDTO getSchedulerReport(String visualizationId) {
        return null;
    }
}
