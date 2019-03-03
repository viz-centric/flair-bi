package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.Information;
import com.flair.bi.service.InformationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InformationResource {

    private final InformationService informationService;

    @GetMapping("/information")
    @Timed
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Information>> getAllInformation() {
        return ResponseEntity.ok(informationService.getAll());
    }
    
    @GetMapping("/information/based-on-viewport/{isDesktop}")
    @Timed
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Information>> getAllInformation(@PathVariable Boolean isDesktop) {
        return ResponseEntity.ok(informationService.getAll(isDesktop));
    }
}
