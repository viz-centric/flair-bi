package com.flair.bi.web.websocket;

import com.flair.bi.messages.QueryResponse;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import io.grpc.Status;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Async
@Service
@RequiredArgsConstructor
public class FbEngineWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send meta to users subscribed on channel "/user/exchange/metaData".
     * <p>
     * The message will be sent only to the user with the given username.
     *
     * @param queryResponse query response
     * @param request request
     */
    public void pushGRPCMetaDeta(QueryResponse queryResponse, String request) {
        HashMap<String, Object> header = new HashMap<>();
        header.put("queryId", queryResponse.getQueryId());
        header.put("userId", queryResponse.getUserId());
        header.put("request", request);
        if (queryResponse.getCacheMetadata().getDateCreated() != 0) {
            header.put("cacheDate", queryResponse.getCacheMetadata().getDateCreated());
        }
        messagingTemplate.convertAndSendToUser(queryResponse.getUserId(), "/exchange/metaData", queryResponse.getData(), header);
    }

    /**
     * Send meta to users subscribed on channel "/user/exchange/metaData/@visualisationId".
     * <p>
     * The message will be sent only to the user with the given username.
     *
     * @param queryResponse query response
     * @param request request
     */
    public void pushGRPCMetaDataSharedLink(QueryResponse queryResponse, String request) {
        HashMap<String, Object> header = new HashMap<>();
        header.put("queryId", queryResponse.getQueryId());
        header.put("userId", queryResponse.getUserId());
        header.put("request", request);
        if (queryResponse.getCacheMetadata().getDateCreated() != 0) {
            header.put("cacheDate", queryResponse.getCacheMetadata().getDateCreated());
        }
        messagingTemplate.convertAndSendToUser(queryResponse.getUserId(), "/exchange/metaData/"+queryResponse.getQueryId(), queryResponse.getData(), header);
    }

    public void pushGRPCMetaDataError(String userId, Status status, Map<String, Object> error) {
        HashMap<String, Object> header = new HashMap<>();
        header.put("userId", userId);
        if (error != null) {
            header.putAll(error);
        }
        messagingTemplate.convertAndSendToUser(userId, "/exchange/metaDataError", status, header);
    }

    public void pushGRPCMetaDataError(String userId, Status status) {
        pushGRPCMetaDataError(userId, status, null);
    }

    /**
     * Send meta to users subscribed on channel "/user/exchange/sampleMetaData".
     * <p>
     * The message will be sent only to the user with the given username.
     *
     * @param queryResponse query response
     */
    public void pushGRPCMetaDeta(QueryResponse queryResponse) {
        HashMap<String, Object> header = new HashMap<>();
        header.put("queryId", queryResponse.getQueryId());
        header.put("userId", queryResponse.getUserId());
        messagingTemplate.convertAndSendToUser(queryResponse.getUserId(), "/exchange/metaData", queryResponse.getData(), header);
    }

    /**
     * Send meta to users subscribed on channel "/user/exchange/metaData".
     * <p>
     * The message will be sent only to the user with the given username.
     *
     * @param schedulerNotificationResponseDTO schedulerNotificationResponseDTO
     * @param queryResponse queryResponse
     * @param request request
     */
    public void pushGRPCMetaDeta(SchedulerNotificationDTO schedulerNotificationResponseDTO , QueryResponse queryResponse, String request) {
    	HashMap<String, Object> header = new HashMap<>();
        header.put("queryId", queryResponse.getQueryId());
        header.put("userId", queryResponse.getUserId());
        header.put("request", request);
        if (queryResponse.getCacheMetadata().getDateCreated() != 0) {
            header.put("cacheDate", queryResponse.getCacheMetadata().getDateCreated());
        }
        SchedulerNotificationResponseDTO dto = SchedulerNotificationResponseDTO.builder()
                .notification(schedulerNotificationResponseDTO)
                .queryResponse(queryResponse.getData())
                .build();
        messagingTemplate.convertAndSendToUser(queryResponse.getUserId(), "/exchange/scheduledReports", dto, header);
    }

    @Data
    @Builder
    private static class SchedulerNotificationResponseDTO {
        private SchedulerNotificationDTO notification;
        private String queryResponse;
    }

}
