package com.flair.bi.web.rest;

import com.flair.bi.messages.Query;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.SchedulerService;
import com.flair.bi.service.dto.FbiEngineDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationResponseDTO;
import com.flair.bi.web.rest.dto.QueryAllRequestDTO;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.util.JsonFormat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.net.URISyntaxException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.client.RestTemplate;

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

    private final SchedulerService schedulerService;


    @MessageMapping("/fbi-engine-grpc/{datasourcesId}/query")
    public void mirrorSocket(@DestinationVariable Long datasourcesId, @Payload FbiEngineDTO fbiEngineDTO, SimpMessageHeaderAccessor headerAccessor) throws InterruptedException {
        grpcQueryService.sendGetDataStream(datasourcesId,
            headerAccessor.getUser().getName(),
            fbiEngineDTO.getVisualMetadata(),
            fbiEngineDTO.getQueryDTO(),
            fbiEngineDTO.getvId(),
            fbiEngineDTO.getType());
    }
    
    @MessageMapping("/fbi-engine-grpc/queryAll")
    public void handleQueryAll(@Payload QueryAllRequestDTO requestDTO, SimpMessageHeaderAccessor headerAccessor) {
        grpcQueryService.sendQueryAll(headerAccessor.getUser().getName(), requestDTO);
    }

	@MessageMapping("fbi-engine-grpc/scheduled-reports/{pageSize}/{page}")
	public void getSchedulerReportsAndEngineData(@DestinationVariable Integer pageSize,
			@DestinationVariable Integer page) throws URISyntaxException {
		RestTemplate restTemplate = new RestTemplate();
		try {
			ResponseEntity<List<SchedulerNotificationResponseDTO>> responseEntity = restTemplate.exchange(
					schedulerService.buildUrl(host, port, scheduledReportsUrl), HttpMethod.GET, null,
					new ParameterizedTypeReference<List<SchedulerNotificationResponseDTO>>() {
					}, SecurityUtils.getCurrentUserLogin(), pageSize, page);
			List<SchedulerNotificationResponseDTO> reports = responseEntity.getBody();
			for (SchedulerNotificationResponseDTO schedulerNotificationResponseDTO : reports) {
				pushToSocket(schedulerNotificationResponseDTO);
			}
		} catch (Exception e) {
			log.error("error occured while fetching reports:" + e.getMessage());
		}
	}

	private void pushToSocket(SchedulerNotificationResponseDTO schedulerNotificationResponseDTO)
			throws InvalidProtocolBufferException, InterruptedException {
		Query.Builder builder = Query.newBuilder();
		JsonFormat.parser().merge(schedulerNotificationResponseDTO.getQuery(), builder);
		Query query = builder.build();
		grpcQueryService.callGrpcBiDirectionalAndPushInSocket(schedulerNotificationResponseDTO, query,
				"scheduled-report", query.getUserId());
	}

}
