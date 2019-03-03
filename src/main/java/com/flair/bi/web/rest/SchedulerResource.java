package com.flair.bi.web.rest;

import java.net.URISyntaxException;
import java.util.Date;

import javax.validation.Valid;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity.BodyBuilder;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.config.Constants;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.dto.scheduler.AuthAIDTO;
import com.flair.bi.service.dto.scheduler.SchedulerDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
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
	
	

	private final Logger log = LoggerFactory.getLogger(SchedulerResource.class);


	@PostMapping("/schedule")
	@Timed
	public ResponseEntity<String> scheduleReport(@Valid @RequestBody SchedulerDTO schedulerDTO)
			throws Exception {
		RestTemplate restTemplate = new RestTemplate();
		schedulerDTO.setUserid(SecurityUtils.getCurrentUserLogin());
		schedulerDTO.getReport_line_item().setQuery_name(SecurityUtils.getCurrentUserLogin() + ":" + schedulerDTO.getReport_line_item().getQuery_name());
		schedulerDTO.getReport().setMail_body(mail_body);
		schedulerDTO.getReport().setSubject("Report : " + schedulerDTO.getReport().getSubject() + " : " + new Date());
		UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(scheduleReportUrl);
		HttpHeaders headers = new HttpHeaders();
		if (Constants.ai_token == null) {
			try {
				authFlairAI(restTemplate);
			} catch (Exception e) {
				log.error("error occured while fetching token=", e.getMessage());
				e.printStackTrace();
			}
		}
		headers.set("Authorization", Constants.ai_token);// add token here
		headers.setContentType(MediaType.APPLICATION_JSON);
		System.out.println("setChannelCredentials(schedulerDTO)===" + setChannelCredentials(schedulerDTO));
		HttpEntity<SchedulerDTO> entity = new HttpEntity<SchedulerDTO>(setChannelCredentials(schedulerDTO), headers);
		// ResponseEntity<String> responseEntity =
		// restTemplate.exchange(builder.build().encode().toUri(),
		// HttpMethod.POST, entity, String.class);
		try {
			ResponseEntity<String> responseEntity = restTemplate.exchange(builder.build().toUri(), HttpMethod.POST,
					entity, String.class);
			JSONObject jsonObject = new JSONObject(responseEntity.getBody().toString());
			if (jsonObject.getString("token").equals("true")) {
				return ResponseEntity.status(HttpStatus.CREATED).body(jsonObject.getString("message"));
			} else if (jsonObject.getString("token").equals("false")) {
				return ResponseEntity.status(HttpStatus.FOUND).body(jsonObject.getString("message"));
			}
		} catch (Exception e) {
			log.error("error occured while scheduling report:"+e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Report is not scheduled " + e.getMessage());
		}

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Report is not scheduled");
		// log.info("Result - status ("+ responseEntity.getStatusCode() + ") has
		// body: " + responseEntity.hasBody());
		// log.info("Response ="+responseEntity.getBody());

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
	
	private SchedulerDTO setChannelCredentials(SchedulerDTO schedulerDTO){
		if(schedulerDTO.getAssign_report().getChannel().equals("slack")){
			schedulerDTO.getAssign_report().setChannel_id(channel_id);
			schedulerDTO.getAssign_report().setSlack_API_Token(slack_API_Token);
		}else if(schedulerDTO.getAssign_report().getChannel().equals("stride")){
			schedulerDTO.getAssign_report().setStride_API_Token(stride_API_Token);
			schedulerDTO.getAssign_report().setStride_cloud_id(stride_cloud_id);
			schedulerDTO.getAssign_report().setStride_conversation_id(stride_conversation_id);
		} else{
			
		}
		
		return schedulerDTO;
		
	}

}
