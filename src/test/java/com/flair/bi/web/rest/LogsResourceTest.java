package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.web.rest.vm.LoggerVM;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import java.util.Arrays;

import static org.junit.Assert.*;

@Ignore
public class LogsResourceTest extends AbstractIntegrationTest {

	@Test
	public void getList() {
		ResponseEntity<LoggerVM[]> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/management/logs",
						HttpMethod.GET,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						LoggerVM[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("WARN", Arrays.stream(response.getBody())
				.filter(i -> i.getName().equalsIgnoreCase("ROOT"))
				.findFirst()
				.get()
				.getLevel());
	}

	@Test
	public void changeLevel() {
	}
}