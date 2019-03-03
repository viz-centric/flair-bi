package com.flair.bi.service;

import com.flair.bi.messages.Connection;
import com.flair.bi.messages.ConnectionResponses;
import com.flair.bi.messages.ConnectionType;
import com.flair.bi.messages.ConnectionTypesResponses;
import com.flair.bi.messages.DeleteConnectionResponse;
import com.flair.bi.messages.GetConnectionResponse;
import com.flair.bi.messages.ListTablesResponse;
import com.flair.bi.messages.SaveConnectionResponse;
import com.flair.bi.messages.TestConnectionResponse;
import com.flair.bi.messages.UpdateConnectionResponse;
import com.flair.bi.service.dto.ConnectionFilterParamsDTO;
import com.flair.bi.service.dto.ListTablesResponseDTO;
import com.flair.bi.service.dto.TestConnectionResultDTO;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import com.flair.bi.web.rest.dto.ConnectionTypeDTO;
import com.google.common.collect.ImmutableMap;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Matchers.isNull;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class GrpcConnectionServiceTest {

    @Mock
    IGrpcService grpcService;

    private GrpcConnectionService service;

    @Before
    public void setUp() throws Exception {
        service = new GrpcConnectionService(grpcService);
    }

    @Test
    public void getConnectionTypes() {
        when(grpcService.getAllConnectionTypes()).thenReturn(ConnectionTypesResponses.newBuilder()
            .addConnectionTypes(
                    ConnectionType.newBuilder()
                        .setName("nm")
                        .setId(1L)
                        .setBundleClass("class")
                        .setConnectionPropertiesSchema(ConnectionType.ConnectionPropertiesSchema.newBuilder()
                            .setImagePath("img")
                            .setConnectionDetailsType("type")
                            .setConnectionDetailsClass("class1")
                            .addAllConnectionProperties(Arrays.asList(ConnectionType.ConnectionPropertiesSchema.ConnectionProperty.newBuilder()
                                .setRequired(true)
                                .setDefaultValue("default")
                                .setFieldType("type")
                                .setOrder(10)
                                .setFieldName("name")
                                .setDisplayName("display")
                                .build()))
                            .build())
                .build())
            .build());
        List<ConnectionTypeDTO> connectionTypes = service.getAllConnectionTypes();

        assertEquals(1, connectionTypes.size());
        assertEquals(1L, (long) connectionTypes.get(0).getId());
        assertEquals("nm", connectionTypes.get(0).getName());
        assertEquals("class", connectionTypes.get(0).getBundleClass());
        assertEquals("class1", connectionTypes.get(0).getConnectionPropertiesSchema().getConnectionDetailsClass());
        assertEquals("type", connectionTypes.get(0).getConnectionPropertiesSchema().getConnectionDetailsType());
        assertEquals("img", connectionTypes.get(0).getConnectionPropertiesSchema().getImagePath());
        assertEquals(1, connectionTypes.get(0).getConnectionPropertiesSchema().getConnectionProperties().size());
        assertTrue(connectionTypes.get(0).getConnectionPropertiesSchema().getConnectionProperties().get(0).isRequired());
        assertEquals("default", connectionTypes.get(0).getConnectionPropertiesSchema().getConnectionProperties().get(0).getDefaultValue());
        assertEquals("type", connectionTypes.get(0).getConnectionPropertiesSchema().getConnectionProperties().get(0).getFieldType());
        assertEquals("name", connectionTypes.get(0).getConnectionPropertiesSchema().getConnectionProperties().get(0).getFieldName());
        assertEquals("display", connectionTypes.get(0).getConnectionPropertiesSchema().getConnectionProperties().get(0).getDisplayName());
    }

    @Test
    public void getAllConnections() {
        ConnectionResponses connectionResponses = ConnectionResponses.newBuilder()
            .addConnection(Connection.newBuilder()
                    .setConnectionPassword("pass")
                    .setConnectionType(1L)
                    .setConnectionUsername("user")
                    .putAllDetails(ImmutableMap.of("one", "two", "three", "four"))
                    .setId(7L)
                    .setLinkId("linkid")
                    .setName("nm")
                    .build())
                .build();
        when(grpcService.getAllConnections()).thenReturn(connectionResponses);
        List<ConnectionDTO> connections = service.getAllConnections(new ConnectionFilterParamsDTO());

        assertEquals(1, connections.size());
        assertEquals(1L, (long) connections.get(0).getConnectionTypeId());
        assertEquals(7L, (long) connections.get(0).getId());
        assertEquals(ImmutableMap.of("one", "two", "three", "four"), connections.get(0).getDetails());
        assertEquals("linkid", connections.get(0).getLinkId());
        assertEquals("nm", connections.get(0).getName());
        assertEquals("pass", connections.get(0).getConnectionPassword());
        assertEquals("user", connections.get(0).getConnectionUsername());
    }

    @Test
    public void getAllConnectionsWithParameters() {
        ConnectionResponses connectionResponses = ConnectionResponses.newBuilder()
            .addConnection(Connection.newBuilder()
                    .setConnectionPassword("pass")
                    .setConnectionType(1L)
                    .setConnectionUsername("user")
                    .putAllDetails(ImmutableMap.of("one", "two", "three", "four"))
                    .setId(7L)
                    .setLinkId("linkid")
                    .setName("nm")
                    .build())
            .addConnection(Connection.newBuilder()
                    .setConnectionPassword("pass2")
                    .setConnectionType(2L)
                    .setConnectionUsername("user2")
                    .putAllDetails(ImmutableMap.of("one", "two2", "three", "four2"))
                    .setId(8L)
                    .setLinkId("linkid2")
                    .setName("nm2")
                    .build())
                .build();
        when(grpcService.getAllConnections()).thenReturn(connectionResponses);
        List<ConnectionDTO> connections = service.getAllConnections(new ConnectionFilterParamsDTO()
            .setLinkId("linkid2")
            .setConnectionType(2L));

        assertEquals(1, connections.size());
        assertEquals(2L, (long) connections.get(0).getConnectionTypeId());
        assertEquals(8L, (long) connections.get(0).getId());
        assertEquals(ImmutableMap.of("one", "two2", "three", "four2"), connections.get(0).getDetails());
        assertEquals("linkid2", connections.get(0).getLinkId());
        assertEquals("nm2", connections.get(0).getName());
        assertEquals("pass2", connections.get(0).getConnectionPassword());
        assertEquals("user2", connections.get(0).getConnectionUsername());
    }

    @Test
    public void testConnectionWorksByConnectionLinkId() throws IOException {
        when(grpcService.testConnection(eq("linkid"), eq("datasource"), isNull(Connection.class)))
            .thenReturn(TestConnectionResponse.newBuilder().setResult("[]").build());
        TestConnectionResultDTO result = service.testConnection("linkid", "datasource", null);
        assertTrue(result.isSuccess());
    }

    @Test
    public void testConnectionFailsByConnectionLinkId() throws IOException {
        when(grpcService.testConnection(eq("linkid"), eq("datasource"), isNull(Connection.class)))
            .thenReturn(TestConnectionResponse.newBuilder().setResult("").build());
        TestConnectionResultDTO result = service.testConnection("linkid", "datasource", null);
        assertFalse(result.isSuccess());
    }

    @Test
    public void testConnectionWorksByConnection() throws IOException {
        doAnswer(invocationOnMock -> {
            Connection c = invocationOnMock.getArgumentAt(2, Connection.class);
            assertEquals("connection name", c.getName());
            assertEquals(1L, c.getId());
            assertEquals("linkid", c.getLinkId());
            assertEquals("pwd", c.getConnectionPassword());
            assertEquals("usr", c.getConnectionUsername());
            assertEquals(10L, c.getConnectionType());
            assertEquals("1234", c.getDetailsMap().get("serverIp"));
            return TestConnectionResponse.newBuilder().setResult("[]").build();
        }).when(grpcService).testConnection(isNull(String.class), eq("datasource"), any(Connection.class));

        ConnectionDTO connectionDTO = new ConnectionDTO();
        connectionDTO.setName("connection name");
        connectionDTO.setId(1L);
        connectionDTO.setLinkId("linkid");
        connectionDTO.setConnectionPassword("pwd");
        connectionDTO.setConnectionUsername("usr");
        connectionDTO.setConnectionTypeId(10L);
        connectionDTO.setDetails(ImmutableMap.of("serverIp", "1234"));

        TestConnectionResultDTO result = service.testConnection(null, "datasource", connectionDTO);

        assertTrue(result.isSuccess());
    }

    @Test
    public void testConnectionFailsByConnection() throws IOException {
        when(grpcService.testConnection(isNull(String.class), eq("datasource"), any(Connection.class)))
            .thenReturn(TestConnectionResponse.newBuilder().setResult("").build());

        ConnectionDTO connectionDTO = new ConnectionDTO();
        connectionDTO.setName("connection name");
        connectionDTO.setId(1L);
        connectionDTO.setLinkId("linkid");
        connectionDTO.setConnectionPassword("pwd");
        connectionDTO.setConnectionUsername("usr");
        connectionDTO.setConnectionTypeId(10L);
        connectionDTO.setDetails(ImmutableMap.of("serverIp", "1234"));

        TestConnectionResultDTO result = service.testConnection(null, "datasource", connectionDTO);

        assertFalse(result.isSuccess());
    }

    @Test
    public void testSaveConnection() {
        when(grpcService.saveConnection(any(Connection.class))).thenReturn(SaveConnectionResponse.newBuilder()
            .setConnection(Connection.newBuilder()
                .setId(10)
                .setConnectionType(11)
                .setLinkId("lnk")
                .setName("nm")
                .setConnectionUsername("usr")
                .setConnectionPassword("pwd")
                .putAllDetails(ImmutableMap.of("serverIp", "1234"))
                .build())
            .build());

        ConnectionDTO connectionDTO = new ConnectionDTO();
        connectionDTO.setName("connection name");
        connectionDTO.setLinkId("linkid");
        connectionDTO.setConnectionPassword("pwd");
        connectionDTO.setConnectionUsername("usr");
        connectionDTO.setConnectionTypeId(10L);
        connectionDTO.setDetails(ImmutableMap.of("serverIp", "1234"));
        ConnectionDTO savedConnectionDto = service.saveConnection(connectionDTO);

        assertEquals(11, (long) savedConnectionDto.getConnectionTypeId());
        assertEquals(10, (long) savedConnectionDto.getId());
        assertEquals(ImmutableMap.of("serverIp", "1234"), savedConnectionDto.getDetails());
        assertEquals("lnk", savedConnectionDto.getLinkId());
        assertEquals("nm", savedConnectionDto.getName());
        assertEquals("pwd", savedConnectionDto.getConnectionPassword());
        assertEquals("usr", savedConnectionDto.getConnectionUsername());
    }

    @Test
    public void testUpdateConnection() {
        when(grpcService.updateConnection(any(Connection.class))).thenReturn(UpdateConnectionResponse.newBuilder()
            .setConnection(Connection.newBuilder()
                .setId(10)
                .setConnectionType(11)
                .setLinkId("lnk")
                .setName("nm")
                .setConnectionUsername("usr")
                .setConnectionPassword("pwd")
                .putAllDetails(ImmutableMap.of("serverIp", "1234"))
                .build())
            .build());

        ConnectionDTO connectionDTO = new ConnectionDTO();
        connectionDTO.setName("connection name");
        connectionDTO.setId(1L);
        connectionDTO.setLinkId("linkid");
        connectionDTO.setConnectionPassword("pwd");
        connectionDTO.setConnectionUsername("usr");
        connectionDTO.setConnectionTypeId(10L);
        connectionDTO.setDetails(ImmutableMap.of("serverIp", "1234"));
        ConnectionDTO savedConnectionDto = service.updateConnection(connectionDTO);

        assertEquals(11, (long) savedConnectionDto.getConnectionTypeId());
        assertEquals(10, (long) savedConnectionDto.getId());
        assertEquals(ImmutableMap.of("serverIp", "1234"), savedConnectionDto.getDetails());
        assertEquals("lnk", savedConnectionDto.getLinkId());
        assertEquals("nm", savedConnectionDto.getName());
        assertEquals("pwd", savedConnectionDto.getConnectionPassword());
        assertEquals("usr", savedConnectionDto.getConnectionUsername());
    }

    @Test
    public void testGetConnection() {
        when(grpcService.getConnection(1L)).thenReturn(GetConnectionResponse.newBuilder()
            .setConnection(Connection.newBuilder()
                .setId(1L)
                .build())
            .build());
        ConnectionDTO connectionDto = service.getConnection(1L);

        assertEquals(1L, (long)connectionDto.getId());
    }

    @Test
    public void deleteConnection() {
        when(grpcService.deleteConnection(1L)).thenReturn(DeleteConnectionResponse.newBuilder()
            .setSuccess(true)
            .setConnectionId(1L)
            .build());

        boolean success = service.deleteConnection(1L);

        assertTrue(success);
    }

    @Test
    public void listTables() {
        when(grpcService.listTables(eq("linkid"), eq("table"), eq(10), any(Connection.class)))
        .thenReturn(ListTablesResponse.newBuilder()
            .addTables(ListTablesResponse.Table.newBuilder()
                .setTableName("table name")
                .build())
            .addTables(ListTablesResponse.Table.newBuilder()
                .setTableName("table name2")
                .build())
            .build());
        ListTablesResponseDTO response = service.listTables("linkid", "table", null, 10);

        assertEquals("table name", response.getTableNames().get(0));
        assertEquals("table name2", response.getTableNames().get(1));

    }
}
