package com.flair.bi.web.rest;

import static com.flair.bi.domain.enumeration.InputType.CHECKBOX;
import static com.flair.bi.domain.enumeration.InputType.COLOR_PICKER;
import static com.flair.bi.domain.enumeration.InputType.NUMBER;
import static com.flair.bi.domain.enumeration.InputType.SELECT;
import static com.flair.bi.domain.enumeration.InputType.TEXT;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.Arrays;

import org.junit.Ignore;
import org.junit.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import com.flair.bi.AbstractIntegrationTest;

@Ignore
public class InputTypeResourceTest extends AbstractIntegrationTest {

	@Test
	public void getAllInputTypes() {

		ResponseEntity<String[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/inputTypes", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				String[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertTrue(Arrays.asList(response.getBody()).contains(TEXT.getValue()));
		assertTrue(Arrays.asList(response.getBody()).contains(NUMBER.getValue()));
		assertTrue(Arrays.asList(response.getBody()).contains(COLOR_PICKER.getValue()));
		assertTrue(Arrays.asList(response.getBody()).contains(CHECKBOX.getValue()));
		assertTrue(Arrays.asList(response.getBody()).contains(SELECT.getValue()));

	}
}