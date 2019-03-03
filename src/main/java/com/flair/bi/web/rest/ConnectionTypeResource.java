package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.service.GrpcConnectionService;
import com.flair.bi.web.rest.dto.ConnectionTypeDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/connection-type")
public class ConnectionTypeResource {

    private final GrpcConnectionService grpcConnectionService;

    @GetMapping
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'READ', 'APPLICATION')")
    public ResponseEntity<List<ConnectionTypeDTO>> getConnections() {
        log.debug("Get connection types");
        List<ConnectionTypeDTO> connectionTypes = grpcConnectionService.getAllConnectionTypes();

        log.debug("Get connection types returned {}", connectionTypes);
        return ResponseEntity.ok(connectionTypes);
    }

}
