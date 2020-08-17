package com.flair.bi.service;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.domain.User;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.messages.Query;
import com.flair.bi.service.dto.scheduler.EmailConfigParametersDTO;
import com.flair.bi.service.dto.scheduler.GetChannelConnectionDTO;
import com.flair.bi.service.dto.scheduler.GetJiraTicketResponseDTO;
import com.flair.bi.service.dto.scheduler.GetJiraTicketsDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportLogDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportLogsDTO;
import com.flair.bi.service.dto.scheduler.GetSearchReportsDTO;
import com.flair.bi.service.dto.scheduler.JiraParametersDTO;
import com.flair.bi.service.dto.scheduler.OpenJiraTicketDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerReportsDTO;
import com.flair.bi.service.dto.scheduler.TeamConfigParametersDTO;
import com.flair.bi.service.dto.scheduler.emailsDTO;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.util.JsonFormat;
import com.project.bi.query.dto.ConditionExpressionDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.dto.QuerySource;
import com.project.bi.query.expression.operations.CompositeOperation;
import com.project.bi.query.expression.operations.Operation;
import com.project.bi.query.expression.operations.QueryOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class SchedulerService {

	@Value("${flair-notifications.scheduled-report-param-url}")
	private String scheduledReportParamUrl;

	@Value("${flair-notifications.host}")
	private String host;

	@Value("${flair-notifications.port}")
	private String port;

	@Value("${flair-notifications.scheduled-execute-now-report-param-url}")
	private String executeImmediateUrl;

	@Value("${flair-notifications.scheduled-report-logs-param-url}")
	private String scheduleReportLogsUrl;

	@Value("${flair-notifications.scheduled-search-reports-param-url}")
	private String searchscheduledReportsURL;

	private final INotificationsGrpcService notificationsGrpcService;

	@Value("${flair-notifications.slack_API_Token}")
	private String slack_API_Token;

	@Value("${flair-notifications.channel_id}")
	private String channel_id;

	@Value("${flair-notifications.stride_API_Token}")
	private String stride_API_Token;

	@Value("${flair-notifications.stride_cloud_id}")
	private String stride_cloud_id;

	@Value("${flair-notifications.stride_conversation_id}")
	private String stride_conversation_id;

	private final QueryTransformerService queryTransformerService;

	private final DatasourceConstraintService datasourceConstraintService;

	private final UserService userService;

	public void executeImmediateScheduledReport(String visualizationid) {
		notificationsGrpcService.executeImmediateScheduledReport(visualizationid);
	}

	public GetSchedulerReportLogsDTO scheduleReportLogs(String visualizationid, Integer pageSize, Integer page) {
		return notificationsGrpcService.getScheduleReportLogs(visualizationid, pageSize, page);
	}

	public GetSearchReportsDTO searchScheduledReport(String userName, String reportName, String startDate,
			String endDate, Integer pageSize, Integer page, Boolean thresholdAlert,String dashboardName,String viewName) {
		return notificationsGrpcService.searchReports(userName, reportName, startDate, endDate, pageSize, page,
				thresholdAlert,dashboardName,viewName);
	}

	public String buildUrl(String host, String port, String apiUrl) {
		return host + ":" + port + apiUrl;
	}

	public GetSchedulerReportDTO getSchedulerReport(String visualizationId) {
		return notificationsGrpcService.getSchedulerReport(visualizationId);
	}

	public GetSchedulerReportDTO createSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO) {
		return notificationsGrpcService.createSchedulerReport(schedulerNotificationDTO);
	}

	public GetSchedulerReportDTO updateSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO) {
		return notificationsGrpcService.updateSchedulerReport(schedulerNotificationDTO);
	}

	public GetSchedulerReportDTO deleteSchedulerReport(String visualizationId) {
		return notificationsGrpcService.deleteSchedulerReport(visualizationId);
	}

	public SchedulerReportsDTO getScheduledReportsByUser(String username, Integer pageSize, Integer page) {
		return notificationsGrpcService.getScheduledReportsByUser(username, pageSize, page);
	}

	public Integer getScheduledReportsCount(String username) {
		return notificationsGrpcService.getScheduledReportsCount(username);
	}

	public GetChannelConnectionDTO getChannelParameters(String channel) {
		return notificationsGrpcService.getChannelParameters(channel);
	}

	public String createTeamConfig(TeamConfigParametersDTO teamConfigParametersDTO) {
		return notificationsGrpcService.createTeamConfig(teamConfigParametersDTO);
	}

	public String updateTeamConfig(TeamConfigParametersDTO teamConfigParametersDTO) {
		return notificationsGrpcService.updateTeamConfig(teamConfigParametersDTO);
	}

	public String createEmailConfig(EmailConfigParametersDTO emailConfigParametersDTO) {
		return notificationsGrpcService.createEmailConfig(emailConfigParametersDTO);
	}

	public String updateEmailConfig(EmailConfigParametersDTO emailConfigParametersDTO) {
		return notificationsGrpcService.updateEmailConfig(emailConfigParametersDTO);
	}

	public EmailConfigParametersDTO getEmailConfig(Integer id) {
		return notificationsGrpcService.getEmailConfig(id);
	}

	public List<TeamConfigParametersDTO> getTeamConfig(Integer id) {
		return notificationsGrpcService.getTeamConfig(id);
	}

	public List<String> getTeamNames(Integer id) {
		return notificationsGrpcService.getTeamNames(id);
	}

	public String deleteChannelConfig(Integer id) {
		return notificationsGrpcService.deleteChannelConfig(id);
	}

	public String createJiraConfig(JiraParametersDTO jiraParametersDTO) {
		return notificationsGrpcService.createJiraConfig(jiraParametersDTO);
	}

	public String updateJiraConfig(JiraParametersDTO jiraParametersDTO) {
		return notificationsGrpcService.updateJiraConfig(jiraParametersDTO);
	}

	public JiraParametersDTO getJiraConfig(Integer id) {
		return notificationsGrpcService.getJiraConfig(id);
	}

	public GetJiraTicketResponseDTO createJiraTicket(Integer id) {
		return notificationsGrpcService.createJiraTicket(id);
	}

	public GetJiraTicketsDTO getJiraTickets(String status, Integer page, Integer pageSize) {
		return notificationsGrpcService.getJiraTickets(status, page, pageSize);
	}

	public String disableTicketCreationRequest(Integer schedulerTaskLogId) {
		return notificationsGrpcService.disableTicketCreationRequest(schedulerTaskLogId);
	}

	public String notifyOpenedJiraTicket(OpenJiraTicketDTO openJiraTicketDTO) {
		return notificationsGrpcService.notifyOpenedJiraTicket(openJiraTicketDTO);
	}

	public Boolean isConfigExist(Integer id) {
		return notificationsGrpcService.isConfigExist(id);
	}

	public String buildQuery(QueryDTO queryDTO, VisualMetadata visualMetadata, Datasource datasource,
							 Dashboard dashboard, String visualizationId, String userId)
			throws InvalidProtocolBufferException, QueryTransformerException {
		preprocessQuery(queryDTO, visualMetadata, datasource, userId);

		Query query = queryTransformerService.toQuery(queryDTO,
				QueryTransformerParams.builder()
						.sql(datasource.getSql())
						.datasourceId(datasource.getId())
						.dashboardId(dashboard.getId())
						.sourceName(queryDTO.getSource())
						.connectionName(datasource.getConnectionName())
						.vId(visualizationId != null ? visualizationId : "")
						.userId(userId)
						.build()
		);
		String jsonQuery = JsonFormat.printer().print(query);
		log.debug("jsonQuery==" + jsonQuery);
		return jsonQuery;

	}

	public void preprocessQuery(QueryDTO queryDTO, VisualMetadata visualMetadata, Datasource datasource, String userId) {
		QuerySource querySource = queryTransformerService.composeQuerySource(QueryTransformerParams.builder()
				.sourceName(datasource.getName())
				.sql(datasource.getSql())
				.sourceAlias("A")
				.build());
		queryDTO.setQuerySource(querySource);

		DatasourceConstraint constraint = datasourceConstraintService.findByUserAndDatasource(userId,
				datasource.getId());

		Optional.ofNullable(visualMetadata).map(VisualMetadata::getConditionExpression).map(x -> {
			ConditionExpressionDTO dto = new ConditionExpressionDTO();
			dto.setSourceType(ConditionExpressionDTO.SourceType.BASE);
			dto.setConditionExpression(x);
			return dto;
		}).ifPresent(queryDTO.getConditionExpressions()::add);

		Optional.ofNullable(constraint).map(DatasourceConstraint::build)
				.ifPresent(queryDTO.getConditionExpressions()::add);

		if (queryDTO.getHaving() != null && queryDTO.getHaving().size() > 0) {
			List<Operation> operationList = queryDTO.getHaving().stream()
					.filter(h -> h.getOperation() != null)
					.map(h -> h.getOperation())
					.collect(Collectors.toList());
			processOperations(operationList, datasource, 0);
		}
	}

	private void processOperations(List<Operation> operationList, Datasource datasource, int nestLevel) {
		operationList
				.forEach((op -> {
					if (op instanceof QueryOperation) {
						QueryOperation queryOperation = (QueryOperation) op;
						QuerySource newQuerySource = queryTransformerService.composeQuerySource(QueryTransformerParams.builder()
								.sourceName(datasource.getName())
								.sql(datasource.getSql())
								.sourceAlias(String.valueOf((char) (65 + nestLevel)))
								.build());
						queryOperation.getValue().setQuerySource(newQuerySource);
					} else if (op instanceof CompositeOperation) {
						CompositeOperation compositeOperation = (CompositeOperation) op;
						processOperations(compositeOperation.getOperations(), datasource, nestLevel + 1);
					}
				}));
	}

	public emailsDTO[] getEmailList(String login) {
		Optional<User> optionalUser = userService.getUserWithAuthoritiesByLogin(login);
		return optionalUser.map(user -> {
			emailsDTO emailsDTO = new emailsDTO();
			emailsDTO.setUser_email(user.getEmail());
			emailsDTO.setUser_name(user.getFirstName() + " " + user.getLastName());
			return emailsDTO;
		}).map(emails -> new emailsDTO[] { emails }).orElseGet(() -> new emailsDTO[] { new emailsDTO() });
	}

	public void setChannelCredentials(SchedulerNotificationDTO schedulerNotificationDTO) {
		if (schedulerNotificationDTO.getAssign_report().getChannel().equals("slack")) {
			schedulerNotificationDTO.getAssign_report().setChannel_id(channel_id);
			schedulerNotificationDTO.getAssign_report().setSlack_API_Token(slack_API_Token);
		} else if (schedulerNotificationDTO.getAssign_report().getChannel().equals("stride")) {
			schedulerNotificationDTO.getAssign_report().setStride_API_Token(stride_API_Token);
			schedulerNotificationDTO.getAssign_report().setStride_cloud_id(stride_cloud_id);
			schedulerNotificationDTO.getAssign_report().setStride_conversation_id(stride_conversation_id);
		}
	}

	public GetSchedulerReportLogDTO getReportLogByMetaId(Long taskLogMetaId) {
		return notificationsGrpcService.getReportLogByMetaId(taskLogMetaId);
	}
}
