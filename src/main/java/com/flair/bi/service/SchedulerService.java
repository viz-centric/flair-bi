package com.flair.bi.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.flair.bi.service.dto.scheduler.SchedulerResponse;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SchedulerService {

	@Value("${flair-notifications.scheduled-report-param-url}")
	private String scheduledReportParamUrl;
	
	@Value("${flair-notifications.host}")
	private String host;

	@Value("${flair-notifications.port}")
	private String port;

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
	
	
	public String buildUrl(String host,String port,String apiUrl) {
		StringBuffer url= new StringBuffer();
		url.append(host).append(":").append(port).append(apiUrl);
		return url.toString();
	}

}
