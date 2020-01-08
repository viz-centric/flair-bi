package com.flair.bi.service;

import com.flair.bi.service.dto.scheduler.GetChannelConnectionDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportLogsDTO;
import com.flair.bi.service.dto.scheduler.GetSearchReportsDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerReportsDTO;
import org.junit.Ignore;
import org.springframework.stereotype.Service;

@Ignore
@Service
public class TestNotificationsGrpcService implements INotificationsGrpcService {
    @Override
    public GetSchedulerReportDTO getSchedulerReport(String visualizationId) {
        return null;
    }

    @Override
    public GetSchedulerReportDTO createSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO) {
        return null;
    }

    @Override
    public GetSchedulerReportDTO updateSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO) {
        return null;
    }

    @Override
    public SchedulerReportsDTO getScheduledReportsByUser(String username, Integer pageSize, Integer page) {
        return null;
    }

    @Override
    public GetSchedulerReportDTO deleteSchedulerReport(String visualizationId) {
        return null;
    }

    @Override
    public Integer getScheduledReportsCount(String username) {
        return null;
    }

    @Override
    public void executeImmediateScheduledReport(String visualizationId) {

    }

    @Override
    public GetSchedulerReportLogsDTO getScheduleReportLogs(String visualizationid, Integer pageSize, Integer page) {
        return null;
    }

    @Override
    public GetSearchReportsDTO searchReports(String username, String reportName, String startDate, String endDate, Integer pageSize, Integer page) {
        return null;
    }

	@Override
	public GetChannelConnectionDTO getChannelParameters(String channel) {
		// TODO Auto-generated method stub
		return null;
	}
}
