package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.Datasource;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.GrpcConnectionService;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.dto.ConnectionFilterParamsDTO;
import com.flair.bi.service.dto.RunQueryResponseDTO;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import com.google.common.collect.ImmutableMap;
import com.project.bi.query.dto.QueryDTO;

import org.junit.Ignore;
import org.junit.Test;
import org.mockito.stubbing.Answer;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.when;

@Ignore
public class ConnectionResourceTest extends AbstractIntegrationTest {

    @MockBean
    GrpcConnectionService grpcConnectionService;
    @MockBean
    DatasourceService datasourceService;
    @MockBean
    DashboardService dashboardService;
    @MockBean
    GrpcQueryService grpcQueryService;

    @Test
    public void getConnections() {
        when(grpcConnectionService.getAllConnections(any(ConnectionFilterParamsDTO.class)))
                .thenReturn(Arrays.asList(new ConnectionDTO().setId(1L).setConnectionTypeId(2L)
                        .setDetails(ImmutableMap.of("one", "two", "three", "four")).setLinkId("linkid").setName("name")
                        .setConnectionPassword("pwd").setConnectionUsername("usr")));

        List result = restTemplate.withBasicAuth("flairuser", "flairpass").getForObject(getUrl() + "/api/connection",
                List.class);
        HashMap connection = (HashMap) result.get(0);

        assertEquals(1, result.size());
        assertEquals(1, connection.get("id"));
        assertEquals(2, connection.get("connectionTypeId"));
        assertEquals(ImmutableMap.of("one", "two", "three", "four"), connection.get("details"));
        assertEquals("linkid", connection.get("linkId"));
        assertEquals("name", connection.get("name"));
        assertEquals("pwd", connection.get("connectionPassword"));
        assertEquals("usr", connection.get("connectionUsername"));
    }

    @Test
    public void testSaveConnection() {
        when(grpcConnectionService.saveConnection(any(ConnectionDTO.class))).thenAnswer(
                (Answer<ConnectionDTO>) invocationOnMock -> invocationOnMock.getArgumentAt(0, ConnectionDTO.class));

        ConnectionDTO inputConnection = new ConnectionDTO();
        ConnectionDTO outputConnection = restTemplate.withBasicAuth("flairuser", "flairpass")
                .postForObject(getUrl() + "/api/connection", inputConnection, ConnectionDTO.class);

        assertEquals(inputConnection, outputConnection);
    }

    @Test
    public void testUpdateConnection() {
        when(grpcConnectionService.updateConnection(any(ConnectionDTO.class))).thenAnswer(
                (Answer<ConnectionDTO>) invocationOnMock -> invocationOnMock.getArgumentAt(0, ConnectionDTO.class));

        ConnectionDTO inputConnection = new ConnectionDTO();

        ResponseEntity<ConnectionDTO> outputConnection = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
                getUrl() + "/api/connection", HttpMethod.PUT, new HttpEntity<>(inputConnection), ConnectionDTO.class);

        assertEquals(inputConnection, outputConnection.getBody());
    }

    @Test
    public void testFetchFeatures() {
        Datasource datasource = new Datasource();
        when(datasourceService.findOne(101L)).thenReturn(datasource);

        QueryDTO dto = new QueryDTO();

        when(grpcQueryService.sendRunQuery(any(QueryDTO.class), eq(datasource)))
                .thenReturn(new RunQueryResponseDTO().setResult(ImmutableMap.of("one", "two")));

        ResponseEntity<Map> result = restTemplate.withBasicAuth("flairuser", "flairpass")
                .exchange(getUrl() + "/api/connection/features/101", HttpMethod.POST, new HttpEntity<>(dto), Map.class);

        assertEquals("two", result.getBody().get("one"));
    }

    @Test
    public void testFetchFeaturesFailsIfDatasourceIsNotFound() {
        QueryDTO dto = new QueryDTO();

        ResponseEntity<Map> result = restTemplate.withBasicAuth("flairuser", "flairpass")
                .exchange(getUrl() + "/api/connection/features/101", HttpMethod.POST, new HttpEntity<>(dto), Map.class);

        assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode());
    }

    @Test
    public void testFetchFeaturesFailsIfRunQueryReturnsNull() {
        Datasource datasource = new Datasource();
        when(datasourceService.findOne(101L)).thenReturn(datasource);

        QueryDTO dto = new QueryDTO();

        when(grpcQueryService.sendRunQuery(any(QueryDTO.class), eq(datasource))).thenReturn(new RunQueryResponseDTO());

        ResponseEntity<Map> result = restTemplate.withBasicAuth("flairuser", "flairpass")
                .exchange(getUrl() + "/api/connection/features/101", HttpMethod.POST, new HttpEntity<>(dto), Map.class);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());
    }

    @Test
    public void testGetConnection() {
        ConnectionDTO dto = new ConnectionDTO();

        when(grpcConnectionService.getConnection(eq(177L))).thenReturn(dto);

        ResponseEntity<ConnectionDTO> outputConnection = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
                getUrl() + "/api/connection/177", HttpMethod.GET, new HttpEntity<>(null), ConnectionDTO.class);

        assertEquals(dto, outputConnection.getBody());
    }

    @Test
    public void testDeleteConnectionSucceeds() {
        when(grpcConnectionService.deleteConnection(eq(177L))).thenReturn(true);

        ResponseEntity<ConnectionDTO> outputConnection = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
                getUrl() + "/api/connection/177", HttpMethod.DELETE, new HttpEntity<>(null), ConnectionDTO.class);

        assertEquals(HttpStatus.OK, outputConnection.getStatusCode());
    }

    @Test
    public void testDeleteConnectionFails() {
        when(grpcConnectionService.deleteConnection(eq(177L))).thenReturn(false);

        ResponseEntity<ConnectionDTO> outputConnection = restTemplate.withBasicAuth("flairuser", "flairpass").exchange(
                getUrl() + "/api/connection/177", HttpMethod.DELETE, new HttpEntity<>(null), ConnectionDTO.class);

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, outputConnection.getStatusCode());
    }
}
