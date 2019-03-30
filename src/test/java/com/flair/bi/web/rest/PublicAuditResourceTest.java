package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.service.AuditEventService;
import com.flair.bi.service.dto.CountDTO;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import java.util.Map;

import static org.junit.Assert.*;
import static org.mockito.Mockito.when;

@Ignore
public class PublicAuditResourceTest extends AbstractIntegrationTest {

	@MockBean
	AuditEventService auditEventService;

	@Test
	public void getSuccessLoginCount() {

		when(auditEventService.authenticationSuccessCount()).thenReturn(3L);

		ResponseEntity<CountDTO> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/audits/authenticationSuccess/count",
						HttpMethod.GET,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						CountDTO.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(3L, (long)response.getBody().getCount());
	}
}