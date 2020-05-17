package com.flair.bi.web.rest;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.domain.Information;
import com.flair.bi.service.InformationService;

import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;

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
