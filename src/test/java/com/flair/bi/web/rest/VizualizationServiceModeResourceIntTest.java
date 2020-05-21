package com.flair.bi.web.rest;

import static org.junit.Assert.assertEquals;

import org.junit.Ignore;
import org.junit.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.service.dto.ConfigurationDTO;

@Ignore
public class VizualizationServiceModeResourceIntTest extends AbstractIntegrationTest {

	@Test
	public void getVizualizationServiceMode() {
		ResponseEntity<ConfigurationDTO> result = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/vizualizationServiceMode", HttpMethod.GET,
				new HttpEntity<>(new LinkedMultiValueMap<>()), ConfigurationDTO.class);

		assertEquals(HttpStatus.OK, result.getStatusCode());
		assertEquals("grpc", result.getBody().getVizualizationServiceMode());
	}
}