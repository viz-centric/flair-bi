package com.flair.bi.web.rest;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.QueryTransformerException;
import com.flair.bi.service.SchedulerService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.CountDTO;
import com.flair.bi.service.dto.scheduler.ApiErrorDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportLogDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportLogsDTO;
import com.flair.bi.service.dto.scheduler.GetSearchReportsDTO;
import com.flair.bi.service.dto.scheduler.SchedulerDTO;
import com.flair.bi.service.dto.scheduler.SchedulerLogDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerReportsDTO;
import com.flair.bi.service.dto.scheduler.SchedulerResponse;
import com.flair.bi.view.VisualMetadataService;
import com.google.common.base.Strings;
import io.micrometer.core.annotation.Timed;
import io.swagger.annotations.ApiParam;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.net.URISyntaxException;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SchedulerResource {

	@Value("${flair-notifications.username}")
	private String userName;

	@Value("${flair-notifications.password}")
	private String password;

	@Value("${flair-notifications.host}")
	private String host;

	@Value("${flair-notifications.port}")
	private String port;

	@Value("${flair-notifications.scheduled-report-url}")
	private String scheduledReportUrl;

	@Value("${flair-notifications.auth-url}")
	private String authUrl;

	@Value("${flair-notifications.mail_body}")
	private String mail_body;

	@Value("${flair-notifications.scheduled-reports-url}")
	private String scheduledReportsUrl;

	@Value("${flair-notifications.scheduled-reports-count-url}")
	private String scheduledReportsCountUrl;

	@Value("${flair-notifications.scheduled-report-param-url}")
	private String scheduledReportParamUrl;

	private final VisualMetadataService visualMetadataService;

	private final DatasourceService datasourceService;

	private final SchedulerService schedulerService;
	private final DashboardService dashboardService;
	private final UserService userService;

	@PostMapping("/schedule")
	@Timed
	public ResponseEntity<SchedulerResponse> scheduleReport(@Valid @RequestBody SchedulerDTO schedulerDTO)
			throws Exception {
		log.info("Creating schedule report {}", schedulerDTO);
		VisualMetadata visualMetadata = visualMetadataService
				.findOne(schedulerDTO.getReport_line_item().getVisualizationid());
		Dashboard dashboard = dashboardService.findOne(schedulerDTO.getDashboardId());
		Datasource datasource = datasourceService.findOne(schedulerDTO.getDatasourceid());
		if (!SecurityUtils.iAdmin()) {
			schedulerDTO.getAssign_report().getCommunication_list()
					.setEmail(schedulerService.getEmailList(SecurityUtils.getCurrentUserLogin()));
		}
		schedulerDTO.getReport().setUserid(SecurityUtils.getCurrentUserLogin());
		schedulerDTO.getReport()
				.setSubject("Report : " + visualMetadata.getMetadataVisual().getName() + " : " + new Date());
		schedulerDTO.getReport_line_item().setVisualization(visualMetadata.getMetadataVisual().getName());
		String query;
		try {
			query = schedulerService.buildQuery(schedulerDTO.getQueryDTO(), visualMetadata, datasource, dashboard,
					schedulerDTO.getReport_line_item().getVisualizationid(), schedulerDTO.getReport().getUserid());
		} catch (QueryTransformerException e) {
			log.error("Error validating a query " + schedulerDTO.getQueryDTO(), e);
			SchedulerResponse response = new SchedulerResponse();
			response.setMessage("Validation failed " + e.getValidationMessage());
			return ResponseEntity.badRequest().body(response);
		}
		SchedulerNotificationDTO schedulerNotificationDTO = new SchedulerNotificationDTO(schedulerDTO.getReport(),
				schedulerDTO.getReport_line_item(), schedulerDTO.getAssign_report(), schedulerDTO.getSchedule(), query,
				schedulerDTO.getConstraints());

		schedulerService.setChannelCredentials(schedulerNotificationDTO);
		log.info("Sending schedule report {}", schedulerNotificationDTO);

		GetSchedulerReportDTO schedulerReportDTO;
		if (schedulerDTO.getPutcall()) {
			schedulerReportDTO = schedulerService.updateSchedulerReport(schedulerNotificationDTO);
		} else {
			schedulerReportDTO = schedulerService.createSchedulerReport(schedulerNotificationDTO);
		}

		log.info("Receiving schedule report {}", schedulerReportDTO);

		SchedulerResponse response = new SchedulerResponse();
		response.setMessage(schedulerReportDTO.getMessage());

		return ResponseEntity.ok(response);
	}

	@GetMapping("/schedule/reports/{pageSize}/{page}")
	@Timed
	public ResponseEntity<List<SchedulerNotificationDTO>> getSchedulerReports(@PathVariable Integer pageSize,
			@PathVariable Integer page) throws URISyntaxException {
		SchedulerReportsDTO reports = schedulerService.getScheduledReportsByUser(SecurityUtils.getCurrentUserLogin(),
				pageSize, page);
		return ResponseEntity.ok(reports.getReports());
	}

	@GetMapping("/schedule/reports/count")
	@Timed
	public CountDTO getScheduledReportsCount() {
		Integer count = schedulerService.getScheduledReportsCount(SecurityUtils.getCurrentUserLogin());
		return new CountDTO(new Long(count));
	}

	@GetMapping("/schedule/{visualizationid}")
	@Timed
	public ResponseEntity<GetSchedulerReportDTO> getSchedulerReport(@PathVariable String visualizationid) {
		log.info("Get scheduled report {}", visualizationid);
		GetSchedulerReportDTO responseDTO = schedulerService.getSchedulerReport(visualizationid);

		log.info("Get scheduled report {} finished", visualizationid);
		return ResponseEntity.ok(responseDTO);
	}

	@DeleteMapping("/schedule/{visualizationid}")
	@Timed
	public ResponseEntity<GetSchedulerReportDTO> deleteSchedulerReport(@PathVariable String visualizationid) {
		log.info("Delete scheduled report {}", visualizationid);
		GetSchedulerReportDTO responseDTO = schedulerService.deleteSchedulerReport(visualizationid);

		log.info("Delete scheduled report {} finished {}", visualizationid, responseDTO);
		return ResponseEntity.ok(responseDTO);
	}

	@GetMapping("/executeImmediate/{visualizationid}")
	@Timed
	public ResponseEntity<?> executeImmediate(@PathVariable String visualizationid) {
		log.info("Executing report {}", visualizationid);
		schedulerService.executeImmediateScheduledReport(visualizationid);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/schedule/report/logs/{visualizationid}/{pageSize}/{page}")
	@Timed
	public ResponseEntity<GetSchedulerReportLogsDTO> reportLogs(@PathVariable String visualizationid,
			@PathVariable Integer pageSize, @PathVariable Integer page) {
		log.info("Get report logs for vis {} page size {} page {}", visualizationid, pageSize, page);
		GetSchedulerReportLogsDTO result = schedulerService.scheduleReportLogs(visualizationid, pageSize, page);
		log.info("Get report logs result {}", result);
		if (result.getMessage() != null) {
			return ResponseEntity.unprocessableEntity().build();
		}
		return ResponseEntity.ok(result);
	}

	@GetMapping("/schedule/searchReports/")
	@Timed
	public GetSearchReportsDTO searchReports(@RequestParam(value = "userName") String userName,
			@RequestParam(value = "reportName") String reportName, @RequestParam(value = "startDate") String startDate,
			@RequestParam(value = "endDate") String endDate,
			@RequestParam(value = "thresholdAlert") Boolean thresholdAlert, @RequestParam(value = "dashboardName") String dashboardName,@RequestParam(value = "viewName") String viewName, @ApiParam Pageable pageable) {
		log.info("Search reports username {} report {} start date {} end date {} page size {} page {}", userName,
				reportName, startDate, endDate, pageable.getPageSize(), pageable.getPageNumber());
		if (!SecurityUtils.iAdmin()) {
			userName = SecurityUtils.getCurrentUserLogin();
		}

		String finalUserName = userName;
		if (!Strings.isNullOrEmpty(finalUserName)) {
			userService.getUserByLogin(finalUserName)
					.orElseThrow(() -> new IllegalStateException("Cannot search report for a user " + finalUserName + " that does not belong to current realm"));
		}

		GetSearchReportsDTO result = schedulerService.searchScheduledReport(userName, reportName, startDate, endDate,
				pageable.getPageSize(), pageable.getPageNumber(), thresholdAlert,dashboardName,viewName);
		log.info("Search reports result {}", result);
		return result;
	}

	@GetMapping("/schedule/report/log/{taskLogMetaId}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('DASHBOARDS', 'READ', 'APPLICATION')")
	public ResponseEntity<?> getReportLogByMetaId(@Valid @NotNull @PathVariable Long taskLogMetaId) {
		log.info("Get report log by meta {}", taskLogMetaId);
		GetSchedulerReportLogDTO reportLogDto = schedulerService.getReportLogByMetaId(taskLogMetaId);
		log.info("Get report log by meta {} result {}", taskLogMetaId, reportLogDto);

		if (reportLogDto.getError() != null) {
			return ResponseEntity.unprocessableEntity()
					.body(ApiErrorResponse.builder().error(reportLogDto.getError()).build());
		}
		GetSchedulerTaskResponse result = GetSchedulerTaskResponse.builder().reportLog(reportLogDto.getReportLog())
				.build();
		return ResponseEntity.ok(result);
	}

	@Data
	@Builder
	private static class GetSchedulerTaskResponse {
		private final SchedulerLogDTO reportLog;
	}

	@Data
	@Builder
	private static class ApiErrorResponse {
		private final ApiErrorDTO error;
	}

}
