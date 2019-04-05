package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.enumeration.FeatureType;
import com.flair.bi.service.dto.FeatureDTO;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import java.util.Arrays;

import static org.junit.Assert.*;

@Ignore
public class FeatureTypeResourceTest extends AbstractIntegrationTest {

	@Test
	public void getAllFeatureTypes() {
		ResponseEntity<String[]> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/featureTypes", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()), String[].class);

		assertTrue(Arrays.asList(response.getBody()).contains(FeatureType.DIMENSION.getValue()));
		assertTrue(Arrays.asList(response.getBody()).contains(FeatureType.MEASURE.getValue()));
	}
}