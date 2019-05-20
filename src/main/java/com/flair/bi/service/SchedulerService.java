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

	@Value("${flair-notifications.scheduled-report-url}")
	private String scheduledReportUrl;

	public String deleteScheduledReport(String visualizationid) {
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> responseEntity = null;
		try {
			responseEntity = restTemplate.exchange(scheduledReportUrl, HttpMethod.DELETE, null,
					new ParameterizedTypeReference<String>() {
					}, visualizationid);
			JSONObject jsonObject = new JSONObject(responseEntity.getBody().toString());
			return jsonObject.getString("message");
		} catch (Exception e) {
			log.error("error occured while fetching report:" + e.getMessage());
			return "error occured while fetching report:" + e.getMessage();
		}
	}

}
