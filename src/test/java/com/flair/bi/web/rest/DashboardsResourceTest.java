package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.DashboardRelease;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.Release;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewState;
import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.dto.CountDTO;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.dto.CreateDashboardReleaseDTO;
import com.querydsl.core.types.Predicate;
import org.junit.Before;
import org.junit.Test;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class DashboardsResourceTest extends AbstractIntegrationTest {

	@MockBean
	DashboardService dashboardService;

	@MockBean
	ViewService viewService;

	@MockBean
	ReleaseRequestService releaseRequestService;

	@Before
	public void setUp() throws Exception {
	}

	@Test
	public void createDashboards() {
		Dashboard request = new Dashboard();
		request.setDashboardName("dashboard name");
		request.setCategory("category");
		request.setPublished(true);
		request.setDashboardDatasource(new Datasource());

		Dashboard responseDashboard = new Dashboard();
		responseDashboard.setId(30L);
		when(dashboardService.save(eq(request))).thenReturn(responseDashboard);

		ResponseEntity<Dashboard> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.postForEntity(getUrl() + "/api/dashboards", request, Dashboard.class);

		assertEquals(responseDashboard, response.getBody());
		assertEquals(HttpStatus.CREATED, response.getStatusCode());
	}

	@Test
	public void createDashboardsFailsIfIdExists() {
		Dashboard request = new Dashboard();
		request.setDashboardName("dashboard name");
		request.setId(10L);
		request.setCategory("category");
		request.setPublished(true);
		request.setDashboardDatasource(new Datasource());

		ResponseEntity<Dashboard> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.postForEntity(getUrl() + "/api/dashboards", request, Dashboard.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertNull(response.getBody());
	}

	@Test
	public void updateDashboard() {
		Dashboard request = new Dashboard();
		request.setDashboardName("dashboard name");
		request.setId(10L);
		request.setCategory("category");
		request.setPublished(true);
		request.setDashboardDatasource(new Datasource());

		Dashboard responseDashboard = new Dashboard();
		responseDashboard.setId(30L);
		when(dashboardService.save(eq(request))).thenReturn(responseDashboard);

		ResponseEntity<Dashboard> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards", HttpMethod.PUT, new HttpEntity<>(request), Dashboard.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(responseDashboard, response.getBody());
	}

	@Test
	public void updateDashboardCreatesDashboardIfIdNotProvided() {
		Dashboard request = new Dashboard();
		request.setDashboardName("dashboard name");
		request.setCategory("category");
		request.setPublished(true);
		request.setDashboardDatasource(new Datasource());

		Dashboard responseDashboard = new Dashboard();
		responseDashboard.setId(30L);
		when(dashboardService.save(eq(request))).thenReturn(responseDashboard);

		ResponseEntity<Dashboard> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards", HttpMethod.PUT, new HttpEntity<>(request), Dashboard.class);

		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals(responseDashboard, response.getBody());
	}

	@Test
	public void getAllDashboards() {
		Dashboard d1 = new Dashboard();
		d1.setId(1L);
		d1.setDashboardName("dashboard name");
		d1.setCategory("category");
		d1.setPublished(true);
		d1.setDashboardDatasource(new Datasource());

		Dashboard d2 = new Dashboard();
		d2.setId(1L);
		d2.setDashboardName("dashboard name");
		d2.setCategory("category");
		d2.setPublished(true);
		d2.setDashboardDatasource(new Datasource());

		List<Dashboard> dashboards = Arrays.asList(d1, d2);

		when(dashboardService.findAllByPrincipalPermissions(any(Pageable.class), any(Predicate.class)))
				.thenReturn(new PageImpl<>(dashboards, new PageRequest(1, 2), 2));

		ResponseEntity<Dashboard[]> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()), Dashboard[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(dashboards, Arrays.asList(response.getBody()));
	}

	@Test
	public void getDashboardsCount() {
		when(dashboardService.countByPrincipalPermissions())
				.thenReturn(15L);

		ResponseEntity<CountDTO> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards/count", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()), CountDTO.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(15L, (long)response.getBody().getCount());
	}

	@Test
	public void getDashboards() {
		Dashboard dashboard = new Dashboard();
		when(dashboardService.findOne(3L)).thenReturn(dashboard);

		ResponseEntity<Dashboard> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards/3", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()), Dashboard.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(dashboard, response.getBody());
	}

	@Test
	public void getDashboardsDoesNotExist() {
		ResponseEntity<Dashboard> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards/3", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()), Dashboard.class);

		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
		assertNull(response.getBody());
	}

	@Test
	public void deleteDashboards() {
		View view = new View();
		view.setId(9L);
		when(viewService.findByDashboardId(eq(3L))).thenReturn(Arrays.asList(view));

		ResponseEntity<Dashboard> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards/3", HttpMethod.DELETE, new HttpEntity<>(new LinkedMultiValueMap<>()), Dashboard.class);

		verify(viewService, times(1)).delete(9L);
		verify(dashboardService, times(1)).delete(3L);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNull(response.getBody());
	}

	@Test
	public void getDatasource() {
		Dashboard dashboard = new Dashboard();
		Datasource datasource = new Datasource();
		datasource.setId(10L);
		dashboard.setDashboardDatasource(datasource);
		when(dashboardService.findOne(3L)).thenReturn(dashboard);

		ResponseEntity<Datasource> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards/3/datasource", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()), Datasource.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(datasource.getId(), response.getBody().getId());
	}

	@Test
	public void requestRelease() {
		Dashboard dashboard = new Dashboard();
		dashboard.setId(3L);
		when(dashboardService.findOne(eq(3L))).thenReturn(dashboard);

		View view = new View();
		view.setId(6L);
		ViewState viewState = new ViewState();
		viewState.setId("11");
		view.setCurrentEditingState(viewState);
		when(viewService.findOne(eq(6L))).thenReturn(view);

		View view2 = new View();
		view2.setId(7L);
		ViewState viewState2 = new ViewState();
		viewState2.setId("12");
		view2.setCurrentEditingState(viewState2);
		when(viewService.findOne(eq(7L))).thenReturn(view2);

		doAnswer(invocationOnMock -> {
			DashboardRelease dashboardRelease = invocationOnMock.getArgumentAt(0, DashboardRelease.class);
			ReleaseRequest releaseRequest = new ReleaseRequest();
			releaseRequest.setComment(dashboardRelease.getComment());
			releaseRequest.setRelease(dashboardRelease);
			releaseRequest.setId(17L);
			return releaseRequest;
		}).when(releaseRequestService).requestRelease(any(DashboardRelease.class));

		CreateDashboardReleaseDTO createDashboardReleaseDTO = new CreateDashboardReleaseDTO();
		createDashboardReleaseDTO.setComment("test");
		createDashboardReleaseDTO.setViewIds(Arrays.asList(6L, 7L));

		ResponseEntity<ReleaseRequest> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards/3/requestRelease", HttpMethod.PUT, new HttpEntity<>(createDashboardReleaseDTO), ReleaseRequest.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(17L, (long)response.getBody().getId());
		assertEquals("test", response.getBody().getComment());
		assertEquals("test", response.getBody().getRelease().getComment());
		assertTrue(Arrays.asList("11", "12").contains(new ArrayList<>(response.getBody().getRelease().getViewReleases()).get(0).getViewState().getId()));
		assertTrue(Arrays.asList("11", "12").contains(new ArrayList<>(response.getBody().getRelease().getViewReleases()).get(1).getViewState().getId()));
	}

	@Test
	public void getDashboardReleases() {
		DashboardRelease dashboardRelease = new DashboardRelease();
		dashboardRelease.setId(19L);
		when(dashboardService.getDashboardReleases(eq(3L))).thenReturn(Arrays.asList(dashboardRelease));

		ResponseEntity<DashboardRelease[]> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards/3/releases", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()), DashboardRelease[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(19L, (long)response.getBody()[0].getId());
	}

	@Test
	public void getLatestRelease() {
		DashboardRelease dashboardRelease = new DashboardRelease();
		dashboardRelease.setId(20L);
		when(dashboardService.getCurrentDashboardRelease(eq(3L))).thenReturn(dashboardRelease);

		ResponseEntity<DashboardRelease> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards/3/releases/latest",
						HttpMethod.GET,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						DashboardRelease.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(20L, (long)response.getBody().getId());
	}

	@Test
	public void getRelease() {
		DashboardRelease dashboardRelease = new DashboardRelease();
		dashboardRelease.setId(20L);
		when(dashboardService.getReleaseByVersion(eq(3L), eq(4L))).thenReturn(dashboardRelease);

		ResponseEntity<DashboardRelease> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/dashboards/3/releases/4",
						HttpMethod.GET,
						new HttpEntity<>(new LinkedMultiValueMap<>()),
						DashboardRelease.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(20L, (long)response.getBody().getId());
	}
}