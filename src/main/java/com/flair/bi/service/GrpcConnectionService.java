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
import com.flair.bi.web.rest.dto.ConnectionPropertiesSchemaDTO;
import com.flair.bi.web.rest.dto.ConnectionPropertyDTO;
import com.flair.bi.web.rest.dto.ConnectionTypeDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GrpcConnectionService {

    private final IGrpcService grpcService;

    public List<ConnectionTypeDTO> getAllConnectionTypes() {
        ConnectionTypesResponses connectionTypes = grpcService.getAllConnectionTypes();
        return connectionTypes.getConnectionTypesList()
            .stream()
            .map(conn -> toDto(conn))
            .collect(Collectors.toList());
    }

    private ConnectionTypeDTO toDto(ConnectionType conn) {
        return new ConnectionTypeDTO().setId(conn.getId())
            .setName(conn.getName())
            .setBundleClass(conn.getBundleClass())
            .setConnectionPropertiesSchema(new ConnectionPropertiesSchemaDTO()
                .setConnectionDetailsClass(conn.getConnectionPropertiesSchema().getConnectionDetailsClass())
                .setConnectionDetailsType(conn.getConnectionPropertiesSchema().getConnectionDetailsType())
                .setImagePath(conn.getConnectionPropertiesSchema().getImagePath())
                .setConnectionProperties(conn.getConnectionPropertiesSchema()
                    .getConnectionPropertiesList()
                    .stream()
                    .map(t -> new ConnectionPropertyDTO()
                        .setDefaultValue(t.getDefaultValue())
                        .setDisplayName(t.getDisplayName())
                        .setFieldName(t.getFieldName())
                        .setFieldType(t.getFieldType())
                        .setOrder(t.getOrder())
                        .setRequired(t.getRequired()))
                    .collect(Collectors.toList())));
    }

    public List<ConnectionDTO> getAllConnections(ConnectionFilterParamsDTO filterParams) {
        ConnectionResponses connections = grpcService.getAllConnections();
        return connections.getConnectionList()
            .stream()
            .filter(filterConnectionByParams(filterParams))
            .map(conn -> toDto(conn))
            .collect(Collectors.toList());
    }

    public TestConnectionResultDTO testConnection(String connectionLinkId, String datasourceName, ConnectionDTO connection) throws IOException {
        TestConnectionResponse result = grpcService.testConnection(connectionLinkId, datasourceName, toProtoConnection(connection));
        return new TestConnectionResultDTO()
            .setSuccess(!StringUtils.isEmpty(result.getResult()));
    }

    public ListTablesResponseDTO listTables(String connectionLinkId, String tableNameLike, ConnectionDTO connection, int maxEntries) {
        ListTablesResponse result = grpcService.listTables(connectionLinkId, tableNameLike, maxEntries, toProtoConnection(connection));
        return new ListTablesResponseDTO()
            .setTableNames(result.getTablesList()
                .stream()
                .map(table -> table.getTableName())
                .collect(Collectors.toList()));
    }

    public ConnectionDTO saveConnection(ConnectionDTO connection) {
        SaveConnectionResponse response = grpcService.saveConnection(toProtoConnection(connection));
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
        UpdateConnectionResponse response = grpcService.updateConnection(toProtoConnection(connection));
        return toDto(response.getConnection());
    }

    private Connection toProtoConnection(ConnectionDTO connection) {
        return Optional.ofNullable(connection)
            .map(c -> {
                Connection.Builder builder = Connection.newBuilder()
                    .setConnectionPassword(c.getConnectionPassword())
                    .setConnectionUsername(c.getConnectionUsername())
                    .setConnectionType(c.getConnectionTypeId())
                    .setName(c.getName())
                    .putAllConnectionParameters(c.getConnectionParameters())
                    .putAllDetails(c.getDetails());
                if (c.getId() != null) {
                    builder.setId(c.getId());
                }
                if (c.getLinkId() != null) {
                    builder.setLinkId(c.getLinkId());
                }
                return builder.build();
            })
            .orElse(null);
    }

    private ConnectionDTO toDto(Connection conn) {
        ConnectionDTO dto = new ConnectionDTO();
        dto.setId(conn.getId());
        dto.setName(conn.getName());
        dto.setConnectionUsername(conn.getConnectionUsername());
        dto.setConnectionPassword(conn.getConnectionPassword());
        dto.setConnectionTypeId(conn.getConnectionType());
        dto.setLinkId(conn.getLinkId());
        dto.setDetails(conn.getDetailsMap());
        dto.setConnectionParameters(conn.getConnectionParametersMap());
        return dto;
    }

    private Predicate<Connection> filterConnectionByParams(ConnectionFilterParamsDTO filterParams) {
        return conn -> {
            if (filterParams.getConnectionType() != null) {
                return Objects.equals(conn.getConnectionType(), filterParams.getConnectionType());
            }
            if (filterParams.getLinkId() != null) {
                return Objects.equals(conn.getLinkId(), filterParams.getLinkId());
            }
            return true;
        };
    }

}
