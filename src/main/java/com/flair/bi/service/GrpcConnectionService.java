package com.flair.bi.service;

import com.flair.bi.messages.Connection;
import com.flair.bi.messages.ConnectionType;
import com.flair.bi.messages.ConnectionTypesResponses;
import com.flair.bi.messages.DeleteConnectionResponse;
import com.flair.bi.messages.GetAllConnectionsResponse;
import com.flair.bi.messages.GetConnectionResponse;
import com.flair.bi.messages.ListTablesResponse;
import com.flair.bi.messages.SaveConnectionResponse;
import com.flair.bi.messages.TestConnectionResponse;
import com.flair.bi.messages.UpdateConnectionResponse;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.dto.ConnectionFilterParamsDTO;
import com.flair.bi.service.dto.ListTablesResponseDTO;
import com.flair.bi.service.dto.TestConnectionResultDTO;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import com.flair.bi.web.rest.dto.ConnectionPropertiesSchemaDTO;
import com.flair.bi.web.rest.dto.ConnectionPropertyDTO;
import com.flair.bi.web.rest.dto.ConnectionTypeDTO;
import com.flair.bi.web.rest.util.QueryGrpcUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class GrpcConnectionService {

    private final IEngineGrpcService grpcService;
    private final UserService userService;

    public List<ConnectionTypeDTO> getAllConnectionTypes() {
        ConnectionTypesResponses connectionTypes = grpcService.getAllConnectionTypes();
        return connectionTypes.getConnectionTypesList().stream().map(conn -> toDto(conn)).collect(Collectors.toList());
    }

    private ConnectionTypeDTO toDto(ConnectionType conn) {
        return new ConnectionTypeDTO().setId(conn.getId()).setName(conn.getName()).setBundleClass(conn.getBundleClass())
                .setConnectionPropertiesSchema(new ConnectionPropertiesSchemaDTO()
                        .setConfig(conn.getConnectionPropertiesSchema().getConfigMap())
                        .setConnectionDetailsClass(conn.getConnectionPropertiesSchema().getConnectionDetailsClass())
                        .setConnectionDetailsType(conn.getConnectionPropertiesSchema().getConnectionDetailsType())
                        .setImagePath(conn.getConnectionPropertiesSchema().getImagePath()).setConnectionProperties(
                                conn.getConnectionPropertiesSchema().getConnectionPropertiesList().stream()
                                        .map(t -> new ConnectionPropertyDTO().setDefaultValue(t.getDefaultValue())
                                                .setDisplayName(t.getDisplayName()).setFieldName(t.getFieldName())
                                                .setFieldType(t.getFieldType()).setOrder(t.getOrder())
                                                .setRequired(t.getRequired()))
                                        .collect(Collectors.toList())));
    }

    public List<ConnectionDTO> getAllConnections(ConnectionFilterParamsDTO filterParams) {
        log.info("getAllConnections for realm {} link {} conn type {}",
                SecurityUtils.getUserAuth().getRealmId(), filterParams.getLinkId(), filterParams.getConnectionType());
        GetAllConnectionsResponse connections = grpcService.getAllConnections(
                SecurityUtils.getUserAuth().getRealmId(), filterParams.getLinkId(), filterParams.getConnectionType());
        return connections.getConnectionList()
                .stream()
                .map(conn -> toDto(conn)).collect(Collectors.toList());
    }

    public TestConnectionResultDTO testConnection(ConnectionDTO connection) {
        TestConnectionResponse result = grpcService.testConnection(QueryGrpcUtils.toProtoConnection(connection, userService));
        return new TestConnectionResultDTO().setSuccess(!StringUtils.isEmpty(result.getResult()));
    }

    public ListTablesResponseDTO listTables(String connectionLinkId, String tableNameLike, ConnectionDTO connection,
            int maxEntries) {
        ListTablesResponse result = grpcService.listTables(connectionLinkId, tableNameLike, maxEntries,
                QueryGrpcUtils.toProtoConnection(connection, userService));
        return new ListTablesResponseDTO().setTables(
                result.getTablesList()
                        .stream()
                        .map(table -> new ListTablesResponseDTO.Table(table.getTableName(), null))
                        .collect(Collectors.toList()));
    }

    public ConnectionDTO saveConnection(ConnectionDTO connection) {
        SaveConnectionResponse response = grpcService.saveConnection(QueryGrpcUtils.toProtoConnection(connection, userService));
        return toDto(response.getConnection());
    }

    public ConnectionDTO getConnection(Long connectionId) {
        GetConnectionResponse response = grpcService.getConnection(connectionId);
        return toDto(response.getConnection());
    }

    public boolean deleteConnection(Long connectionId) {
        DeleteConnectionResponse response = grpcService.deleteConnection(connectionId);
        return response.getSuccess();
    }

    public ConnectionDTO updateConnection(ConnectionDTO connection) {
        UpdateConnectionResponse response = grpcService.updateConnection(QueryGrpcUtils.toProtoConnection(connection, userService));
        return toDto(response.getConnection());
    }

    private ConnectionDTO toDto(Connection conn) {
        ConnectionDTO dto = new ConnectionDTO();
        dto.setId(conn.getId());
        dto.setName(conn.getName());
        dto.setConnectionUsername(conn.getConnectionUsername());
        dto.setConnectionPassword(conn.getConnectionPassword());
        dto.setConnectionTypeId(conn.getConnectionType());
        dto.setLinkId(conn.getLinkId());
        dto.setRealmId(conn.getRealmId());
        dto.setDetails(conn.getDetailsMap());
        dto.setConnectionParameters(conn.getConnectionParametersMap());
        return dto;
    }

}
