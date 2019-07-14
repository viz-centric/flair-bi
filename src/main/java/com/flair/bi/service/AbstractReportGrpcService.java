package com.flair.bi.service;

import com.flair.bi.messages.report.ReportServiceGrpc;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public abstract class AbstractReportGrpcService extends ReportServiceGrpc.ReportServiceImplBase {
}
