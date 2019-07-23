package com.flair.bi.service;

import com.flair.bi.messages.report.DeleteScheduledReportRequest;
import com.flair.bi.messages.report.Email;
import com.flair.bi.messages.report.GetScheduledReportRequest;
import com.flair.bi.messages.report.Report;
import com.flair.bi.messages.report.ReportServiceGrpc;
import com.flair.bi.messages.report.ScheduleReport;
import com.flair.bi.messages.report.ScheduleReportRequest;
import com.flair.bi.messages.report.ScheduleReportResponse;
import com.flair.bi.service.dto.scheduler.AssignReport;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.ReportDTO;
import com.flair.bi.service.dto.scheduler.ReportLineItem;
import com.flair.bi.service.dto.scheduler.Schedule;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.emailsDTO;
import com.flair.bi.websocket.grpc.config.ManagedChannelFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;

import static com.flair.bi.web.rest.util.GrpcUtils.orEmpty;
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
    public GetSchedulerReportDTO getSchedulerReport(String visualizationId) {
        GetScheduledReportRequest request = GetScheduledReportRequest.newBuilder()
                .setVisualizationId(visualizationId)
                .build();
        ScheduleReportResponse response = getReportStub().getScheduledReport(request);
        return createSchedulerReportDto(response);
    }

    @Override
    public GetSchedulerReportDTO createSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO) {
        ScheduleReportResponse response = getReportStub().scheduleReport(ScheduleReportRequest.newBuilder()
                .setReport(toReportProto(schedulerNotificationDTO))
                .build());
        return createSchedulerReportDto(response);
    }

    @Override
    public GetSchedulerReportDTO updateSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO) {
        ScheduleReportResponse response = getReportStub().updateScheduledReport(ScheduleReportRequest.newBuilder()
                .setReport(toReportProto(schedulerNotificationDTO))
                .build());
        return createSchedulerReportDto(response);
    }

    @Override
    public SchedulerReportDTO deleteSchedulerReport(String visualizationId) {
        ScheduleReportResponse response = getReportStub().deleteScheduledReport(DeleteScheduledReportRequest.newBuilder()
                .setVisualizationId(visualizationId)
                .build());
        return createSchedulerReportDto(response);
    }

    private GetSchedulerReportDTO createSchedulerReportDto(ScheduleReportResponse response) {
        return GetSchedulerReportDTO.builder()
                .message(StringUtils.isEmpty(response.getMessage()) ? null : response.getMessage())
                .report(toReportDTO(response))
                .build();
    }

    private ScheduleReport toReportProto(SchedulerNotificationDTO dto) {
        return ScheduleReport.newBuilder()
                .setReport(
                        Report.newBuilder()
                                .setUserid(orEmpty(dto.getReport().getUserid()))
                                .setDashboardName(orEmpty(dto.getReport().getDashboard_name()))
                                .setViewName(orEmpty(dto.getReport().getView_name()))
                                .setShareLink(orEmpty(dto.getReport().getShare_link()))
                                .setBuildUrl(orEmpty(dto.getReport().getBuild_url()))
                                .setMailBody(orEmpty(dto.getReport().getMail_body()))
                                .setSubject(orEmpty(dto.getReport().getSubject()))
                                .setReportName(orEmpty(dto.getReport().getReport_name()))
                                .setTitleName(orEmpty(dto.getReport().getTitle_name()))
                                .setThresholdAlert(dto.getReport().getThresholdAlert())
                                .build()
                )
                .setReportLineItem(
                        com.flair.bi.messages.report.ReportLineItem.newBuilder()
                                .setVisualizationid(orEmpty(dto.getReport_line_item().getVisualizationid()))
                                .addAllDimension(Arrays.asList(dto.getReport_line_item().getDimension()))
                                .addAllMeasure(Arrays.asList(dto.getReport_line_item().getMeasure()))
                                .setVisualization(orEmpty(dto.getReport_line_item().getVisualization()))
                                .build()
                )
                .setAssignReport(
                        com.flair.bi.messages.report.AssignReport.newBuilder()
                                .setChannel(orEmpty(dto.getAssign_report().getChannel()))
                                .setSlackAPIToken(orEmpty(dto.getAssign_report().getSlack_API_Token()))
                                .setChannelId(orEmpty(dto.getAssign_report().getChannel_id()))
                                .setStrideAPIToken(orEmpty(dto.getAssign_report().getStride_API_Token()))
                                .setStrideCloudId(orEmpty(dto.getAssign_report().getStride_cloud_id()))
                                .setStrideConversationId(orEmpty(dto.getAssign_report().getStride_conversation_id()))
                                .addAllEmailList(Arrays.stream(dto.getAssign_report().getEmail_list())
                                        .map(i -> Email.newBuilder()
                                                .setUserEmail(orEmpty(i.getUser_email()))
                                                .setUserName(orEmpty(i.getUser_name()))
                                                .build())
                                        .collect(toList()))
                                .build()
                )
                .setSchedule(
                        com.flair.bi.messages.report.Schedule.newBuilder()
                                .setCronExp(orEmpty(dto.getSchedule().getCron_exp()))
                                .setTimezone(orEmpty(dto.getSchedule().getTimezone()))
                                .setStartDate(orEmpty(dto.getSchedule().getStart_date()))
                                .setEndDate(orEmpty(dto.getSchedule().getEnd_date()))
                                .build()
                )
                .setQuery(dto.getQuery())
                .build();
    }

    private SchedulerNotificationDTO toReportDTO(ScheduleReportResponse response) {
        if (!response.hasReport()) {
            return null;
        }
        SchedulerNotificationDTO responseDTO = new SchedulerNotificationDTO();
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
                .map(item -> toEmailDto(item))
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

    private emailsDTO toEmailDto(Email item) {
        emailsDTO emailsDTO = new emailsDTO();
        emailsDTO.setUser_email(item.getUserEmail());
        emailsDTO.setUser_name(item.getUserName());
        return emailsDTO;
    }
}
