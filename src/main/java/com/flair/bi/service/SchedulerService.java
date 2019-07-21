package com.flair.bi.service;

import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.domain.User;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.messages.Query;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.ReportLineItem;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.SchedulerResponse;
import com.flair.bi.service.dto.scheduler.emailsDTO;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.util.JsonFormat;
import com.project.bi.query.dto.ConditionExpressionDTO;
import com.project.bi.query.dto.QueryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

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

	public ResponseEntity<SchedulerResponse> deleteScheduledReport(String visualizationid) {
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> responseEntity = null;
		SchedulerResponse schedulerResponse= new SchedulerResponse();
		try {
			responseEntity = restTemplate.exchange(buildUrl(host, port, scheduledReportParamUrl), HttpMethod.DELETE, null,
					new ParameterizedTypeReference<String>() {
					}, visualizationid);
			JSONObject jsonObject = new JSONObject(responseEntity.getBody().toString());
			schedulerResponse.setMessage(jsonObject.getString("message"));
			return ResponseEntity.status(responseEntity.getStatusCode()).body(schedulerResponse);
		} catch (Exception e) {
			log.error("error occured while cancelling scheduled report:"+e.getMessage());
			schedulerResponse.setMessage("error occured while cancelling scheduled report :"+e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(schedulerResponse);
		}
	}
    
    public ResponseEntity<SchedulerResponse> executeImmediateScheduledReport(String visualizationid) {
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> responseEntity = null;
		SchedulerResponse schedulerResponse= new SchedulerResponse();
		try {
			responseEntity = restTemplate.exchange(buildUrl(host, port, executeImmediateUrl), HttpMethod.GET, null,
					new ParameterizedTypeReference<String>() {
					}, visualizationid);
			schedulerResponse.setMessage("Report will be execute now");
			return ResponseEntity.status(responseEntity.getStatusCode()).body(schedulerResponse);
		} catch (Exception e) {
			log.error("error occured while cancelling scheduled report:"+e.getMessage());
			schedulerResponse.setMessage("error occured while cancelling scheduled report :"+e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(schedulerResponse);
		}
	}

	public ResponseEntity<String> scheduleReportLogs(String visualizationid,Integer pageSize, Integer page) {
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> responseEntity = null;
		SchedulerResponse schedulerResponse= new SchedulerResponse();
		try {
			responseEntity = restTemplate.exchange(buildUrl(host, port, scheduleReportLogsUrl), HttpMethod.GET, null,
					String.class, visualizationid, pageSize, page);
			return ResponseEntity.status(responseEntity.getStatusCode()).body(responseEntity.getBody());
		} catch (Exception e) {
			log.error("error occured while getting scheduled report logs:"+e.getMessage());
			JSONObject jsonObject = new JSONObject();
			return ResponseEntity.status(responseEntity.getStatusCode()).body(responseEntity.getBody());
		}
	}
	
	public ResponseEntity<String> searchScheduledReport(String userName,String reportName,String startDate,String endDate,Integer pageSize, Integer page) {
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> responseEntity = null;
		SchedulerResponse schedulerResponse= new SchedulerResponse();
		try {
			responseEntity = restTemplate.exchange(buildUrl(host, port, searchscheduledReportsURL), HttpMethod.GET, null,
					String.class, userName,reportName,startDate, endDate,pageSize, page);
			return ResponseEntity.status(responseEntity.getStatusCode()).body(responseEntity.getBody());
		} catch (Exception e) {
			log.error("error occured while searching reports:"+e.getMessage());
			return ResponseEntity.status(responseEntity.getStatusCode()).body(responseEntity.getBody());
		}
	}
	
	public String buildUrl(String host,String port,String apiUrl) {
		StringBuffer url= new StringBuffer();
		url.append(host).append(":").append(port).append(apiUrl);
		return url.toString();
	}

	public GetSchedulerReportDTO getSchedulerReport(String visualizationId) {
		return notificationsGrpcService.getSchedulerReport(visualizationId);
	}

	public String buildQuery(QueryDTO queryDTO, VisualMetadata visualMetadata, Datasource datasource,
			ReportLineItem reportLineItem, String visualizationId, String userId, boolean thresholdAlert)
			throws InvalidProtocolBufferException {
		queryDTO.setSource(datasource.getName());

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

		Query query = queryTransformerService.toQuery(queryDTO,
				QueryTransformerParams.builder().datasourceId(datasource.getId())
						.connectionName(datasource.getConnectionName())
						.vId(visualizationId != null ? visualizationId : "").userId(userId).build());
		String jsonQuery = JsonFormat.printer().print(query);
//		queries[0] = thresholdAlert ? queryWithoutHaving(query) : jsonQuery;
//		queries[1] = thresholdAlert ? jsonQuery : null;
		log.debug("jsonQuery==" + jsonQuery);
		return jsonQuery;

	}

//	private String queryWithoutHaving(Query query) throws InvalidProtocolBufferException {
//		Query.Builder builder = query.toBuilder();
//		Query querywithoutHaving = builder.clearHaving().build();
//		String jsonQuery = JsonFormat.printer().print(querywithoutHaving);
//		return jsonQuery;
//	}

	public emailsDTO[] getEmailList(String login) {
		Optional<User> optionalUser = userService.getUserWithAuthoritiesByLogin(login);
		User user = null;
		if (optionalUser.isPresent()) {
			user = optionalUser.get();
		}
		emailsDTO emailsDTO = new emailsDTO();
		emailsDTO.setUser_email(user.getEmail());
		emailsDTO.setUser_name(user.getFirstName() + " " + user.getLastName());
		emailsDTO emailList[] = { emailsDTO };
		return emailList;
	}

	public SchedulerNotificationDTO setChannelCredentials(SchedulerNotificationDTO schedulerNotificationDTO) {
		if (schedulerNotificationDTO.getAssign_report().getChannel().equals("slack")) {
			schedulerNotificationDTO.getAssign_report().setChannel_id(channel_id);
			schedulerNotificationDTO.getAssign_report().setSlack_API_Token(slack_API_Token);
		} else if (schedulerNotificationDTO.getAssign_report().getChannel().equals("stride")) {
			schedulerNotificationDTO.getAssign_report().setStride_API_Token(stride_API_Token);
			schedulerNotificationDTO.getAssign_report().setStride_cloud_id(stride_cloud_id);
			schedulerNotificationDTO.getAssign_report().setStride_conversation_id(stride_conversation_id);
		} else {

		}
		return schedulerNotificationDTO;
	}

}
