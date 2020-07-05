package com.flair.bi.web.rest;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.anyListOf;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;

import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.mapper.ReleaseRequestMapper;
import com.flair.bi.web.rest.dto.ReleaseRequestDTO;

@Ignore
public class ReleaseResourceTest extends AbstractIntegrationTest {

	@MockBean
	ReleaseRequestMapper releaseRequestMapper;
	@MockBean
	ReleaseRequestService releaseRequestService;

	@Test
	public void getRequests() {
		ReleaseRequestDTO dto = new ReleaseRequestDTO();
		dto.setComment("my comment");
		when(releaseRequestMapper.releaseRequestsToReleaseRequestDTOs(anyListOf(ReleaseRequest.class)))
				.thenReturn(Arrays.asList(dto));

		ResponseEntity<ReleaseRequestDTO[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/releases", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				ReleaseRequestDTO[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("my comment", response.getBody()[0].getComment());
	}

	@Test
	public void getRequest() {
		ReleaseRequest request = new ReleaseRequest();
		request.setComment("my comment");
		when(releaseRequestService.getRequestById(eq(3L))).thenReturn(request);

		ResponseEntity<ReleaseRequest> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/releases/3", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				ReleaseRequest.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("my comment", response.getBody().getComment());
	}

	@Test
	public void approveRequest() {
		ResponseEntity<String> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/releases/3/approve", HttpMethod.PUT, new HttpEntity<>(new LinkedMultiValueMap<>()),
				String.class);

		verify(releaseRequestService, times(1)).approveRelease(eq(3L));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void rejectRequest() {
		ResponseEntity<String> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/releases/3/reject", HttpMethod.PUT, new HttpEntity<>(new LinkedMultiValueMap<>()),
				String.class);

		verify(releaseRequestService, times(1)).rejectRelease(eq(3L));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}
}