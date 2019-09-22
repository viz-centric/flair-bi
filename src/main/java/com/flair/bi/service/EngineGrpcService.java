package com.flair.bi.service;

import com.flair.bi.messages.Connection;
import com.flair.bi.messages.ConnectionResponses;
import com.flair.bi.messages.ConnectionServiceGrpc;
import com.flair.bi.messages.ConnectionTypesResponses;
import com.flair.bi.messages.DeleteConnectionRequest;
import com.flair.bi.messages.DeleteConnectionResponse;
import com.flair.bi.messages.EmptyConnection;
import com.flair.bi.messages.GetAllConnectionTypesRequest;
import com.flair.bi.messages.GetConnectionRequest;
import com.flair.bi.messages.GetConnectionResponse;
import com.flair.bi.messages.ListTablesRequest;
import com.flair.bi.messages.ListTablesResponse;
import com.flair.bi.messages.Query;
import com.flair.bi.messages.QueryAllRequest;
import com.flair.bi.messages.QueryAllResponse;
import com.flair.bi.messages.QueryResponse;
import com.flair.bi.messages.QueryServiceGrpc;
import com.flair.bi.messages.QueryValidationResponse;
import com.flair.bi.messages.RunQueryRequest;
import com.flair.bi.messages.RunQueryResponse;
import com.flair.bi.messages.SaveConnectionRequest;
import com.flair.bi.messages.SaveConnectionResponse;
import com.flair.bi.messages.TestConnectionRequest;
import com.flair.bi.messages.TestConnectionResponse;
import com.flair.bi.messages.UpdateConnectionRequest;
import com.flair.bi.messages.UpdateConnectionResponse;
import com.flair.bi.websocket.grpc.config.ManagedChannelFactory;
import io.grpc.ManagedChannel;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@Profile("!test")
public class EngineGrpcService implements IEngineGrpcService {

    private final ManagedChannelFactory managedChannelFactory;
    private volatile QueryServiceGrpc.QueryServiceBlockingStub queryServiceBlockingStub;
    private volatile QueryServiceGrpc.QueryServiceStub queryServiceStub;
    private volatile ConnectionServiceGrpc.ConnectionServiceBlockingStub connectionServiceBlockingStub;
    private volatile ManagedChannel channel;

    @Autowired
    public EngineGrpcService(@Qualifier("engineChannelFactory") ManagedChannelFactory managedChannelFactory) {
        this.managedChannelFactory = managedChannelFactory;
    }

    private QueryServiceGrpc.QueryServiceBlockingStub getQueryStub() {
        if (queryServiceBlockingStub == null || (channel != null && channel.isShutdown())) {
            synchronized (this) {
                if (queryServiceBlockingStub == null || (channel != null && channel.isShutdown())) {
                    queryServiceBlockingStub = QueryServiceGrpc.newBlockingStub(getChannel());
                }
            }
        }
        return queryServiceBlockingStub;
    }

    private QueryServiceGrpc.QueryServiceStub getQueryAsyncStub() {
        if (queryServiceStub == null || (channel != null && channel.isShutdown())) {
            synchronized (this) {
                if (queryServiceStub == null || (channel != null && channel.isShutdown())) {
                    queryServiceStub = QueryServiceGrpc.newStub(getChannel());
                }
            }
        }
        return queryServiceStub;
    }

    private ConnectionServiceGrpc.ConnectionServiceBlockingStub getConnectionStub() {
        if (connectionServiceBlockingStub == null || (channel != null && channel.isShutdown())) {
            synchronized (this) {
                if (connectionServiceBlockingStub == null || (channel != null && channel.isShutdown())) {
                    connectionServiceBlockingStub = ConnectionServiceGrpc.newBlockingStub(getChannel());
                }
            }
        }
        return connectionServiceBlockingStub;
    }

    private ManagedChannel getChannel() {
        if (channel == null || channel.isShutdown()) {
            synchronized (this) {
                if (channel == null || channel.isShutdown()) {
                    channel = managedChannelFactory.getInstance();
                }
            }
        }
        return channel;
    }

    @Override
    public QueryValidationResponse validate(Query query) {
        return getQueryStub().validate(query);
    }

    @Override
    public StreamObserver<Query> getDataStream(StreamObserver<QueryResponse> responseObserver) {
        return getQueryAsyncStub().getDataStream(responseObserver);
    }

    @Override
    public ConnectionResponses getAllConnections() {
        return getConnectionStub().getAllConnections(EmptyConnection.newBuilder().build());
    }

    @Override
    public RunQueryResponse runQuery(Query query, boolean metaRetrieved) {
        return getQueryStub().runQuery(RunQueryRequest.newBuilder()
            .setQuery(query)
            .setRetrieveMeta(metaRetrieved)
            .build());
    }

    @Override
    public TestConnectionResponse testConnection(Connection connection) {
        TestConnectionRequest request = TestConnectionRequest.newBuilder()
                .setConnection(connection)
                .build();
        return getConnectionStub().testConnection(request);
    }

    @Override
    public QueryAllResponse queryAll(String connectionLinkId, Query query, Connection connection) {
        QueryAllRequest.Builder builder = QueryAllRequest.newBuilder()
                .setQuery(query);
        if (StringUtils.isNotEmpty(connectionLinkId)) {
            builder.setConnectionLinkId(connectionLinkId);
        }
        if (connection != null) {
            builder.setConnection(connection);
        }
        return getQueryStub().queryAll(builder.build());
    }

    @Override
    public ConnectionTypesResponses getAllConnectionTypes() {
        return getConnectionStub().getConnectionTypes(GetAllConnectionTypesRequest.newBuilder().build());
    }

    @Override
    public SaveConnectionResponse saveConnection(Connection connection) {
        return getConnectionStub().saveConnection(SaveConnectionRequest.newBuilder()
            .setConnection(connection)
            .build());
    }

    @Override
    public GetConnectionResponse getConnection(Long connectionId) {
        return getConnectionStub().getConnection(GetConnectionRequest.newBuilder()
            .setId(connectionId)
            .build());
    }

    @Override
    public DeleteConnectionResponse deleteConnection(Long connectionId) {
        return getConnectionStub().deleteConnection(DeleteConnectionRequest.newBuilder()
            .setConnectionId(connectionId)
            .build());
    }

    @Override
    public UpdateConnectionResponse updateConnection(Connection connection) {
        return getConnectionStub().updateConnection(UpdateConnectionRequest.newBuilder()
            .setConnection(connection)
            .build());
    }

    @Override
    public ListTablesResponse listTables(String connectionLinkId, String tableNameLike, int maxEntries, Connection connection) {
        ListTablesRequest.Builder builder = ListTablesRequest.newBuilder();
        if (connection != null) {
            builder.setConnection(connection);
        }
        if (connectionLinkId != null) {
            builder.setConnectionLinkId(connectionLinkId);
        }
        builder.setMaxEntries(maxEntries);
        return getConnectionStub().listTables(builder
            .setTableNameLike(tableNameLike)
            .build());
    }

}
