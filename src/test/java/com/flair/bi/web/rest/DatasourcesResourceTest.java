package com.flair.bi.web.rest;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.ZonedDateTime;
import java.util.Arrays;

import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.Datasource;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.GrpcConnectionService;
import com.flair.bi.service.dto.ConnectionFilterParamsDTO;
import com.flair.bi.service.dto.CountDTO;
import com.flair.bi.service.dto.DeleteInfo;
import com.flair.bi.service.dto.ListTablesResponseDTO;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import com.flair.bi.web.rest.dto.DatasourceDTO;
import com.querydsl.core.types.Predicate;

@Ignore
public class DatasourcesResourceTest extends AbstractIntegrationTest {

	@MockBean
	DatasourceService datasourceService;

	@MockBean
	DashboardService dashboardService;

	@MockBean
	GrpcConnectionService grpcConnectionService;

	@Test
	public void createDatasources() {
		Datasource datasource = new Datasource();
		datasource.setName("dbname");
		datasource.setConnectionName("connName");
		datasource.setLastUpdated(ZonedDateTime.now());
		datasource.setQueryPath("querypath");

		Datasource datasourceWithId = new Datasource();
		datasourceWithId.setName("dbname");
		datasourceWithId.setConnectionName("connName");
		datasourceWithId.setLastUpdated(ZonedDateTime.now());
		datasourceWithId.setQueryPath("querypath");
		datasourceWithId.setId(1L);
		when(datasourceService.save(any(Datasource.class))).thenReturn(datasourceWithId);

		ResponseEntity<Datasource> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources", HttpMethod.POST, new HttpEntity<>(datasource), Datasource.class);

		assertEquals(1L, (long) response.getBody().getId());
		assertEquals("dbname", response.getBody().getName());
		assertEquals("connName", response.getBody().getConnectionName());
		assertEquals(HttpStatus.CREATED, response.getStatusCode());
	}

	@Test
	public void createDatasourcesDbExists() {
		Datasource datasource = new Datasource();
		datasource.setName("dbname");
		datasource.setConnectionName("connName");
		datasource.setLastUpdated(ZonedDateTime.now());
		datasource.setQueryPath("querypath");
		datasource.setId(1L);

		when(datasourceService.save(any(Datasource.class))).thenReturn(datasource);

		ResponseEntity<Datasource> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources", HttpMethod.POST, new HttpEntity<>(datasource), Datasource.class);

		assertNull(response.getBody());
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
	}

	@Test
	public void updateDatasourcesCreatesDatasource() {
		Datasource datasource = new Datasource();
		datasource.setName("dbname");
		datasource.setConnectionName("connName");
		datasource.setLastUpdated(ZonedDateTime.now());
		datasource.setQueryPath("querypath");

		Datasource datasourceWithId = new Datasource();
		datasourceWithId.setName("dbname");
		datasourceWithId.setConnectionName("connName");
		datasourceWithId.setLastUpdated(ZonedDateTime.now());
		datasourceWithId.setQueryPath("querypath");
		datasourceWithId.setId(1L);
		when(datasourceService.save(any(Datasource.class))).thenReturn(datasourceWithId);

		ResponseEntity<Datasource> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources", HttpMethod.PUT, new HttpEntity<>(datasource), Datasource.class);

		assertEquals(1L, (long) response.getBody().getId());
		assertEquals("dbname", response.getBody().getName());
		assertEquals("connName", response.getBody().getConnectionName());
		assertEquals(HttpStatus.CREATED, response.getStatusCode());
	}

