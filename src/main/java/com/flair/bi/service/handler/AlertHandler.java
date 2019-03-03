package com.flair.bi.service.handler;

import java.util.List;
import java.util.*;

import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.dto.ReleasesAlertsDTO;

public interface AlertHandler {

	public List<ReleasesAlertsDTO> getReleaseAlerts(int offset,ReleaseRequestService releaseRequestService);
	
	Map<Integer,AlertHandler> commandReleaseAlerts = new HashMap<Integer, AlertHandler>(){
		private static final long serialVersionUID = 1L;
	{
	       put(1,new TodaysAlertHandler()); put(2,new YesterdaysAlertHandler());
	       put(3,new ThisWeeksAlertHandler()); put(4,new LastWeeksAlertHandler());
	       put(5,new OlderAlertHandler());
	}};
}
