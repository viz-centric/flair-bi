package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.service.dto.ConfigurationDTO;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import static org.junit.Assert.*;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@Ignore
public class VizualizationServiceModeResourceIntTest extends AbstractIntegrationTest {

	@Test
	public void getVizualizationServiceMode() {
		ResponseEntity<ConfigurationDTO> result = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/vizualizationServiceMode",
						HttpMethod.GET,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						ConfigurationDTO.class);

		assertEquals(HttpStatus.OK, result.getStatusCode());
		assertEquals("grpc", result.getBody().getVizualizationServiceMode());
	}
}