package com.flair.bi.service;

import java.util.List;

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
	
	@Value("${flair-notifications.scheduled-execute-now-report-param-url}")
	private String executeImmediateUrl;
    
	@Value("${flair-notifications.scheduled-report-logs-param-url}")
	private String scheduleReportLogsUrl;
	
	private String searchscheduledReportsURL="/api/jobFilter/?userName={userName}&reportName={reportName}&startDate={startDate}&endDate={endDate}&pageSize={pageSize}&page={page}";

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
			log.error("error occured while getting scheduled report logs:"+e.getMessage());
			JSONObject jsonObject = new JSONObject();
			return ResponseEntity.status(responseEntity.getStatusCode()).body(responseEntity.getBody());
		}
	}
	
	public String buildUrl(String host,String port,String apiUrl) {
		StringBuffer url= new StringBuffer();
		url.append(host).append(":").append(port).append(apiUrl);
		return url.toString();
	}

}
