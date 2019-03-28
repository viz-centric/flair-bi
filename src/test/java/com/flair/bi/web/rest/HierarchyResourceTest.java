package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.Feature;
import com.flair.bi.domain.hierarchy.Drilldown;
import com.flair.bi.domain.hierarchy.Hierarchy;
import com.flair.bi.service.HierarchyService;
import com.flair.bi.service.dto.DrilldownDTO;
import com.flair.bi.service.dto.FeatureDTO;
import com.flair.bi.service.dto.HierarchyDTO;
import com.querydsl.core.types.Predicate;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.testcontainers.shaded.com.google.common.collect.ImmutableSet;

import java.util.Arrays;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;

@Ignore
public class HierarchyResourceTest extends AbstractIntegrationTest {

	@MockBean
	HierarchyService hierarchyService;

	@Test
	public void getAll() {
		Hierarchy hierarchy = new Hierarchy();
		hierarchy.setName("nm");
		hierarchy.setId(1L);
		when(hierarchyService.findAll(any(Predicate.class))).thenReturn(Arrays.asList(hierarchy));
		ResponseEntity<Hierarchy[]> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/hierarchies",
						HttpMethod.GET,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						Hierarchy[].class);
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("nm", response.getBody()[0].getName());
		assertEquals(1L, (long)response.getBody()[0].getId());
	}

	@Test
	public void updateHierarchyFailsIfIdIsNull() {
		HierarchyDTO request = new HierarchyDTO();
		request.setName("nm");

		ResponseEntity<Hierarchy> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/hierarchies",
						HttpMethod.PUT,
						new HttpEntity<>(request),
						Hierarchy.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
	}

	@Test
	public void updateHierarchyFailsIfIdNotExists() {
		HierarchyDTO request = new HierarchyDTO();
		request.setId(1L);
		request.setName("nm");

		ResponseEntity<Hierarchy> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/hierarchies",
						HttpMethod.PUT,
						new HttpEntity<>(request),
						Hierarchy.class);

		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
	}

	@Test
	public void updateHierarchy() {
		HierarchyDTO request = new HierarchyDTO();
		request.setId(1L);
		request.setName("nm");
		DrilldownDTO element = new DrilldownDTO();
		FeatureDTO feature = new FeatureDTO();
		feature.setId(5L);
		element.setFeature(feature);
		element.setOrder(10);
		request.setDrilldown(ImmutableSet.of(element));

		Hierarchy h = new Hierarchy();
		h.setName("old name");
		h.setId(1L);
		when(hierarchyService.findOne(eq(1L))).thenReturn(h);
		when(hierarchyService.save(eq(h))).thenReturn(h);

		ResponseEntity<Hierarchy> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/hierarchies",
						HttpMethod.PUT,
						new HttpEntity<>(request),
						Hierarchy.class);

		Drilldown drilldown = response.getBody().getDrilldown().iterator().next();

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(1L, (long)response.getBody().getId());
		assertEquals("nm", response.getBody().getName());
		assertEquals(5L, (long) drilldown.getFeature().getId());
		assertEquals(10, (int) drilldown.getOrder());

	}

	@Test
	public void createHierarchy() {
		Hierarchy request = new Hierarchy();
		request.setName("nm");
		request.setDatasource(new Datasource());
		Drilldown drilldown = new Drilldown();
		Feature feature = new Feature();
		feature.setId(5L);
		drilldown.setFeature(feature);
		drilldown.setOrder(10);
		request.setDrilldown(ImmutableSet.of(drilldown));

		Hierarchy request2 = new Hierarchy();
		request2.setName("nm");
		request2.setId(11L);
		request2.setDrilldown(ImmutableSet.of(drilldown));

		when(hierarchyService.save(eq(request))).thenReturn(request2);

		ResponseEntity<Hierarchy> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/hierarchies",
						HttpMethod.POST,
						new HttpEntity<>(request),
						Hierarchy.class);

		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals(11L, (long)response.getBody().getId());
		assertEquals("nm", response.getBody().getName());
		assertEquals(5L, (long) drilldown.getFeature().getId());
		assertEquals(10, (int) drilldown.getOrder());
	}

	@Test
	public void deleteHierarchies() {
		ResponseEntity<String> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/hierarchies/3",
						HttpMethod.DELETE,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						String.class);

		verify(hierarchyService, times(1)).delete(eq(3L));
	}
}