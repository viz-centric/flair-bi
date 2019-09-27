package com.flair.bi.service;

import com.flair.bi.messages.report.DeleteScheduledReportRequest;
import com.flair.bi.messages.report.Email;
import com.flair.bi.messages.report.ExecuteReportRequest;
import com.flair.bi.messages.report.ExecuteReportResponse;
import com.flair.bi.messages.report.GetScheduleReportLogsRequest;
import com.flair.bi.messages.report.GetScheduleReportLogsResponse;
import com.flair.bi.messages.report.GetScheduledReportRequest;
import com.flair.bi.messages.report.RepUserCountReq;
import com.flair.bi.messages.report.RepUserCountResp;
import com.flair.bi.messages.report.RepUserReq;
import com.flair.bi.messages.report.RepUserResp;
import com.flair.bi.messages.report.Report;
import com.flair.bi.messages.report.ReportLog;
import com.flair.bi.messages.report.ReportServiceGrpc;
import com.flair.bi.messages.report.ScheduleReport;
import com.flair.bi.messages.report.ScheduleReportRequest;
import com.flair.bi.messages.report.ScheduleReportResponse;
import com.flair.bi.messages.report.SearchReportsRequest;
import com.flair.bi.messages.report.SearchReportsResponse;
import com.flair.bi.service.dto.scheduler.AssignReport;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportLogsDTO;
import com.flair.bi.service.dto.scheduler.GetSearchReportsDTO;
import com.flair.bi.service.dto.scheduler.ReportDTO;
import com.flair.bi.service.dto.scheduler.ReportLineItem;
import com.flair.bi.service.dto.scheduler.Schedule;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerReportsDTO;
import com.flair.bi.service.dto.scheduler.emailsDTO;
import com.flair.bi.websocket.grpc.config.ManagedChannelFactory;
import io.grpc.ManagedChannel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;

import static com.flair.bi.web.rest.util.GrpcUtils.orEmpty;
import static java.util.stream.Collectors.toList;

@Service
@Slf4j
@Profile("!test")
public class NotificationsGrpcService implements INotificationsGrpcService {

    private final ManagedChannelFactory managedChannelFactory;
    private volatile ReportServiceGrpc.ReportServiceBlockingStub reportServiceBlockingStub;
    private volatile ManagedChannel channel;

    @Autowired
    public NotificationsGrpcService(@Qualifier("notificationsChannelFactory") ManagedChannelFactory managedChannelFactory) {
        this.managedChannelFactory = managedChannelFactory;
    }

    private ReportServiceGrpc.ReportServiceBlockingStub getReportStub() {
        if (reportServiceBlockingStub == null || (channel != null && channel.isShutdown())) {
            synchronized (this) {
                if (reportServiceBlockingStub == null || (channel != null && channel.isShutdown())) {
                    reportServiceBlockingStub = ReportServiceGrpc.newBlockingStub(getChannel());
                }
            }
        }
        return reportServiceBlockingStub;
    }

