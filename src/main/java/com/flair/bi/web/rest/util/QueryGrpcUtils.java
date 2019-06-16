package com.flair.bi.web.rest.util;

import com.flair.bi.messages.Connection;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

@Slf4j
public final class QueryGrpcUtils {

    public static Connection toProtoConnection(ConnectionDTO connection) {
        return Optional.ofNullable(connection)
            .map(c -> {
                Connection.Builder builder = Connection.newBuilder()
                    .setConnectionPassword(c.getConnectionPassword())
                    .setConnectionUsername(c.getConnectionUsername())
                    .setConnectionType(c.getConnectionTypeId())
                    .setName(c.getName())
                    .putAllDetails(c.getDetails());
                if (c.getConnectionParameters() != null) {
                    builder.putAllConnectionParameters(c.getConnectionParameters());
                }
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
}
