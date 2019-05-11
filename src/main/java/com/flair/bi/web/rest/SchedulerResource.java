package com.flair.bi.web.rest;

import java.io.File;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.apache.commons.io.FileUtils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity.BodyBuilder;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

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
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.scheduler.AuthAIDTO;
import com.flair.bi.service.dto.scheduler.ReportLineItem;
import com.flair.bi.service.dto.scheduler.SchedulerDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationResponseDTO;
import com.flair.bi.service.dto.scheduler.SchedulerResponse;
import com.flair.bi.service.dto.scheduler.emailsDTO;
import com.flair.bi.view.VisualMetadataService;
import com.flair.bi.web.rest.util.QueryGrpcUtils;
import com.flair.bi.web.rest.vm.ManagedUserVM;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.util.JsonFormat;
import com.project.bi.query.dto.ConditionExpressionDTO;
import com.project.bi.query.dto.QueryDTO;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SchedulerResource {

	@Value("${flair-ai-api.username}")
	private String userName;

	@Value("${flair-ai-api.password}")
	private String password;

	@Value("${flair-ai-api.schedule-report-url}")
	private String scheduleReportUrl;

	@Value("${flair-ai-api.auth-url}")
	private String authUrl;
	
	@Value("${flair-ai-api.slack_API_Token}")
	private String slack_API_Token;
	
	@Value("${flair-ai-api.channel_id}")
	private String channel_id;
	
	@Value("${flair-ai-api.stride_API_Token}")
	private String stride_API_Token;
	
	@Value("${flair-ai-api.stride_cloud_id}")
	private String stride_cloud_id;
	
	@Value("${flair-ai-api.stride_conversation_id}")
	private String stride_conversation_id;
	
	@Value("${flair-ai-api.mail_body}")
	private String mail_body;

	private final UserService userService;
	
	private final DatasourceConstraintService datasourceConstraintService;
	
	private final VisualMetadataService visualMetadataService;
	
	private final DatasourceService datasourceService;
	

	private final Logger log = LoggerFactory.getLogger(SchedulerResource.class);


	@PostMapping("/schedule")
	@Timed
	public ResponseEntity<SchedulerResponse> scheduleReport(@Valid @RequestBody SchedulerDTO schedulerDTO)
			throws Exception {
		RestTemplate restTemplate = new RestTemplate();
		VisualMetadata visualMetadata = visualMetadataService.findOne(schedulerDTO.getReport_line_item().getVisualizationid());
		Datasource datasource =datasourceService.findOne(schedulerDTO.getDatasourceid());
		log.debug("setChannelCredentials(schedulerDTO)===" + schedulerDTO);
		schedulerDTO.getAssign_report().setEmail_list(getEmailList(SecurityUtils.getCurrentUserLogin()));
		schedulerDTO.getReport().setUserid(SecurityUtils.getCurrentUserLogin());
		schedulerDTO.getReport().setMail_body(mail_body);
		schedulerDTO.getReport().setSubject("Report : " + visualMetadata.getMetadataVisual().getName() + " : " + new Date());
		schedulerDTO.getReport().setConnection_name(datasource.getName());
		schedulerDTO.getReport().setSource_id(datasource.getConnectionName());
		schedulerDTO.getReport().setTitle_name(visualMetadata.getTitleProperties().getTitleText());
		schedulerDTO.getReport_line_item().setVisualization(visualMetadata.getMetadataVisual().getName());
		String query=buildQuery(schedulerDTO.getQueryDTO(),visualMetadata, datasource, schedulerDTO.getReport_line_item(), schedulerDTO.getReport_line_item().getVisualizationid(), schedulerDTO.getReport().getUserid());
		SchedulerNotificationDTO schedulerNotificationDTO= new SchedulerNotificationDTO(schedulerDTO.getReport(),schedulerDTO.getReport_line_item(),schedulerDTO.getAssign_report(),schedulerDTO.getSchedule(),query);
		//UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("http://localhost:8090/api/jobSchedule/");
		UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(scheduleReportUrl);
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
			ResponseEntity<String> responseEntity = restTemplate.exchange(builder.build().toUri(), HttpMethod.POST,
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

        Query query = QueryGrpcUtils.mapToQuery(queryDTO,datasource.getConnectionName(),
            visualizationId != null ? visualizationId : "",
            userId);
        
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

    @GetMapping("/schedule/{pageNo}")
    @Timed
    public ResponseEntity<List<SchedulerNotificationResponseDTO>> getSchedulerReports(@PathVariable int pageNo)
        throws URISyntaxException {
    	RestTemplate restTemplate = new RestTemplate();
    	//let the url be hard code until it is tested
		ResponseEntity<List<SchedulerNotificationResponseDTO>> ResponseEntity =
		restTemplate.exchange("localhost:8090/api/user/{user}/reports/",
		HttpMethod.GET, null, new ParameterizedTypeReference<List<SchedulerNotificationResponseDTO>>() {
		},SecurityUtils.getCurrentUserLogin());
		List<SchedulerNotificationResponseDTO> reports = ResponseEntity.getBody();
		return ResponseEntity.status(ResponseEntity.getStatusCode()).body(reports);
    }

}
