package com.flair.bi.service.handler;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.dto.ReleasesAlertsDTO;

@Service
public class OlderAlertHandler implements AlertHandler {

	public OlderAlertHandler() {
	}

	@Override
	public List<ReleasesAlertsDTO> getReleaseAlerts(int offset, ReleaseRequestService releaseRequestService) {
		return releaseRequestService.getOlderReleasedAlerts(offset);
	}

}
