package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.Visualization;
import com.flair.bi.domain.enumeration.Constraint;
import com.flair.bi.domain.enumeration.FeatureType;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.service.VisualizationService;
import com.flair.bi.service.dto.IdentifierDTO;
import com.flair.bi.service.dto.VisualizationDTO;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import java.util.Arrays;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Ignore
public class VisualizationsResourceIntTest extends AbstractIntegrationTest {

	@MockBean
	VisualizationService visualizationService;

	@Test
	public void createVisualizations() {
		Visualization visualization = new Visualization();
		visualization.setFunctionname("func name");
		visualization.setName("vis name");

		Visualization visualization1 = new Visualization();
		visualization1.setFunctionname("func name");
		visualization1.setName("vis name");
		visualization1.setId(7L);

		when(visualizationService.save(any(Visualization.class))).thenReturn(visualization1);

		ResponseEntity<Visualization> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations", HttpMethod.POST, new HttpEntity<>(visualization),
				Visualization.class);

		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals(7L, (long) response.getBody().getId());
		assertEquals("func name", response.getBody().getFunctionname());
		assertEquals("vis name", response.getBody().getName());
	}

	@Test
	public void createVisualizationsFails() {
		Visualization visualization = new Visualization();
		visualization.setFunctionname("func name");
		visualization.setName("vis name");
		visualization.setId(7L);

		ResponseEntity<Visualization> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations", HttpMethod.POST, new HttpEntity<>(visualization),
				Visualization.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
	}

	@Test
	public void updateVisualizationsCreates() {
		Visualization visualization = new Visualization();
		visualization.setFunctionname("func name");
		visualization.setName("vis name");

		Visualization visualization1 = new Visualization();
		visualization1.setFunctionname("func name");
		visualization1.setName("vis name");
		visualization1.setId(7L);

		when(visualizationService.save(any(Visualization.class))).thenReturn(visualization1);

		ResponseEntity<Visualization> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations", HttpMethod.PUT, new HttpEntity<>(visualization), Visualization.class);

		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals(7L, (long) response.getBody().getId());
		assertEquals("func name", response.getBody().getFunctionname());
		assertEquals("vis name", response.getBody().getName());
	}

	@Test
	public void updateVisualizations() {
		Visualization visualization = new Visualization();
		visualization.setFunctionname("func name");
		visualization.setName("vis name");
		visualization.setId(7L);

		Visualization visualization1 = new Visualization();
		visualization1.setFunctionname("func name");
		visualization1.setName("vis name");
		visualization1.setId(7L);

		when(visualizationService.save(any(Visualization.class))).thenReturn(visualization1);

		ResponseEntity<Visualization> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations", HttpMethod.PUT, new HttpEntity<>(visualization), Visualization.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(7L, (long) response.getBody().getId());
		assertEquals("func name", response.getBody().getFunctionname());
		assertEquals("vis name", response.getBody().getName());
	}

	@Test
	public void getAllVisualizations() {
		VisualizationDTO visualization = new VisualizationDTO();
		visualization.setId(10L);
		visualization.setName("vis name");
		visualization.setFunctionname("func name");

		when(visualizationService.findAll()).thenReturn(Arrays.asList(visualization));

		ResponseEntity<Visualization[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				Visualization[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(10L, (long) response.getBody()[0].getId());
		assertEquals("vis name", response.getBody()[0].getName());
		assertEquals("func name", response.getBody()[0].getFunctionname());
	}

	@Test
	public void getVisualizations() {
		VisualizationDTO visualization = new VisualizationDTO();
		visualization.setId(10L);
		visualization.setFunctionname("func name");
		visualization.setName("vis name");
		visualization.setCustomId(5);

		when(visualizationService.findOne(eq(10L))).thenReturn(visualization);

		ResponseEntity<Visualization> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations/10", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				Visualization.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(10L, (long) response.getBody().getId());
		assertEquals("func name", response.getBody().getFunctionname());
		assertEquals("vis name", response.getBody().getName());
		assertEquals(5L, (long) response.getBody().getCustomId());
	}

	@Test
	public void deleteVisualizations() {
		ResponseEntity<Visualization> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations/10", HttpMethod.DELETE, new HttpEntity<>(new LinkedMultiValueMap<>()),
				Visualization.class);

		verify(visualizationService, times(1)).delete(eq(10L));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void getFieldTypeDetails() {
		FieldType fieldType = new FieldType();
		fieldType.setId(5L);
		fieldType.setConstraint(Constraint.REQUIRED);
		fieldType.setOrder(2);
		fieldType.setFeatureType(FeatureType.DIMENSION);

		when(visualizationService.getFieldType(eq(10L), eq(11L))).thenReturn(fieldType);

		ResponseEntity<FieldType> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations/10/fieldTypes/11", HttpMethod.GET,
				new HttpEntity<>(new LinkedMultiValueMap<>()), FieldType.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(5L, (long) response.getBody().getId());
		assertEquals(Constraint.REQUIRED, response.getBody().getConstraint());
		assertEquals(2, response.getBody().getOrder());
		assertEquals(FeatureType.DIMENSION, response.getBody().getFeatureType());
	}

	@Test
	public void createNewFieldType() {
		FieldType fieldType = new FieldType();
		fieldType.setConstraint(Constraint.REQUIRED);
		fieldType.setOrder(2);
		fieldType.setFeatureType(FeatureType.DIMENSION);

		when(visualizationService.getFieldType(eq(10L), eq(11L))).thenReturn(fieldType);

		Visualization visualization = new Visualization();
		visualization.setId(10L);
		visualization.setCustomId(9);
		visualization.setName("vis name");
		visualization.setFunctionname("func name");

		when(visualizationService.saveFieldType(eq(10L), any(FieldType.class))).thenReturn(visualization);

		ResponseEntity<Visualization> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations/10/fieldTypes", HttpMethod.POST, new HttpEntity<>(fieldType),
				Visualization.class);

		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals(10L, (long) response.getBody().getId());
		assertEquals(9, (int) response.getBody().getCustomId());
		assertEquals("vis name", response.getBody().getName());
		assertEquals("func name", response.getBody().getFunctionname());
	}

	@Test
	public void deleteFieldType() {
		ResponseEntity<Visualization> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations/10/fieldTypes/11", HttpMethod.DELETE,
				new HttpEntity<>(new LinkedMultiValueMap<>()), Visualization.class);

		verify(visualizationService, times(1)).deleteFieldType(eq(10L), eq(11L));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void assignPropertyType() {
		IdentifierDTO<Long> dto = new IdentifierDTO<>();
		dto.setId(27L);

		Visualization t = new Visualization();
		t.setId(18L);
		when(visualizationService.assignPropertyType(eq(10L), eq(27L))).thenReturn(t);

		ResponseEntity<Visualization> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations/10/propertyTypes", HttpMethod.POST, new HttpEntity<>(dto),
				Visualization.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(18L, (long) response.getBody().getId());
	}

	@Test
	public void removePropertyType() {
		Visualization t = new Visualization();
		t.setId(18L);
		when(visualizationService.removePropertyType(eq(10L), eq(18L))).thenReturn(t);

		ResponseEntity<Visualization> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/visualizations/10/propertyTypes/18", HttpMethod.DELETE,
				new HttpEntity<>(new LinkedMultiValueMap<>()), Visualization.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(18L, (long) response.getBody().getId());
	}
}