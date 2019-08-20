package com.flair.bi.service;

import org.lognet.springboot.grpc.GRpcService;
import org.springframework.context.annotation.Profile;

@GRpcService
@Profile("!test")
public class ReportGrpcService extends AbstractReportGrpcService {
}
