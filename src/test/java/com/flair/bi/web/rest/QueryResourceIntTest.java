package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.service.GrpcConnectionService;
import com.flair.bi.service.dto.TestConnectionResultDTO;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.io.IOException;
import java.util.HashMap;

import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.when;

@Ignore
public class QueryResourceIntTest extends AbstractIntegrationTest {

    @MockBean
    GrpcConnectionService grpcConnectionService;

    @Test
    public void testConnectionWith() throws IOException {
        when(grpcConnectionService.testConnection(eq("linkid"), eq("sales"), any(ConnectionDTO.class)))
            .thenReturn(new TestConnectionResultDTO()
                .setSuccess(true));


        HashMap<Object, Object> request = new HashMap<>();
        request.put("connectionLinkId", "linkid");
        request.put("datasourceName", "sales");
        request.put("connection", new HashMap<>());

        TestConnectionResultDTO result = restTemplate
            .withBasicAuth("flairuser", "flairpass")
            .postForObject(getUrl() + "/api/query/test", request, TestConnectionResultDTO.class);


        assertTrue(result.isSuccess());
    }

}
