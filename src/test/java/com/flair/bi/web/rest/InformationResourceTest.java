package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.Information;
import com.flair.bi.service.InformationService;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import java.util.Arrays;

import static org.junit.Assert.*;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.when;

public class InformationResourceTest extends AbstractIntegrationTest {

	@MockBean
	InformationService informationService;

	@Test
	public void getAllInformation() {
		Information information = new Information();
		information.setId(15L);
		when(informationService.getAll()).thenReturn(Arrays.asList(information));
		ResponseEntity<Information[]> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/information",
						HttpMethod.GET,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						Information[].class);
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(15L, (long)response.getBody()[0].getId());
	}

	@Test
	public void getAllInformationOnDesktop() {
		Information information = new Information();
		information.setId(15L);

		when(informationService.getAll(eq(true))).thenReturn(Arrays.asList(information));

		ResponseEntity<Information[]> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/information/based-on-viewport/true",
						HttpMethod.GET,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						Information[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(15L, (long)response.getBody()[0].getId());
	}
}