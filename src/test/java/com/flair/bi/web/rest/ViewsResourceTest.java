package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.domain.ViewState;
import com.flair.bi.domain.viewwatch.ViewWatch;
import com.flair.bi.domain.viewwatch.ViewWatchId;
import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.repository.ViewRepository;
import com.flair.bi.repository.ViewWatchRepository;
import com.flair.bi.service.dto.CountDTO;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.dto.CreateViewReleaseRequestDTO;
import com.querydsl.core.types.Predicate;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Ignore
public class ViewsResourceTest extends AbstractIntegrationTest {

	@MockBean
	ViewService viewService;

	@MockBean
	UserRepository userRepository;

	@MockBean
	ViewWatchRepository viewWatchRepository;

	@MockBean
	ViewRepository viewRepository;

	@MockBean
	ReleaseRequestService releaseRequestService;

	@Test
	public void createViewsFails() {
		View request = new View();
		request.setId(15L);
		request.setViewName("view name");
		request.setPublished(true);
		Dashboard viewDashboard = new Dashboard();
		viewDashboard.setId(19L);
		request.setViewDashboard(viewDashboard);

		ResponseEntity<View> response = restTemplate.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/views", HttpMethod.POST, new HttpEntity<>(request), View.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
	}

	@Test
	public void createViews() {
		View request = new View();
		request.setViewName("view name");
		request.setPublished(true);
		Dashboard viewDashboard = new Dashboard();
		viewDashboard.setId(19L);
		request.setViewDashboard(viewDashboard);

		View request2 = new View();
		request2.setId(18L);
		request2.setViewName("view name");
		request2.setPublished(true);
		request2.setViewDashboard(viewDashboard);

		when(viewService.save(any(View.class))).thenReturn(request2);

		ResponseEntity<View> response = restTemplate.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/views", HttpMethod.POST, new HttpEntity<>(request), View.class);

		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals("view name", response.getBody().getViewName());
		assertEquals(18L, (long) response.getBody().getId());
	}

	@Test
	public void updateViews() {
		View request = new View();
		request.setId(18L);
		request.setViewName("view name");
		request.setPublished(true);
		Dashboard viewDashboard = new Dashboard();
		viewDashboard.setId(19L);
		request.setViewDashboard(viewDashboard);

		View request2 = new View();
		request2.setId(18L);
		request2.setViewName("view name");
		request2.setPublished(true);
		request2.setViewDashboard(viewDashboard);

		when(viewService.save(any(View.class))).thenReturn(request2);

		ResponseEntity<View> response = restTemplate.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/views", HttpMethod.PUT, new HttpEntity<>(request), View.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("view name", response.getBody().getViewName());
		assertEquals(18L, (long) response.getBody().getId());
	}

