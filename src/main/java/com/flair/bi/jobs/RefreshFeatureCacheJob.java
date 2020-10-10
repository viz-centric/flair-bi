package com.flair.bi.jobs;

import com.flair.bi.service.cache.RefreshFeatureCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshFeatureCacheJob {

    private final RefreshFeatureCacheService refreshFeatureCacheService;

    @Scheduled(cron = "${app.jobs.refresh-feature-cache-job-weekdays.cron}")
    @SchedulerLock(name = "refresh-feature-cache-job-weekdays")
    public void runJob() {
        log.info("Refresh feature cache job weekdays started");

        refreshFeatureCacheService.refresh();

        log.info("Refresh feature cache job weekdays finished");
    }

    @Scheduled(cron = "${app.jobs.refresh-feature-cache-job-weekends.cron}")
    @SchedulerLock(name = "refresh-feature-cache-job-weekends")
    public void runJob2() {
        log.info("Refresh feature cache job weekends started");

        refreshFeatureCacheService.refresh();

        log.info("Refresh feature cache job weekends finished");
    }
}
