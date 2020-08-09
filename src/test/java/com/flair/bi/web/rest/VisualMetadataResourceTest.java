package com.flair.bi.web.rest;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.HashMap;

import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.view.VisualMetadataService;
import com.flair.bi.view.VisualMetadataValidationService;
import com.flair.bi.web.rest.dto.QueryValidationResponseDTO;
import com.flair.bi.web.rest.dto.SaveVisualMetadataDTO;
import com.flair.bi.web.rest.dto.ValidateVisualMetadataDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.expression.condition.ConditionExpression;
import com.project.bi.query.expression.condition.impl.LikeConditionExpression;

@Ignore
public class VisualMetadataResourceTest extends AbstractIntegrationTest {

	@MockBean
	private VisualMetadataValidationService visualMetadataValidationService;
	@MockBean
	private VisualMetadataService visualMetadataService;

	@Test
	public void validateVisualMetadataRequestValidationFails() {
		QueryValidationResponseDTO dto = new QueryValidationResponseDTO();

		when(visualMetadataValidationService.validate(eq(1L), eq(new QueryDTO()), eq("visual id"),
				eq(new LikeConditionExpression()), eq("user id"))).thenReturn(dto);

		HashMap result = restTemplate.withBasicAuth("flairuser", "flairpass").postForObject(
				getUrl() + "/api/visualmetadata/validate", new ValidateVisualMetadataDTO(), HashMap.class);
		assertEquals(result.get("message"), "error.validation");
	}

	@Test
	public void validateVisualMetadataValidationSucceeds() {
		long datasourceId = 1L;
		QueryDTO queryDTO = new QueryDTO();
		String visualId = "visual id";
		LikeConditionExpression conditionExpression = new LikeConditionExpression();

		QueryValidationResponseDTO dto = new QueryValidationResponseDTO();
		dto.setError("error");
		dto.setRawQuery("raw query");
		dto.setValidationResultType("INVALID");

		ValidateVisualMetadataDTO request = new ValidateVisualMetadataDTO();
		request.setDatasourceId(datasourceId);
		request.setQueryDTO(queryDTO);
		request.setVisualMetadataId(visualId);
		request.setConditionExpression(conditionExpression);

		when(visualMetadataValidationService.validate(eq(datasourceId), any(QueryDTO.class), eq(visualId),
				any(ConditionExpression.class), eq("flairuser"))).thenReturn(dto);

		QueryValidationResponseDTO result = restTemplate.withBasicAuth("flairuser", "flairpass")
				.postForObject(getUrl() + "/api/visualmetadata/validate", request, QueryValidationResponseDTO.class);

		assertEquals(result.getRawQuery(), dto.getRawQuery());
		assertEquals(result.getError(), dto.getError());
		assertEquals(result.getValidationResultType(), dto.getValidationResultType());
	}

	@Test
	public void createVisualMetadata() {
		SaveVisualMetadataDTO visualMetadata = new SaveVisualMetadataDTO();
		visualMetadata.setViewId(10L);
		VisualMetadata metadata = new VisualMetadata();
		metadata.setQuery("query");
		visualMetadata.setVisualMetadata(metadata);

		SaveVisualMetadataDTO visualMetadata1 = new SaveVisualMetadataDTO();
		visualMetadata1.setViewId(10L);
		VisualMetadata metadata1 = new VisualMetadata();
		metadata1.setQuery("query");
		metadata1.setId("id");
		visualMetadata1.setVisualMetadata(metadata1);

		when(visualMetadataService.save(eq(visualMetadata.getViewId()), any(VisualMetadata.class)))
				.thenReturn(metadata1);

		ResponseEntity<VisualMetadata> result = restTemplate.withBasicAuth("flairuser", "flairpass")
				.postForEntity(getUrl() + "/api/visualmetadata", visualMetadata, VisualMetadata.class);

		assertEquals(HttpStatus.CREATED, result.getStatusCode());
		assertEquals("query", result.getBody().getQuery());
		assertEquals("id", result.getBody().getId());
	}

