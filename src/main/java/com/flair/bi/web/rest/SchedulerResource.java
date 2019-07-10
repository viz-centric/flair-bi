package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.config.Constants;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.domain.User;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.messages.Query;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.DatasourceConstraintService;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.QueryTransformerParams;
import com.flair.bi.service.QueryTransformerService;
import com.flair.bi.service.SchedulerService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.scheduler.AuthAIDTO;
import com.flair.bi.service.dto.scheduler.ReportLineItem;
import com.flair.bi.service.dto.scheduler.SchedulerDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationResponseDTO;
import com.flair.bi.service.dto.scheduler.SchedulerResponse;
import com.flair.bi.service.dto.scheduler.emailsDTO;
import com.flair.bi.view.VisualMetadataService;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.util.JsonFormat;
import com.project.bi.query.dto.ConditionExpressionDTO;
import com.project.bi.query.dto.QueryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.validation.Valid;
import java.net.URISyntaxException;
import java.util.Date;
import java.util.List;
import java.util.Optional;

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
	
	@Value("${flair-notifications.mail_body}")
	private String mail_body;

	@Value("${flair-notifications.scheduled-reports-url}")
	private String scheduledReportsUrl;
	
	@Value("${flair-notifications.scheduled-reports-count-url}")
	private String scheduledReportsCountUrl;
	
	@Value("${flair-notifications.scheduled-report-param-url}")
	private String scheduledReportParamUrl;
	
	private final UserService userService;
	
	private final DatasourceConstraintService datasourceConstraintService;
	
	private final VisualMetadataService visualMetadataService;
	
	private final DatasourceService datasourceService;
	
	private final GrpcQueryService grpcQueryService;
	
	private final SchedulerService schedulerService;

	private final QueryTransformerService queryTransformerService;

	@PostMapping("/schedule")
	@Timed
	public ResponseEntity<SchedulerResponse> scheduleReport(@Valid @RequestBody SchedulerDTO schedulerDTO)
			throws Exception {
		RestTemplate restTemplate = new RestTemplate();
		VisualMetadata visualMetadata = visualMetadataService.findOne(schedulerDTO.getReport_line_item().getVisualizationid());
		Datasource datasource =datasourceService.findOne(schedulerDTO.getDatasourceid());
		log.debug("setChannelCredentials(schedulerDTO)===" + schedulerDTO);
		if(!schedulerDTO.getEmailReporter() || !SecurityUtils.iAdmin()) {
			schedulerDTO.getAssign_report().setEmail_list(getEmailList(SecurityUtils.getCurrentUserLogin()));
		}
		schedulerDTO.getReport().setUserid(SecurityUtils.getCurrentUserLogin());
		schedulerDTO.getReport().setSubject("Report : " + visualMetadata.getMetadataVisual().getName() + " : " + new Date());
		schedulerDTO.getReport().setTitle_name(visualMetadata.getTitleProperties().getTitleText());
		schedulerDTO.getReport_line_item().setVisualization(visualMetadata.getMetadataVisual().getName());
		String query=buildQuery(schedulerDTO.getQueryDTO(),visualMetadata, datasource, schedulerDTO.getReport_line_item(), schedulerDTO.getReport_line_item().getVisualizationid(), schedulerDTO.getReport().getUserid());
		SchedulerNotificationDTO schedulerNotificationDTO= new SchedulerNotificationDTO(schedulerDTO.getReport(),schedulerDTO.getReport_line_item(),schedulerDTO.getAssign_report(),schedulerDTO.getSchedule(),query);
		UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(schedulerService.buildUrl(host, port,scheduledReportUrl));
		HttpHeaders headers = new HttpHeaders();
		/* below code is commented until auth api is not built from notification application*/
		//		if (Constants.ai_token == null) {
		//			try {
		//				authFlairAI(restTemplate);
		//			} catch (Exception e) {
		//				log.error("error occured while fetching token=", e.getMessage());
		//				e.printStackTrace();
		//			}
		//		}
		//		headers.set("Authorization", Constants.ai_token);
		headers.setContentType(MediaType.APPLICATION_JSON);
		log.debug("setChannelCredentials(schedulerDTO)===" + setChannelCredentials(schedulerNotificationDTO));
		HttpEntity<SchedulerNotificationDTO> entity = new HttpEntity<SchedulerNotificationDTO>(setChannelCredentials(schedulerNotificationDTO), headers);
		SchedulerResponse schedulerResponse= new SchedulerResponse();
		try {
			ResponseEntity<String> responseEntity = restTemplate.exchange(builder.build().toUri(), schedulerDTO.getPutcall()?HttpMethod.PUT:HttpMethod.POST,
					entity, String.class);
			JSONObject jsonObject = new JSONObject(responseEntity.getBody().toString());
			schedulerResponse.setMessage(jsonObject.getString("message"));
			return ResponseEntity.status(responseEntity.getStatusCode()).body(schedulerResponse);
		} catch (Exception e) {
			log.error("error occured while scheduling report:"+e.getMessage());
			schedulerResponse.setMessage("error occured while accessing end point :"+e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(schedulerResponse);
		}

	}


	private emailsDTO[] getEmailList(String login) {
		Optional<User> optionalUser=userService.getUserWithAuthoritiesByLogin(login);
        User user = null;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        }
    	emailsDTO emailsDTO= new emailsDTO();
    	emailsDTO.setUser_email(user.getEmail());
    	emailsDTO.setUser_name(user.getFirstName()+" "+user.getLastName());
    	emailsDTO emailList[]= {emailsDTO};
		return emailList;
	}
	
	private String buildQuery(QueryDTO queryDTO,VisualMetadata visualMetadata,Datasource datasource,ReportLineItem reportLineItem,String visualizationId,String userId) throws InvalidProtocolBufferException {

		
		queryDTO.setSource(datasource.getName());
        
		DatasourceConstraint constraint = datasourceConstraintService.findByUserAndDatasource(userId,datasource.getId());
		
        Optional.ofNullable(visualMetadata)
        .map(VisualMetadata::getConditionExpression)
        .map(x -> {
            ConditionExpressionDTO dto = new ConditionExpressionDTO();
            dto.setSourceType(ConditionExpressionDTO.SourceType.BASE);
            dto.setConditionExpression(x);
            return dto;
        })
        .ifPresent(queryDTO.getConditionExpressions()::add);

        Optional.ofNullable(constraint)
            .map(DatasourceConstraint::build)
            .ifPresent(queryDTO.getConditionExpressions()::add);

		Query query = queryTransformerService.toQuery(queryDTO, QueryTransformerParams.builder()
				.datasourceId(datasource.getId())
				.connectionName(datasource.getConnectionName())
				.vId(visualizationId != null ? visualizationId : "")
				.userId(userId)
				.build());

        String jsonQuery=JsonFormat.printer().print(query);

        log.debug("jsonQuery=="+jsonQuery);

        return jsonQuery;
	
	}

	private String authFlairAI(RestTemplate restTemplate) throws Exception {
		UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(authUrl);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		AuthAIDTO authAIDTO = new AuthAIDTO(userName, password);
		HttpEntity<AuthAIDTO> entity = new HttpEntity<AuthAIDTO>(authAIDTO, headers);
		ResponseEntity<String> responseEntity = restTemplate.exchange(builder.build().encode().toUri(), HttpMethod.POST,entity, String.class);
		log.info("Result - status (" + responseEntity.getStatusCode() + ") has body: " + responseEntity.hasBody());
		log.info("Response =" + responseEntity.getBody());
		JSONObject jsonObject = new JSONObject(responseEntity.getBody().toString());
		log.info(jsonObject.getString("token"));
		Constants.ai_token = jsonObject.getString("token");
		return jsonObject.getString("token");
	}
	
	private SchedulerNotificationDTO setChannelCredentials(SchedulerNotificationDTO schedulerNotificationDTO){
		if(schedulerNotificationDTO.getAssign_report().getChannel().equals("slack")){
			schedulerNotificationDTO.getAssign_report().setChannel_id(channel_id);
			schedulerNotificationDTO.getAssign_report().setSlack_API_Token(slack_API_Token);
		}else if(schedulerNotificationDTO.getAssign_report().getChannel().equals("stride")){
			schedulerNotificationDTO.getAssign_report().setStride_API_Token(stride_API_Token);
			schedulerNotificationDTO.getAssign_report().setStride_cloud_id(stride_cloud_id);
			schedulerNotificationDTO.getAssign_report().setStride_conversation_id(stride_conversation_id);
		} else{
			
		}
		return schedulerNotificationDTO;
	}

    @GetMapping("/schedule/reports/{pageSize}/{page}")
    @Timed
    public ResponseEntity<List<SchedulerNotificationResponseDTO>> getSchedulerReports(@PathVariable Integer pageSize,@PathVariable Integer page)
        throws URISyntaxException {
    	RestTemplate restTemplate = new RestTemplate();
    try {
		ResponseEntity<List<SchedulerNotificationResponseDTO>> responseEntity =
		restTemplate.exchange(schedulerService.buildUrl(host, port,scheduledReportsUrl),
		HttpMethod.GET, null, new ParameterizedTypeReference<List<SchedulerNotificationResponseDTO>>() {
		},SecurityUtils.getCurrentUserLogin(),pageSize,page);
		return ResponseEntity.status(responseEntity.getStatusCode()).body(responseEntity.getBody());
	} catch (Exception e) {
		log.error("error occured while fetching reports:"+e.getMessage());
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
	}
    }
    
    @GetMapping("/schedule/reports/count")
    @Timed
    public Integer getScheduledReportsCount() throws JSONException {
    	Integer count=0;
    	RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> responseEntity = restTemplate.exchange(schedulerService.buildUrl(host, port,scheduledReportsCountUrl), HttpMethod.GET,null,new ParameterizedTypeReference<String>() {
		}, SecurityUtils.getCurrentUserLogin());
		JSONObject jsonObject = new JSONObject(responseEntity.getBody().toString());
		count=Integer.parseInt(jsonObject.getString("totalReports"));
        return count;
    }
    
    private  void pushToSocket(SchedulerNotificationResponseDTO schedulerNotificationResponseDTO) throws InvalidProtocolBufferException, InterruptedException {
		 Query.Builder builder = Query.newBuilder();
		 JsonFormat.parser().merge(schedulerNotificationResponseDTO.getQuery(), builder);
		 Query query = builder.build();;
		 grpcQueryService.callGrpcBiDirectionalAndPushInSocket(schedulerNotificationResponseDTO,query, "scheduled-report", query.getUserId());
    }
    
	@GetMapping("/schedule/{visualizationid}")
	@Timed
	public ResponseEntity<SchedulerNotificationResponseDTO> getSchedulerReport(@PathVariable String visualizationid)
			throws URISyntaxException {
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<SchedulerNotificationResponseDTO> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(
					schedulerService.buildUrl(host, port,scheduledReportParamUrl), HttpMethod.GET, null,
					new ParameterizedTypeReference<SchedulerNotificationResponseDTO>() {
					}, visualizationid);
			return ResponseEntity.status(responseEntity.getStatusCode()).body(responseEntity.getBody());
		} catch (Exception e) {
			log.error("error occured while fetching report:" + e.getMessage());
			return ResponseEntity.status(responseEntity.getStatusCode()).body(responseEntity.getBody());
		}
	}
	
	@DeleteMapping("/schedule/{visualizationid}")
	@Timed
	public ResponseEntity<SchedulerResponse> deleteSchedulerReport(@PathVariable String visualizationid)
			throws URISyntaxException {
		return schedulerService.deleteScheduledReport(visualizationid);
	}

	@GetMapping("/executeImmediate/{visualizationid}")
	@Timed
	public ResponseEntity<SchedulerResponse> executeImmediate(@PathVariable String visualizationid)
			throws URISyntaxException {
		return schedulerService.executeImmediateScheduledReport(visualizationid);
	}

	@GetMapping("/schedule/report/logs/{visualizationid}/{pageSize}/{page}")
	@Timed
	public ResponseEntity<String> reportLogs(@PathVariable String visualizationid,@PathVariable Integer pageSize,@PathVariable Integer page)
			throws URISyntaxException {
		return schedulerService.scheduleReportLogs(visualizationid, pageSize, page);
	}
	@GetMapping("/schedule/searchReports/")
	@Timed
	public ResponseEntity<String> searchReports(@RequestParam String userName,@RequestParam String reportName,@RequestParam String startDate,@RequestParam String endDate,@RequestParam Integer pageSize,@RequestParam Integer page)
			throws URISyntaxException {
		if (!SecurityUtils.iAdmin()){
			userName=SecurityUtils.getCurrentUserLogin();
		}
		return schedulerService.searchScheduledReport(userName,reportName,startDate,endDate, pageSize, page);
	}
}