	@Test
	public void getAllViews() {
		View request = new View();
		request.setId(18L);
		request.setViewName("view name");
		request.setPublished(true);
		Dashboard viewDashboard = new Dashboard();
		viewDashboard.setId(19L);
		request.setViewDashboard(viewDashboard);

		when(viewService.findAllByPrincipalPermissions(any(Predicate.class))).thenReturn(Arrays.asList(request));

		ResponseEntity<View[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()), View[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("view name", response.getBody()[0].getViewName());
		assertEquals(18L, (long) response.getBody()[0].getId());
	}

	@Test
	public void getViewsCount() {
		when(viewService.countByPrincipalPermissions()).thenReturn(7L);

		ResponseEntity<CountDTO> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views/count", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				CountDTO.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(7L, (long) response.getBody().getCount());
	}

	@Test
	public void getRecentlyCreated() {
		View request = new View();
		request.setId(18L);
		request.setViewName("view name");
		request.setPublished(true);
		Dashboard viewDashboard = new Dashboard();
		viewDashboard.setId(19L);
		request.setViewDashboard(viewDashboard);

		when(viewService.recentlyCreated()).thenReturn(Arrays.asList(request));

		ResponseEntity<View[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views/recentlyCreated", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				View[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("view name", response.getBody()[0].getViewName());
		assertEquals(18L, (long) response.getBody()[0].getId());
	}

	@Test
	public void getMostPopular() {
		View request = new View();
		request.setId(18L);
		request.setViewName("view name");
		request.setPublished(true);
		Dashboard viewDashboard = new Dashboard();
		viewDashboard.setId(19L);
		request.setViewDashboard(viewDashboard);

		when(viewService.mostPopular()).thenReturn(Arrays.asList(request));

		ResponseEntity<View[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views/mostPopular", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				View[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("view name", response.getBody()[0].getViewName());
		assertEquals(18L, (long) response.getBody()[0].getId());
	}

	@Test
	public void getViews() {
		View request = new View();
		request.setId(18L);
		request.setViewName("view name");
		request.setPublished(true);
		Dashboard viewDashboard = new Dashboard();
		viewDashboard.setId(19L);
		request.setViewDashboard(viewDashboard);

		when(viewService.findOne(eq(5L))).thenReturn(request);
		when(userRepository.findOneByLogin(anyString())).thenReturn(Optional.of(new User()));
		when(viewWatchRepository.getOne(any(ViewWatchId.class))).thenReturn(new ViewWatch());

		ResponseEntity<View> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views/5", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()), View.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("view name", response.getBody().getViewName());
		assertEquals(18L, (long) response.getBody().getId());
	}

	@Test
	public void deleteViews() {
		ResponseEntity<View> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views/5", HttpMethod.DELETE, new HttpEntity<>(new LinkedMultiValueMap<>()),
				View.class);

		verify(viewService, times(1)).delete(eq(5L));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void getCurrentEditingState() {
		ViewState t = new ViewState();
		t.setId("16");

		when(viewService.getCurrentEditingViewState(eq(5L))).thenReturn(t);

		ResponseEntity<ViewState> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views/5/viewState", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				ViewState.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("16", response.getBody().getId());
	}

	@Test
	public void bulkSave() {
		SaveViewStateDTO dto = new SaveViewStateDTO();
		dto.setId("16");

		ViewState viewState = new ViewState();
		viewState.setId("16");
		when(viewService.saveViewState(eq(5L), any(ViewState.class))).thenReturn(viewState);

		ResponseEntity<ViewState> response = restTemplate.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/views/5/viewState", HttpMethod.PUT, new HttpEntity<>(dto), ViewState.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("16", response.getBody().getId());
	}

	@Test
	public void requestRelease() {
		CreateViewReleaseRequestDTO dto = new CreateViewReleaseRequestDTO();
		dto.setComment("my comment");

		ReleaseRequest releaseRequest = new ReleaseRequest();
		releaseRequest.setComment("my comment");
		when(releaseRequestService.requestRelease(any(ViewRelease.class))).thenReturn(releaseRequest);
		View view = new View();
		when(viewService.findOne(eq(5L))).thenReturn(view);

		ResponseEntity<ReleaseRequest> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views/5/requestRelease", HttpMethod.PUT, new HttpEntity<>(dto), ReleaseRequest.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("my comment", response.getBody().getComment());
	}

	@Test
	public void getViewReleases() {
		ViewRelease viewRelease = new ViewRelease();
		viewRelease.setComment("my comment");

		when(viewService.getViewReleases(eq(5L))).thenReturn(Arrays.asList(viewRelease));

		ResponseEntity<ViewRelease[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views/5/releases", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				ViewRelease[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("my comment", response.getBody()[0].getComment());
	}

	@Test
	public void getLatestRelease() {
		ViewRelease viewRelease = new ViewRelease();
		viewRelease.setComment("my comment");

		when(viewService.getCurrentViewStateRelease(eq(5L))).thenReturn(viewRelease);

		ResponseEntity<ViewRelease> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views/5/releases/latest", HttpMethod.GET,
				new HttpEntity<>(new LinkedMultiValueMap<>()), ViewRelease.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("my comment", response.getBody().getComment());
	}

	@Test
	public void getRelease() {
		ViewRelease viewRelease = new ViewRelease();
		viewRelease.setComment("my comment");

		when(viewService.getReleaseViewStateByVersion(eq(5L), eq(17L))).thenReturn(viewRelease);

		ResponseEntity<ViewRelease> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/views/5/releases/17", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				ViewRelease.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("my comment", response.getBody().getComment());
	}
}