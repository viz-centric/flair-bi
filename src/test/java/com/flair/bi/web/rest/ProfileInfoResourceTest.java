package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.web.rest.vm.ManagedUserVM;
import org.junit.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;

public class ProfileInfoResourceTest extends AbstractIntegrationTest {

	@Test
	public void getActiveProfiles() {

		ResponseEntity<Map> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/profile-info",
						HttpMethod.GET,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						Map.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertTrue(((List)response.getBody().get("activeProfiles")).stream().filter(i->i.equals("test")).findFirst().isPresent());
	}
}