	@Test
	public void updateVisualMetadataCreatesMetadata() {
		SaveVisualMetadataDTO visualMetadata = new SaveVisualMetadataDTO();
		visualMetadata.setViewId(10L);
		VisualMetadata metadata = new VisualMetadata();
		metadata.setQuery("query");
		visualMetadata.setVisualMetadata(metadata);

		SaveVisualMetadataDTO visualMetadata1 = new SaveVisualMetadataDTO();
		visualMetadata1.setViewId(10L);
		VisualMetadata metadata1 = new VisualMetadata();
		metadata1.setQuery("query");
		metadata1.setId("id");
		visualMetadata1.setVisualMetadata(metadata1);

		when(visualMetadataService.save(eq(visualMetadata.getViewId()), any(VisualMetadata.class)))
				.thenReturn(metadata1);

		ResponseEntity<VisualMetadata> result = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualmetadata", HttpMethod.PUT, new HttpEntity<>(visualMetadata),
				VisualMetadata.class);

		assertEquals(HttpStatus.CREATED, result.getStatusCode());
		assertEquals("query", result.getBody().getQuery());
		assertEquals("id", result.getBody().getId());
	}

	@Test
	public void updateVisualMetadata() {
		SaveVisualMetadataDTO visualMetadata = new SaveVisualMetadataDTO();
		visualMetadata.setViewId(10L);
		VisualMetadata metadata = new VisualMetadata();
		metadata.setQuery("query");
		metadata.setId("id");
		visualMetadata.setVisualMetadata(metadata);

		SaveVisualMetadataDTO visualMetadata1 = new SaveVisualMetadataDTO();
		visualMetadata1.setViewId(10L);
		VisualMetadata metadata1 = new VisualMetadata();
		metadata1.setQuery("query");
		metadata1.setId("id");
		visualMetadata1.setVisualMetadata(metadata1);

		when(visualMetadataService.save(eq(visualMetadata.getViewId()), any(VisualMetadata.class)))
				.thenReturn(metadata1);

		ResponseEntity<VisualMetadata> result = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualmetadata", HttpMethod.PUT, new HttpEntity<>(visualMetadata),
				VisualMetadata.class);

		assertEquals(HttpStatus.OK, result.getStatusCode());
		assertEquals("query", result.getBody().getQuery());
		assertEquals("id", result.getBody().getId());
	}

	@Test
	public void getAllVisualMetadata() {
		VisualMetadata metadata1 = new VisualMetadata();
		metadata1.setQuery("query");
		metadata1.setId("id");

		when(visualMetadataService.findAllByPrincipalPermissionsByViewId(eq(17L))).thenReturn(Arrays.asList(metadata1));

		ResponseEntity<VisualMetadata[]> result = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualmetadata?views=17", HttpMethod.GET,
				new HttpEntity<>(new LinkedMultiValueMap<>()), VisualMetadata[].class);

		assertEquals(HttpStatus.OK, result.getStatusCode());
		assertEquals("query", result.getBody()[0].getQuery());
		assertEquals("id", result.getBody()[0].getId());
	}

	@Test
	public void getVisualMetadata() {
		VisualMetadata metadata1 = new VisualMetadata();
		metadata1.setQuery("query");
		metadata1.setId("id");

		when(visualMetadataService.findOne(eq("18"))).thenReturn(metadata1);

		ResponseEntity<VisualMetadata> result = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualmetadata/18", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				VisualMetadata.class);

		assertEquals(HttpStatus.OK, result.getStatusCode());
		assertEquals("query", result.getBody().getQuery());
		assertEquals("id", result.getBody().getId());
	}

	@Test
	public void deleteVisualMetadata() {
		VisualMetadata metadata1 = new VisualMetadata();
		metadata1.setQuery("query");
		metadata1.setId("id");

		ResponseEntity<VisualMetadata> result = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualmetadata/18", HttpMethod.DELETE, new HttpEntity<>(new LinkedMultiValueMap<>()),
				VisualMetadata.class);

		verify(visualMetadataService, times(1)).delete(eq("18"));

		assertEquals(HttpStatus.OK, result.getStatusCode());
	}

}