    private ManagedChannel getChannel() {
        if (channel == null || channel.isShutdown()) {
            synchronized (this) {
                if (channel == null || channel.isShutdown()) {
                    channel = managedChannelFactory.getInstance();
                }
            }
        }
        return channel;
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
    public SchedulerReportsDTO getScheduledReportsByUser(String username, Integer pageSize, Integer page) {
        RepUserResp response = getReportStub().getAllScheduledReportsByUser(RepUserReq.newBuilder()
                .setUsername(username)
                .setPage(page)
                .setPageSize(pageSize)
                .build());
        List<SchedulerNotificationDTO> dtos = response.getReportsList()
                .stream()
                .map(r -> createSchedulerNotificationDTO(r))
                .collect(toList());

        return SchedulerReportsDTO.builder()
                .message(StringUtils.isEmpty(response.getMessage()) ? null : response.getMessage())
                .reports(dtos)
                .build();
    }

    @Override
    public GetSchedulerReportDTO deleteSchedulerReport(String visualizationId) {
        ScheduleReportResponse response = getReportStub().deleteScheduledReport(DeleteScheduledReportRequest.newBuilder()
                .setVisualizationId(visualizationId)
                .build());
        return createSchedulerReportDto(response);
    }

    @Override
    public Integer getScheduledReportsCount(String username) {
        RepUserCountResp response = getReportStub().getAllScheduledReportsCountsByUser(RepUserCountReq.newBuilder()
                .setUsername(username)
                .build());
        return response.getTotalReports();
    }

    @Override
    public void executeImmediateScheduledReport(String visualizationId) {
        ExecuteReportResponse response = getReportStub().executeReport(ExecuteReportRequest.newBuilder()
                .setVisualizationId(visualizationId)
                .build());
    }

    @Override
    public GetSchedulerReportLogsDTO getScheduleReportLogs(String visualizationid, Integer pageSize, Integer page) {
        GetScheduleReportLogsResponse result = getReportStub().getScheduleReportLogs(
                GetScheduleReportLogsRequest.newBuilder()
                        .setVisualizationId(visualizationid)
                        .setPageSize(pageSize)
                        .setPage(page)
                        .build()
        );
        return GetSchedulerReportLogsDTO.builder()
                .message(StringUtils.isEmpty(result.getMessage()) ? null : result.getMessage())
                .schedulerLogs(toLogs(result.getSchedulerLogsList()))
                .build();
    }

    @Override
    public GetSearchReportsDTO searchReports(String username, String reportName, String startDate, String endDate, Integer pageSize, Integer page) {
        SearchReportsResponse result = getReportStub().searchReports(
                SearchReportsRequest.newBuilder()
                        .setUsername(username)
                        .setReportName(reportName)
                        .setStartDate(startDate)
                        .setEndDate(endDate)
                        .setPageSize(pageSize)
                        .setPage(page)
                        .build()
        );
        return GetSearchReportsDTO.builder()
                .totalRecords(result.getTotalRecords())
                .reports(toReportsDto(result.getRecordsList()))
                .build();
    }

    private List<SchedulerNotificationDTO> toReportsDto(List<ScheduleReport> list) {
        return list.stream()
                .map(item -> createSchedulerNotificationDTO(item))
                .collect(toList());
    }

    private List<GetSchedulerReportLogsDTO.SchedulerLog> toLogs(List<ReportLog> list) {
        return list.stream()
                .map(item -> GetSchedulerReportLogsDTO.SchedulerLog.builder()
                        .taskExecuted(item.getTaskExecuted())
                        .taskStatus(item.getTaskStatus())
                        .build())
                .collect(toList());
    }

    private GetSchedulerReportDTO createSchedulerReportDto(ScheduleReportResponse response) {
        return GetSchedulerReportDTO.builder()
                .message(StringUtils.isEmpty(response.getMessage()) ? null : response.getMessage())
                .report(createSchedulerNotificationDTO(response))
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

    private SchedulerNotificationDTO createSchedulerNotificationDTO(ScheduleReportResponse response) {
        if (!response.hasReport()) {
            return null;
        }
        return createSchedulerNotificationDTO(response.getReport());
    }

    private SchedulerNotificationDTO createSchedulerNotificationDTO(ScheduleReport scheduleReport) {
        SchedulerNotificationDTO responseDTO = new SchedulerNotificationDTO();
        ReportDTO report = new ReportDTO();
        report.setDashboard_name(scheduleReport.getReport().getDashboardName());
        report.setBuild_url(scheduleReport.getReport().getBuildUrl());
        report.setMail_body(scheduleReport.getReport().getMailBody());
        report.setReport_name(scheduleReport.getReport().getReportName());
        report.setShare_link(scheduleReport.getReport().getShareLink());
        report.setSubject(scheduleReport.getReport().getSubject());
        report.setTitle_name(scheduleReport.getReport().getTitleName());
        report.setUserid(scheduleReport.getReport().getUserid());
        report.setView_name(scheduleReport.getReport().getViewName());
        report.setThresholdAlert(scheduleReport.getReport().getThresholdAlert());
        responseDTO.setReport(report);
        ReportLineItem reportLineItem = new ReportLineItem();
        reportLineItem.setDimension(scheduleReport.getReportLineItem().getDimensionList().toArray(new String[]{}));
        reportLineItem.setMeasure(scheduleReport.getReportLineItem().getMeasureList().toArray(new String[]{}));
        reportLineItem.setVisualization(scheduleReport.getReportLineItem().getVisualization());
        reportLineItem.setVisualizationid(scheduleReport.getReportLineItem().getVisualizationid());
        responseDTO.setReport_line_item(reportLineItem);
        responseDTO.setQuery(scheduleReport.getQuery());
        AssignReport assignReport = new AssignReport();
        assignReport.setChannel(scheduleReport.getAssignReport().getChannel());
        assignReport.setChannel_id(scheduleReport.getAssignReport().getChannelId());
        assignReport.setEmail_list(scheduleReport.getAssignReport().getEmailListList()
                .stream()
                .map(item -> toEmailDto(item))
                .collect(toList()).toArray(new emailsDTO[]{}));
        assignReport.setSlack_API_Token(scheduleReport.getAssignReport().getSlackAPIToken());
        assignReport.setStride_API_Token(scheduleReport.getAssignReport().getStrideAPIToken());
        assignReport.setStride_cloud_id(scheduleReport.getAssignReport().getStrideCloudId());
        assignReport.setStride_conversation_id(scheduleReport.getAssignReport().getStrideConversationId());
        responseDTO.setAssign_report(assignReport);
        Schedule schedule = new Schedule();
        schedule.setCron_exp(scheduleReport.getSchedule().getCronExp());
        schedule.setEnd_date(scheduleReport.getSchedule().getEndDate());
        schedule.setStart_date(scheduleReport.getSchedule().getStartDate());
        schedule.setTimezone(scheduleReport.getSchedule().getTimezone());
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
