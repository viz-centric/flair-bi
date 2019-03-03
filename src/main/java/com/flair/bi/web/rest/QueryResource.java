package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.service.GrpcConnectionService;
import com.flair.bi.service.dto.TestConnectionResultDTO;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.io.IOException;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/query")
public class QueryResource {

    private final GrpcConnectionService grpcConnectionService;

    @PostMapping("/test")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'READ', 'APPLICATION')")
    public ResponseEntity<TestConnectionResultDTO> testConnection(@Valid @RequestBody TestConnectionRequest request) throws IOException {
        log.info("Connection test {}", request);

        TestConnectionResultDTO result = grpcConnectionService.testConnection(request.getConnectionLinkId(), request.getDatasourceName(),
            request.getConnection());

        return ResponseEntity.ok(result);
    }

    @Data
    private static class TestConnectionRequest {
        String connectionLinkId;
        @NotNull
        String datasourceName;
        ConnectionDTO connection;
    }

}
