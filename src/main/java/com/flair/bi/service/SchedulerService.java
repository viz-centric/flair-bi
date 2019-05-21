package com.flair.bi.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

	public String deleteScheduledReport(String visualizationid) {
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(buildUrl(host, port, scheduledReportParamUrl), HttpMethod.DELETE, null,
					new ParameterizedTypeReference<String>() {
					}, visualizationid);
			JSONObject jsonObject = new JSONObject(responseEntity.getBody().toString());
			return jsonObject.getString("message");
		} catch (Exception e) {
			log.error("error occured while fetching report:" + e.getMessage());
			return "error occured while fetching report:" + e.getMessage();
		}
	}
	
	
	public String buildUrl(String host,String port,String apiUrl) {
		StringBuffer url= new StringBuffer();
		url.append(host).append(":").append(port).append(apiUrl);
		return url.toString();
	}

}
