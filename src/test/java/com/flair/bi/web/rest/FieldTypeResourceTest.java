package com.flair.bi.web.rest;

import static com.flair.bi.domain.enumeration.Constraint.REQUIRED;
import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.service.FieldTypeService;
import com.flair.bi.service.dto.IdentifierDTO;

@Ignore
public class FieldTypeResourceTest extends AbstractIntegrationTest {

	@MockBean
	FieldTypeService fieldTypeService;

	@Test
	public void assignPropertyType() {
		IdentifierDTO<Long> longIdentifierDTO = new IdentifierDTO<>();
		longIdentifierDTO.setId(10L);

		FieldType fieldType = new FieldType();
		fieldType.setId(1L);
		fieldType.setOrder(2);
		fieldType.setConstraint(REQUIRED);
		when(fieldTypeService.assignPropertyType(eq(3L), eq(10L))).thenReturn(fieldType);

		ResponseEntity<FieldType> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/fieldTypes/3/propertyTypes", HttpMethod.POST, new HttpEntity<>(longIdentifierDTO),
				FieldType.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(1L, (long) response.getBody().getId());
		assertEquals(2L, (long) response.getBody().getOrder());
		assertEquals(REQUIRED, response.getBody().getConstraint());
	}

	@Test
	public void removePropertyType() {
		FieldType fieldType = new FieldType();
		fieldType.setId(1L);
		fieldType.setOrder(2);
		fieldType.setConstraint(REQUIRED);
		when(fieldTypeService.removePropertyType(eq(3L), eq(4L))).thenReturn(fieldType);

		ResponseEntity<FieldType> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/fieldTypes/3/propertyTypes/4", HttpMethod.DELETE,
				new HttpEntity<>(new LinkedMultiValueMap<>()), FieldType.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(1L, (long) response.getBody().getId());
		assertEquals(2L, (long) response.getBody().getOrder());
		assertEquals(REQUIRED, response.getBody().getConstraint());
	}
}