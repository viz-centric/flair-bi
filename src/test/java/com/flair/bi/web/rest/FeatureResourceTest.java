package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.Feature;
import com.flair.bi.domain.enumeration.FeatureType;
import com.flair.bi.service.FeatureService;
import com.flair.bi.service.dto.FeatureDTO;
import com.flair.bi.service.dto.FeatureListDTO;
import com.flair.bi.service.mapper.FeatureMapper;
import com.flair.bi.web.rest.params.FeatureRequestParams;
import com.querydsl.core.types.Predicate;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.testcontainers.shaded.com.fasterxml.jackson.core.JsonProcessingException;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;

import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyListOf;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

public class FeatureResourceTest extends AbstractIntegrationTest {

	@MockBean
	FeatureService featureService;

	ObjectMapper objectMapper;

	@Before
	public void setUp() throws Exception {
		objectMapper = new ObjectMapper();
	}

	@Test
	public void getFeatures() {
		Feature feature = new Feature();
		feature.setDefinition("def");
		feature.setFeatureType(FeatureType.DIMENSION);
		feature.setName("test");
		feature.setType("tp");
		feature.setId(10L);
		when(featureService.getFeatures(any(Predicate.class))).thenReturn(Arrays.asList(feature));

		LinkedMultiValueMap<String, String> map = new LinkedMultiValueMap<>();
		map.add("view", "7");
		map.add("name", "test");

		ResponseEntity<FeatureDTO[]> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/features", HttpMethod.GET, new HttpEntity<>(map), FeatureDTO[].class);

		assertEquals(OK, response.getStatusCode());
		assertEquals(10L, (long)response.getBody()[0].getId());
		assertEquals("def", response.getBody()[0].getDefinition());
		assertEquals(FeatureType.DIMENSION, response.getBody()[0].getFeatureType());
		assertEquals("test", response.getBody()[0].getName());
		assertEquals("tp", response.getBody()[0].getType());
	}

	@Test
	public void updateFeatureFailsIfIdIsNotProvided() {

		Feature feature = new Feature();
		feature.setDefinition("def");
		feature.setFeatureType(FeatureType.DIMENSION);
		feature.setName("test");
		feature.setType("tp");

		Datasource datasource = new Datasource();
		datasource.setId(10L);
		feature.setDatasource(datasource);

		ResponseEntity<Feature> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/features", HttpMethod.PUT, new HttpEntity<>(feature), Feature.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
	}

	@Test
	public void updateFeature() {

		Feature feature = new Feature();
		feature.setDefinition("def");
		feature.setFeatureType(FeatureType.DIMENSION);
		feature.setName("test");
		feature.setType("tp");
		feature.setId(10L);

		Datasource datasource = new Datasource();
		datasource.setId(11L);
		feature.setDatasource(datasource);

		Feature existingFeature = new Feature();
		existingFeature.setId(feature.getId());
		existingFeature.setFeatureType(feature.getFeatureType());
		existingFeature.setDatasource(feature.getDatasource());
		existingFeature.setDefinition(feature.getDefinition());
		existingFeature.setType(feature.getType());

		when(featureService.getOne(eq(feature.getId()))).thenReturn(existingFeature);
		when(featureService.save(eq(existingFeature))).thenReturn(existingFeature);

		ResponseEntity<Feature> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/features", HttpMethod.PUT, new HttpEntity<>(feature), Feature.class);

		assertEquals(OK, response.getStatusCode());
		assertEquals(10L, (long)response.getBody().getId());
		assertEquals("def", response.getBody().getDefinition());
		assertEquals(FeatureType.DIMENSION, response.getBody().getFeatureType());
		assertEquals("test", response.getBody().getName());
		assertEquals("tp", response.getBody().getType());
	}

	@Test
	public void deleteFeature() {
		ResponseEntity<String> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/features/3", HttpMethod.DELETE, new HttpEntity<>(new LinkedMultiValueMap<>()), String.class);

		verify(featureService, times(1)).delete(eq(3L));

		assertEquals(OK, response.getStatusCode());
	}

	@Test
	public void createFeatures() {
		Feature request = new Feature();
		request.setDefinition("def");
		request.setFeatureType(FeatureType.DIMENSION);
		request.setName("test");
		request.setType("tp");

		Datasource datasource = new Datasource();
		datasource.setId(11L);
		request.setDatasource(datasource);

		Feature feature2 = new Feature();
		feature2.setDefinition("def");
		feature2.setFeatureType(FeatureType.DIMENSION);
		feature2.setName("test");
		feature2.setType("tp");
		feature2.setId(15L);

		when(featureService.save(any(Feature.class))).thenReturn(feature2);

		ResponseEntity<Feature> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/features", HttpMethod.POST, new HttpEntity<>(request), Feature.class);

		assertEquals(CREATED, response.getStatusCode());
		assertEquals(15L, (long)response.getBody().getId());
		assertEquals("def", response.getBody().getDefinition());
		assertEquals(FeatureType.DIMENSION, response.getBody().getFeatureType());
		assertEquals("test", response.getBody().getName());
		assertEquals("tp", response.getBody().getType());
	}

	@Test
	public void createFeaturesList() throws JsonProcessingException {
		FeatureDTO request = new FeatureDTO();
		request.setDefinition("def");
		request.setFeatureType(FeatureType.DIMENSION);
		request.setName("test");
		request.setType("tp");
		request.setIsSelected(true);

		FeatureListDTO featureListDTO = new FeatureListDTO();
		featureListDTO.setDatasourceId(20L);
		featureListDTO.setFeatureList(Arrays.asList(request));

		ResponseEntity<String> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/features/list", HttpMethod.POST, new HttpEntity<>(featureListDTO), String.class);

		verify(featureService, times(1)).save(anyListOf(Feature.class));

		assertEquals(CREATED, response.getStatusCode());
		assertNull(response.getBody());
	}
}