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
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class GrpcService implements IGrpcService {

    private final ManagedChannelFactory managedChannelFactory;

    private QueryServiceGrpc.QueryServiceBlockingStub queryStub;
    private QueryServiceGrpc.QueryServiceStub queryAsyncStub;
    private ConnectionServiceGrpc.ConnectionServiceBlockingStub connectionStub;

    @PostConstruct
    public void init() {
        queryStub = QueryServiceGrpc.newBlockingStub(managedChannelFactory.getInstance());
        queryAsyncStub = QueryServiceGrpc.newStub(managedChannelFactory.getInstance());
        connectionStub = ConnectionServiceGrpc.newBlockingStub(managedChannelFactory.getInstance());
    }

    @Override
    public QueryValidationResponse validate(Query query) {
        return queryStub.validate(query);
    }

    @Override
    public StreamObserver<Query> getDataStream(StreamObserver<QueryResponse> responseObserver) {
        return queryAsyncStub.getDataStream(responseObserver);
    }

    @Override
    public ConnectionResponses getAllConnections() {
        return connectionStub.getAllConnections(EmptyConnection.newBuilder().build());
    }

    @Override
    public RunQueryResponse runQuery(Query query, boolean metaRetrieved) {
        return queryStub.runQuery(RunQueryRequest.newBuilder()
            .setQuery(query)
            .setRetrieveMeta(metaRetrieved)
            .build());
    }

    @Override
    public TestConnectionResponse testConnection(String connectionLinkId, String datasourceName, Connection connection) {
        TestConnectionRequest.Builder builder = TestConnectionRequest.newBuilder();
        builder.setDatasourceName(datasourceName);

        if (connectionLinkId != null) {
            builder.setConnectionLinkId(connectionLinkId);
        }

        if (connection != null) {
            builder.setConnection(connection);
        }

        return connectionStub.testConnection(builder.build());
    }

    @Override
    public ConnectionTypesResponses getAllConnectionTypes() {
        return connectionStub.getConnectionTypes(GetAllConnectionTypesRequest.newBuilder().build());
    }

    @Override
    public SaveConnectionResponse saveConnection(Connection connection) {
        return connectionStub.saveConnection(SaveConnectionRequest.newBuilder()
            .setConnection(connection)
            .build());
    }

    @Override
    public GetConnectionResponse getConnection(Long connectionId) {
        return connectionStub.getConnection(GetConnectionRequest.newBuilder()
            .setId(connectionId)
            .build());
    }

    @Override
    public DeleteConnectionResponse deleteConnection(Long connectionId) {
        return connectionStub.deleteConnection(DeleteConnectionRequest.newBuilder()
            .setConnectionId(connectionId)
            .build());
    }

    @Override
    public UpdateConnectionResponse updateConnection(Connection connection) {
        return connectionStub.updateConnection(UpdateConnectionRequest.newBuilder()
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
        return connectionStub.listTables(builder
            .setTableNameLike(tableNameLike)
            .build());
    }

}
