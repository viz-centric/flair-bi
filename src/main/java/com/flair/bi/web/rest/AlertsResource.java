package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.dto.ReleasesAlertsDTO;
import com.flair.bi.service.dto.ReleasesAlertsFinalDTO;
import com.flair.bi.service.handler.AlertHandler;
import com.flair.bi.service.mapper.ReleaseRequestMapper;
import com.flair.bi.web.rest.dto.ReleaseRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AlertsResource {
	
    private final ReleaseRequestService releaseRequestService;

    @GetMapping("/release-alerts/{id}/{offset}")
    @Timed
    public ResponseEntity<List<ReleasesAlertsDTO>> getReleaseAlerts(@PathVariable int id,@PathVariable int offset) {
        AlertHandler alertHandler=AlertHandler.commandReleaseAlerts.get(id);
    	List<ReleasesAlertsDTO> releaseAlerts=alertHandler.getReleaseAlerts(offset,releaseRequestService);
		return ResponseEntity.ok(releaseAlerts);
    
    }

    
    @GetMapping("/release-all-alerts")
    @Timed
    public ResponseEntity<List<ReleasesAlertsFinalDTO>> getAllReleaseAlerts() {
    	List<ReleasesAlertsFinalDTO> alerts= new ArrayList<ReleasesAlertsFinalDTO>();
    	alerts.add(new ReleasesAlertsFinalDTO(1,"Today",releaseRequestService.getTodaysReleasedAlerts(0), releaseRequestService.getTodaysReleasedAlertsCount()) );
    	alerts.add(new ReleasesAlertsFinalDTO(2,"Yesterday",releaseRequestService.getYesterdaysReleasedAlerts(0), releaseRequestService.getYesterdaysReleasedCount()) );
    	alerts.add(new ReleasesAlertsFinalDTO(3,"This Week",releaseRequestService.getThisWeekReleasedAlerts(0), releaseRequestService.getThisWeekReleasedCount()) );
    	alerts.add(new ReleasesAlertsFinalDTO(4,"Last Week",releaseRequestService.getLastWeekReleasedAlerts(0), releaseRequestService.getLastWeekReleasedCount()) );
    	alerts.add(new ReleasesAlertsFinalDTO(5,"Older",releaseRequestService.getOlderReleasedAlerts(0), releaseRequestService.getOlderReleasedCount()) );
		return ResponseEntity.ok(alerts);
    }


}
