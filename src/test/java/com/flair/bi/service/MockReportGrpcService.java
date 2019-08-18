package com.flair.bi.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Profile("test")
@Service
public class MockReportGrpcService extends AbstractReportGrpcService {

    public MockReportGrpcService() {
        super();
    }
}
