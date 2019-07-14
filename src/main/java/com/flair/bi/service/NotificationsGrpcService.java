package com.flair.bi.service;

import com.flair.bi.messages.report.ReportServiceGrpc;
import com.flair.bi.websocket.grpc.config.ManagedChannelFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@Profile("!test")
public class NotificationsGrpcService implements INotificationsGrpcService {

    private final ManagedChannelFactory managedChannelFactory;

    @Autowired
    public NotificationsGrpcService(@Qualifier("notificationsChannelFactory") ManagedChannelFactory managedChannelFactory) {
        this.managedChannelFactory = managedChannelFactory;
    }

    private ReportServiceGrpc.ReportServiceBlockingStub getReportStub() {
        return ReportServiceGrpc.newBlockingStub(managedChannelFactory.getInstance());
    }

}
