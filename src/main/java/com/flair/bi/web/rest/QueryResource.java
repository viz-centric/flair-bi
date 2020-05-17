package com.flair.bi.web.rest;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.GrpcConnectionService;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.dto.TestConnectionResultDTO;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import com.flair.bi.web.rest.dto.QueryAllRequestDTO;

import io.micrometer.core.annotation.Timed;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/query")
public class QueryResource {

    private final GrpcConnectionService grpcConnectionService;

    private final GrpcQueryService gprcService;

    @PostMapping("/test")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'READ', 'APPLICATION')")
    public ResponseEntity<TestConnectionResultDTO> testConnection(@Valid @RequestBody TestConnectionRequest request) {
        log.info("Connection test {}", request);

        TestConnectionResultDTO result = grpcConnectionService.testConnection(request.getConnection());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/execute")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'READ', 'APPLICATION')")
    public ResponseEntity<String> executeQuery(@RequestBody QueryAllRequestDTO requestDTO) {
        return ResponseEntity.ok(gprcService.queryAll(SecurityUtils.getCurrentUserLogin(), requestDTO).getData());
    }

    @Data
    private static class TestConnectionRequest {
        @NotNull
        ConnectionDTO connection;
    }

}
