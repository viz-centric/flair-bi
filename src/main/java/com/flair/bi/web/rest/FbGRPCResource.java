package com.flair.bi.web.rest;

import java.net.URISyntaxException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.client.RestTemplate;

import com.flair.bi.messages.Query;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.SchedulerService;
import com.flair.bi.service.SendGetDataDTO;
import com.flair.bi.service.dto.FbiEngineDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerReportsDTO;
import com.flair.bi.web.rest.dto.QueryAllRequestDTO;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.util.JsonFormat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.client.RestTemplate;

import java.net.URISyntaxException;

@RequiredArgsConstructor
@Controller
@Slf4j
public class FbGRPCResource {
	@Value("${flair-notifications.host}")
	private String host;

	@Value("${flair-notifications.port}")
	private String port;

	@Value("${flair-notifications.scheduled-reports-url}")
	private String scheduledReportsUrl;

	private final GrpcQueryService grpcQueryService;

	@PreAuthorize("@accessControlManager.hasAccess(#viewId, 'READ', 'VIEW')")
    @MessageMapping("/fbi-engine-grpc/{datasourcesId}/query/{viewId}")
    public void mirrorSocket(@DestinationVariable Long datasourcesId, @DestinationVariable Long viewId, @Payload FbiEngineDTO fbiEngineDTO, SimpMessageHeaderAccessor headerAccessor) throws InterruptedException {
		grpcQueryService.sendGetDataStream(
				SendGetDataDTO.builder()
						.datasourcesId(datasourcesId)
						.userId(headerAccessor.getUser().getName())
						.visualMetadata(fbiEngineDTO.getVisualMetadata())
						.queryDTO(fbiEngineDTO.getQueryDTO())
						.visualMetadataId(fbiEngineDTO.getvId())
						.type(fbiEngineDTO.getType())
                        .validationType(fbiEngineDTO.getValidationType())
						.build()
		);
    }

    @PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'READ', 'APPLICATION')")
    @MessageMapping("/fbi-engine-grpc/queryAll")
    public void handleQueryAll(@Payload QueryAllRequestDTO requestDTO, SimpMessageHeaderAccessor headerAccessor) {
        grpcQueryService.sendQueryAll(headerAccessor.getUser().getName(), requestDTO);
    }

	@MessageMapping("fbi-engine-grpc/scheduled-reports/{pageSize}/{page}")
	public void getSchedulerReportsAndEngineData(@DestinationVariable Integer pageSize,
			@DestinationVariable Integer page) throws URISyntaxException {
		RestTemplate restTemplate = new RestTemplate();
		try {
			SchedulerReportsDTO reports = schedulerService
					.getScheduledReportsByUser(SecurityUtils.getCurrentUserLogin(), pageSize, page);
			if (reports.getMessage() != null) {
				log.error("error returned while fetching reports {}", reports.getMessage());
				throw new IllegalStateException("Cannot get scheduled reporst for user " + reports.getMessage());
			}
			for (SchedulerNotificationDTO schedulerNotificationResponseDTO : reports.getReports()) {
				pushToSocket(schedulerNotificationResponseDTO);
			}
		} catch (Exception e) {
			log.error("error occured while fetching reports:" + e.getMessage(), e);
		}
	}

	private void pushToSocket(SchedulerNotificationDTO schedulerNotificationResponseDTO)
			throws InvalidProtocolBufferException, InterruptedException {
		Query.Builder builder = Query.newBuilder();
		JsonFormat.parser().merge(schedulerNotificationResponseDTO.getQuery(), builder);
		Query query = builder.build();
		grpcQueryService.callGrpcBiDirectionalAndPushInSocket(schedulerNotificationResponseDTO, query,
				"scheduled-report", query.getUserId());
	}

}
