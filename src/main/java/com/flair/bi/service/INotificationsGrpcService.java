package com.flair.bi.service;
import com.flair.bi.service.dto.scheduler.GetChannelConnectionDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportLogsDTO;
import com.flair.bi.service.dto.scheduler.GetSearchReportsDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerReportsDTO;

public interface INotificationsGrpcService {

    GetSchedulerReportDTO getSchedulerReport(String visualizationId);

    GetSchedulerReportDTO createSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO);

    GetSchedulerReportDTO updateSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO);

    SchedulerReportsDTO getScheduledReportsByUser(String username, Integer pageSize, Integer page);

    GetSchedulerReportDTO deleteSchedulerReport(String visualizationId);

    Integer getScheduledReportsCount(String username);

    void executeImmediateScheduledReport(String visualizationId);

    GetSchedulerReportLogsDTO getScheduleReportLogs(String visualizationid, Integer pageSize, Integer page);

    GetSearchReportsDTO searchReports(String username, String reportName, String startDate, String endDate, Integer pageSize, Integer page);
    
    GetChannelConnectionDTO getChannelParameters(String channel);
}
