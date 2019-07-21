package com.flair.bi.service;

import com.flair.bi.messages.report.GetScheduledReportRequest;
import com.flair.bi.messages.report.ReportServiceGrpc;
import com.flair.bi.messages.report.ScheduleReportResponse;
import com.flair.bi.service.dto.scheduler.AssignReport;
import com.flair.bi.service.dto.scheduler.ReportDTO;
import com.flair.bi.service.dto.scheduler.ReportLineItem;
import com.flair.bi.service.dto.scheduler.Schedule;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationResponseDTO;
import com.flair.bi.service.dto.scheduler.emailsDTO;
import com.flair.bi.websocket.grpc.config.ManagedChannelFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import static java.util.stream.Collectors.toList;

@Service
@Slf4j
@Profile("!test")
public class NotificationsGrpcService implements INotificationsGrpcService {

    private final ManagedChannelFactory managedChannelFactory;

    @Autowired
    public NotificationsGrpcService(@Qualifier("notificationsChannelFactory") ManagedChannelFactory managedChannelFactory) {
        this.managedChannelFactory = managedChannelFactory;
    }

    private ReportServiceGrpc.ReportServiceBlockingStub getReportStub() {
        return ReportServiceGrpc.newBlockingStub(managedChannelFactory.getInstance());
    }

    @Override
    public SchedulerNotificationResponseDTO getSchedulerReport(String visualizationId) {
        ScheduleReportResponse response = getReportStub().getScheduledReport(
                GetScheduledReportRequest.newBuilder()
                        .setVisualizationId(visualizationId)
                        .build()
        );
        return toDto(response);
    }

    private SchedulerNotificationResponseDTO toDto(ScheduleReportResponse response) {
        SchedulerNotificationResponseDTO responseDTO = new SchedulerNotificationResponseDTO();
        ReportDTO report = new ReportDTO();
        report.setDashboard_name(response.getReport().getReport().getDashboardName());
        report.setBuild_url(response.getReport().getReport().getBuildUrl());
        report.setMail_body(response.getReport().getReport().getMailBody());
        report.setReport_name(response.getReport().getReport().getReportName());
        report.setShare_link(response.getReport().getReport().getShareLink());
        report.setSubject(response.getReport().getReport().getSubject());
        report.setTitle_name(response.getReport().getReport().getTitleName());
        report.setUserid(response.getReport().getReport().getUserid());
        report.setView_name(response.getReport().getReport().getViewName());
        responseDTO.setReport(report);
        ReportLineItem reportLineItem = new ReportLineItem();
        reportLineItem.setDimension(response.getReport().getReportLineItem().getDimensionList().toArray(new String[]{}));
        reportLineItem.setMeasure(response.getReport().getReportLineItem().getMeasureList().toArray(new String[]{}));
        reportLineItem.setVisualization(response.getReport().getReportLineItem().getVisualization());
        reportLineItem.setVisualizationid(response.getReport().getReportLineItem().getVisualizationid());
        responseDTO.setReport_line_item(reportLineItem);
        responseDTO.setQuery(response.getReport().getQuery());
        AssignReport assignReport = new AssignReport();
        assignReport.setChannel(response.getReport().getAssignReport().getChannel());
        assignReport.setChannel_id(response.getReport().getAssignReport().getChannelId());
        assignReport.setEmail_list(response.getReport().getAssignReport().getEmailListList()
                .stream()
                .map(item -> {
                    emailsDTO emailsDTO = new emailsDTO();
                    emailsDTO.setUser_email(item.getUserEmail());
                    emailsDTO.setUser_name(item.getUserName());
                    return emailsDTO;
                })
                .collect(toList()).toArray(new emailsDTO[]{}));
        assignReport.setSlack_API_Token(response.getReport().getAssignReport().getSlackAPIToken());
        assignReport.setStride_API_Token(response.getReport().getAssignReport().getStrideAPIToken());
        assignReport.setStride_cloud_id(response.getReport().getAssignReport().getStrideCloudId());
        assignReport.setStride_conversation_id(response.getReport().getAssignReport().getStrideConversationId());
        responseDTO.setAssign_report(assignReport);
        Schedule schedule = new Schedule();
        schedule.setCron_exp(response.getReport().getSchedule().getCronExp());
        schedule.setEnd_date(response.getReport().getSchedule().getEndDate());
        schedule.setStart_date(response.getReport().getSchedule().getStartDate());
        schedule.setTimezone(response.getReport().getSchedule().getTimezone());
        responseDTO.setSchedule(schedule);
        return responseDTO;
    }
}
