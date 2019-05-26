package com.flair.bi.web.rest;

import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.dto.FbiEngineDTO;
import com.flair.bi.web.rest.dto.QueryAllRequestDTO;
import com.project.bi.query.dto.QueryDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Controller
public class FbGRPCResource {

    private final GrpcQueryService grpcQueryService;

    @MessageMapping("/fbi-engine-grpc/{datasourcesId}/query")
    public void mirrorSocket(@DestinationVariable Long datasourcesId, @Payload FbiEngineDTO fbiEngineDTO, SimpMessageHeaderAccessor headerAccessor) throws InterruptedException {
        grpcQueryService.sendGetDataStream(datasourcesId,
            headerAccessor.getUser().getName(),
            fbiEngineDTO.getVisualMetadata(),
            fbiEngineDTO.getQueryDTO(),
            fbiEngineDTO.getvId(),
            fbiEngineDTO.getType());
    }
    
    @MessageMapping("/fbi-engine-grpc/{sourcesId}/queryAll")
    public void mirrorSocketSampleData(@DestinationVariable String sourcesId, @Payload QueryDTO queryDTO, SimpMessageHeaderAccessor headerAccessor) throws InterruptedException {
        grpcQueryService.sendGetDataStream(sourcesId,
            headerAccessor.getUser().getName(),
            queryDTO);
    }

    @MessageMapping("/fbi-engine-grpc/queryAll")
    public void handleQueryAll(@Payload QueryAllRequestDTO requestDTO, SimpMessageHeaderAccessor headerAccessor) {
        grpcQueryService.sendQueryAll(headerAccessor.getUser().getName(), requestDTO);
    }

}
