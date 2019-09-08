package com.flair.bi.service.handler;

import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.dto.ReleasesAlertsDTO;

import java.util.List;

public interface AlertHandler {

	List<ReleasesAlertsDTO> getReleaseAlerts(int offset, ReleaseRequestService releaseRequestService);

}
