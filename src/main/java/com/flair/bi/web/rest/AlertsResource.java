package com.flair.bi.web.rest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.dto.ReleasesAlertsDTO;
import com.flair.bi.service.dto.ReleasesAlertsFinalDTO;
import com.flair.bi.service.handler.AlertHandler;
import com.flair.bi.service.handler.LastWeeksAlertHandler;
import com.flair.bi.service.handler.OlderAlertHandler;
import com.flair.bi.service.handler.ThisWeeksAlertHandler;
import com.flair.bi.service.handler.TodaysAlertHandler;
import com.flair.bi.service.handler.YesterdaysAlertHandler;

import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AlertsResource {

	private static final Map<Integer, AlertHandler> commandReleaseAlerts = new HashMap<Integer, AlertHandler>() {
		private static final long serialVersionUID = 1L;
		{
			put(1, new TodaysAlertHandler());
			put(2, new YesterdaysAlertHandler());
			put(3, new ThisWeeksAlertHandler());
			put(4, new LastWeeksAlertHandler());
			put(5, new OlderAlertHandler());
		}
	};

	private final ReleaseRequestService releaseRequestService;

	@GetMapping("/release-alerts/{id}/{offset}")
	@Timed
	public ResponseEntity<List<ReleasesAlertsDTO>> getReleaseAlerts(@PathVariable int id, @PathVariable int offset) {
		AlertHandler alertHandler = commandReleaseAlerts.get(id);
		List<ReleasesAlertsDTO> releaseAlerts = alertHandler.getReleaseAlerts(offset, releaseRequestService);
		return ResponseEntity.ok(releaseAlerts);

	}

	@GetMapping("/release-all-alerts")
	@Timed
	public ResponseEntity<List<ReleasesAlertsFinalDTO>> getAllReleaseAlerts() {
		List<ReleasesAlertsFinalDTO> alerts = new ArrayList<ReleasesAlertsFinalDTO>();
		alerts.add(new ReleasesAlertsFinalDTO(1, "Today", releaseRequestService.getTodaysReleasedAlerts(0),
				releaseRequestService.getTodaysReleasedAlertsCount()));
		alerts.add(new ReleasesAlertsFinalDTO(2, "Yesterday", releaseRequestService.getYesterdaysReleasedAlerts(0),
				releaseRequestService.getYesterdaysReleasedCount()));
		alerts.add(new ReleasesAlertsFinalDTO(3, "This Week", releaseRequestService.getThisWeekReleasedAlerts(0),
				releaseRequestService.getThisWeekReleasedCount()));
		alerts.add(new ReleasesAlertsFinalDTO(4, "Last Week", releaseRequestService.getLastWeekReleasedAlerts(0),
				releaseRequestService.getLastWeekReleasedCount()));
		alerts.add(new ReleasesAlertsFinalDTO(5, "Older", releaseRequestService.getOlderReleasedAlerts(0),
				releaseRequestService.getOlderReleasedCount()));
		return ResponseEntity.ok(alerts);
	}

}
