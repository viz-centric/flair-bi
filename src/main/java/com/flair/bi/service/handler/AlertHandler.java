package com.flair.bi.service.handler;

import java.util.List;

import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.dto.ReleasesAlertsDTO;

public interface AlertHandler {

	List<ReleasesAlertsDTO> getReleaseAlerts(int offset, ReleaseRequestService releaseRequestService);

}
