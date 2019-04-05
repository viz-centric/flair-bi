package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.service.GrpcConnectionService;
import com.flair.bi.web.rest.dto.ConnectionTypeDTO;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;
@Ignore
public class ConnectionTypeResourceTest extends AbstractIntegrationTest {

    @MockBean
    private GrpcConnectionService grpcConnectionService;

    @Before
    public void setUp() throws Exception {
    }

    @Test
    public void getConnections() {
        ConnectionTypeDTO dto = new ConnectionTypeDTO();
        dto.setId(1L);
        dto.setName("nm");
        dto.setBundleClass("bundle");
        when(grpcConnectionService.getAllConnectionTypes()).thenReturn(Arrays.asList(dto));

        List result = restTemplate.withBasicAuth("flairuser", "flairpass")
                .getForObject(getUrl() + "/api/connection-type", List.class);

        assertEquals(result.size(), 1);

        HashMap connection = (HashMap) result.get(0);

        assertEquals(1, connection.get("id"));
        assertEquals("nm", connection.get("name"), "nm");
        assertEquals("bundle", connection.get("bundleClass"));
    }
}
