package com.flair.bi.service;

import com.flair.bi.messages.Connection;
import com.flair.bi.messages.ConnectionResponses;
import com.flair.bi.messages.ConnectionTypesResponses;
import com.flair.bi.messages.DeleteConnectionResponse;
import com.flair.bi.messages.GetConnectionResponse;
import com.flair.bi.messages.ListTablesResponse;
import com.flair.bi.messages.Query;
import com.flair.bi.messages.QueryResponse;
import com.flair.bi.messages.QueryValidationResponse;
import com.flair.bi.messages.RunQueryResponse;
import com.flair.bi.messages.SaveConnectionResponse;
import com.flair.bi.messages.TestConnectionResponse;
import com.flair.bi.messages.UpdateConnectionResponse;
import io.grpc.stub.StreamObserver;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
public class TestGrpcService implements IGrpcService {

    @PostConstruct
    public void init() {
    }

    public QueryValidationResponse validate(Query query) {
        return null;
    }

    public StreamObserver<Query> getDataStream(StreamObserver<QueryResponse> responseObserver) {
        return null;
    }

    @Override
    public ConnectionResponses getAllConnections() {
        return null;
    }

    @Override
    public RunQueryResponse runQuery(Query query, boolean metaRetrieved) {
        return null;
    }

    @Override
    public TestConnectionResponse testConnection(String connectionLinkId, String datasourceName, Connection connection) {
        return null;
    }

    @Override
    public ConnectionTypesResponses getAllConnectionTypes() {
        return null;
    }

    @Override
    public SaveConnectionResponse saveConnection(Connection connection) {
        return null;
    }

    @Override
    public GetConnectionResponse getConnection(Long connectionId) {
        return null;
    }

    @Override
    public DeleteConnectionResponse deleteConnection(Long connectionId) {
        return null;
    }

    @Override
    public UpdateConnectionResponse updateConnection(Connection connection) {
        return null;
    }

    @Override
    public ListTablesResponse listTables(String connectionLinkId, String tableNameLike, int maxEntries, Connection connection) {
        return null;
    }

}
