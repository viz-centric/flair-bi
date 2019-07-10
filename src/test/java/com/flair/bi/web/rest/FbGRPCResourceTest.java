package com.flair.bi.web.rest;

import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.SchedulerService;
import com.flair.bi.service.dto.FbiEngineDTO;
import com.project.bi.query.dto.QueryDTO;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import java.security.Principal;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

@Ignore
@RunWith(MockitoJUnitRunner.class)
public class FbGRPCResourceTest {

    @Mock
    private GrpcQueryService grpcQueryService;

    @Mock
    SchedulerService schedulerService;

    private FbGRPCResource resource;

    @Before
    public void setUp() {
        resource = new FbGRPCResource(grpcQueryService,schedulerService);
    }

    @Test
    public void mirrorSocket() throws InterruptedException {
        VisualMetadata visualMetadata = new VisualMetadata();
        String visualId = "visual id";
        QueryDTO queryDTO = new QueryDTO();
        String userId = "user id";
        long datasourcesId = 1L;
        String type = null;

        FbiEngineDTO fbiEngineDTO = new FbiEngineDTO();
        fbiEngineDTO.setQueryDTO(queryDTO);
        fbiEngineDTO.setVisualMetadata(visualMetadata);
        fbiEngineDTO.setvId(visualId);

        SimpMessageHeaderAccessor headerAccessor = mock(SimpMessageHeaderAccessor.class);
        Principal token = mock(Principal.class);
        when(token.getName()).thenReturn(userId);
        when(headerAccessor.getUser()).thenReturn(token);

        doAnswer(invocationOnMock -> {
            Long datasourceIdArg = invocationOnMock.getArgumentAt(0, Long.class);
            String userIdArg = invocationOnMock.getArgumentAt(1, String.class);
            VisualMetadata visualMetadataArg = invocationOnMock.getArgumentAt(2, VisualMetadata.class);
            QueryDTO queryDTOArg = invocationOnMock.getArgumentAt(3, QueryDTO.class);
            String visualIdArg = invocationOnMock.getArgumentAt(4, String.class);

            assertEquals(datasourcesId, (long)datasourceIdArg);
            assertEquals(userId, userIdArg);
            assertEquals(visualMetadata, visualMetadataArg);
            assertEquals(queryDTO, queryDTOArg);
            assertEquals(visualId, visualIdArg);
            return null;
        }).when(grpcQueryService)
            .sendGetDataStream(eq(datasourcesId), eq(userId), eq(visualMetadata), eq(queryDTO), eq(visualId),eq(type));
        resource.mirrorSocket(datasourcesId, fbiEngineDTO, headerAccessor);

    }
}
