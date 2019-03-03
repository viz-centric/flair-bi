package com.flair.bi.web.rest;


import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.mapper.ReleaseRequestMapper;
import com.flair.bi.web.rest.dto.ReleaseRequestDTO;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity.BodyBuilder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collection;

/**
 * REST controller for managing Releases.
 */
@RestController
@RequestMapping("/api/releases")
@RequiredArgsConstructor
public class ReleaseResource {

    private final ReleaseRequestService releaseRequestService;

    private final ReleaseRequestMapper releaseRequestMapper;

    @GetMapping
    @Timed
    public ResponseEntity<Collection<ReleaseRequestDTO>> getRequests() {
        return ResponseEntity.ok(releaseRequestMapper.releaseRequestsToReleaseRequestDTOs(new ArrayList<>(releaseRequestService.getAllRequests())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReleaseRequest> getRequest(@PathVariable Long id) {
        return ResponseEntity.ok(releaseRequestService.getRequestById(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        releaseRequestService.approveRelease(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        releaseRequestService.rejectRelease(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }


}