	@Test
	public void updateDatasources() {
		Datasource datasourceWithId = new Datasource();
		datasourceWithId.setName("dbname");
		datasourceWithId.setConnectionName("connName");
		datasourceWithId.setLastUpdated(ZonedDateTime.now());
		datasourceWithId.setQueryPath("querypath");
		datasourceWithId.setId(1L);
		when(datasourceService.save(any(Datasource.class))).thenReturn(datasourceWithId);

		ResponseEntity<Datasource> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources", HttpMethod.PUT, new HttpEntity<>(datasourceWithId), Datasource.class);

		assertEquals(1L, (long) response.getBody().getId());
		assertEquals("dbname", response.getBody().getName());
		assertEquals("connName", response.getBody().getConnectionName());
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void getAllDatasources() {
		Datasource datasourceWithId = new Datasource();
		datasourceWithId.setName("dbname");
		datasourceWithId.setConnectionName("connName");
		datasourceWithId.setLastUpdated(ZonedDateTime.now());
		datasourceWithId.setQueryPath("querypath");
		datasourceWithId.setId(1L);
		when(datasourceService.findAll(any(Predicate.class))).thenReturn(Arrays.asList(datasourceWithId));
		ConnectionDTO connectionDTO = new ConnectionDTO();
		connectionDTO.setId(77L);
		connectionDTO.setLinkId("connName");
		when(grpcConnectionService.getAllConnections(any(ConnectionFilterParamsDTO.class)))
				.thenReturn(Arrays.asList(connectionDTO));

		ResponseEntity<DatasourceDTO[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources", HttpMethod.GET, new HttpEntity<>(datasourceWithId),
				DatasourceDTO[].class);

		DatasourceDTO ds = response.getBody()[0];
		assertEquals(1L, (long) ds.getId());
		assertEquals("dbname", ds.getName());
		assertEquals("connName", ds.getConnectionName());
		assertEquals(77L, (long) ds.getConnectionId());
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void getAllDatasourceById() {
		Datasource datasourceWithId = new Datasource();
		datasourceWithId.setName("dbname");
		datasourceWithId.setConnectionName("connName");
		datasourceWithId.setLastUpdated(ZonedDateTime.now());
		datasourceWithId.setQueryPath("querypath");
		datasourceWithId.setId(1L);
		when(datasourceService.findOne(eq(3L))).thenReturn(datasourceWithId);

		ResponseEntity<Datasource> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources/3", HttpMethod.GET, new HttpEntity<>(datasourceWithId), Datasource.class);

		Datasource ds = response.getBody();
		assertEquals(1L, (long) ds.getId());
		assertEquals("dbname", ds.getName());
		assertEquals("connName", ds.getConnectionName());
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void deleteDatasources() {
		ResponseEntity<String> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources/3", HttpMethod.DELETE, new HttpEntity<>(new LinkedMultiValueMap<>()),
				String.class);

		verify(datasourceService, times(1)).delete(eq(3L));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void getCount() {
		when(datasourceService.getCount(isNull(Predicate.class))).thenReturn(3L);

		ResponseEntity<CountDTO> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources/count", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				CountDTO.class);

		CountDTO ds = response.getBody();
		assertEquals(3L, (long) ds.getCount());
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void deleteDatasourcesByPredicate() {
		ResponseEntity<String> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources", HttpMethod.DELETE, new HttpEntity<>(new LinkedMultiValueMap<>()),
				String.class);

		verify(datasourceService, times(1)).delete(isNull(Predicate.class));

		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	public void getDatasourceDeleteInfo() {
		Dashboard dashboard = new Dashboard();
		dashboard.setDashboardName("my dashboard");
		when(dashboardService.findAllByDatasourceIds(eq(Arrays.asList(3L)))).thenReturn(Arrays.asList(dashboard));

		ResponseEntity<DeleteInfo[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources/3/deleteInfo", HttpMethod.GET,
				new HttpEntity<>(new LinkedMultiValueMap<>()), DeleteInfo[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("Dashboard", response.getBody()[0].getType());
		assertEquals("my dashboard", response.getBody()[0].getName());
	}

	@Test
	public void listTables() {
		DatasourcesResource.ListTablesRequest request = new DatasourcesResource.ListTablesRequest();
		request.setConnectionLinkId("linkid");
		request.setSearchTerm("term");
		request.setConnection(new ConnectionDTO());

		ListTablesResponseDTO dto = new ListTablesResponseDTO();
		dto.setTableNames(Arrays.asList("one", "two"));
		when(grpcConnectionService.listTables(eq("linkid"), eq("term"), any(ConnectionDTO.class), eq(10)))
				.thenReturn(dto);

		ResponseEntity<ListTablesResponseDTO> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources/listTables", HttpMethod.POST, new HttpEntity<>(request),
				ListTablesResponseDTO.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("one", response.getBody().getTableNames().get(0));
		assertEquals("two", response.getBody().getTableNames().get(1));
	}

	@Test
	public void getSearchedDatasources() {
		Datasource ds1 = new Datasource();
		ds1.setId(1L);
		Datasource ds2 = new Datasource();
		ds2.setId(2L);
		when(datasourceService.search(any(Pageable.class), any(Predicate.class)))
				.thenReturn(new PageImpl<>(Arrays.asList(ds1, ds2)));

		ResponseEntity<Datasource[]> response = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
				getUrl() + "/api/datasources/search", HttpMethod.GET, new HttpEntity<>(new LinkedMultiValueMap<>()),
				Datasource[].class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(1L, (long) response.getBody()[0].getId());
		assertEquals(2L, (long) response.getBody()[1].getId());
	}
}