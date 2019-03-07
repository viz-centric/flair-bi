package com.flair.bi.release;

import com.flair.bi.domain.Release;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.service.dto.ReleasesAlertsDTO;

import java.util.Collection;
import java.util.List;

/**
 * Service responsible for handling and managing Releases and release requests
 * <p>
 * It manages release requests, approves and rejects them
 */
public interface ReleaseRequestService {

    /**
     * Get all requests that correspond to releases that are in pending state
     *
     * @return collection of {@link ReleaseRequest}
     */
    Collection<ReleaseRequest> getAllRequests();

    /**
     * Retrieve a {@link ReleaseRequest} by id
     *
     * @param id id of a release request
     * @return release request or null
     */
    ReleaseRequest getRequestById(Long id);

    /**
     * Approves the release
     *
     * @param requestId request id
     */
    void approveRelease(Long requestId);

    /**
     * Rejects the release
     *
     * @param requestId request id
     */
    void rejectRelease(Long requestId);

    /**
     * Make a request for a release
     *
     * @param release release to be requested
     * @return created request for given release
     */
    ReleaseRequest requestRelease(Release release);
    
    
    /**
     * Make a request for todays release alerts
     * @param offset TODO
     *
     * @return created for todays alerts  releases
     */
    
    List<ReleasesAlertsDTO> getTodaysReleasedAlerts(int offset);
    
    /**
     * Make a request for todays release alerts
     *
     * @param offset offset
     * @return created for todays alerts  releases
     */
    
    List<ReleasesAlertsDTO> getYesterdaysReleasedAlerts(int offset);
    
    /**
     * Make a request for todays release alerts
     *
     * @param offset offset
     * @return created for todays alerts  releases
     */
    
    List<ReleasesAlertsDTO> getThisWeekReleasedAlerts(int offset);
    
    
    List<ReleasesAlertsDTO> getLastWeekReleasedAlerts(int offset);
    
    
    List<ReleasesAlertsDTO> getOlderReleasedAlerts(int offset);
    
    
   int getTodaysReleasedAlertsCount();
    
    
   int getYesterdaysReleasedCount();
    
    
   int getThisWeekReleasedCount();
    
    
   int getLastWeekReleasedCount();
    
    
   int getOlderReleasedCount();
    
    
    
    
}
