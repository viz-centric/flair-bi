package com.flair.bi.service;

import com.flair.bi.messages.Connection;
import com.flair.bi.messages.ConnectionResponses;
import com.flair.bi.messages.ConnectionTypesResponses;
import com.flair.bi.messages.DeleteConnectionResponse;
import com.flair.bi.messages.GetConnectionResponse;
import com.flair.bi.messages.ListTablesResponse;
import com.flair.bi.messages.Query;
import com.flair.bi.messages.QueryAllResponse;
import com.flair.bi.messages.QueryResponse;
import com.flair.bi.messages.QueryValidationResponse;
import com.flair.bi.messages.RunQueryResponse;
import com.flair.bi.messages.SaveConnectionResponse;
import com.flair.bi.messages.TestConnectionResponse;
import com.flair.bi.messages.UpdateConnectionResponse;
import io.grpc.stub.StreamObserver;

public interface IGrpcService {
    QueryValidationResponse validate(Query query);

    StreamObserver<Query> getDataStream(StreamObserver<QueryResponse> responseObserver);

    ConnectionResponses getAllConnections();

    RunQueryResponse runQuery(Query query, boolean metaRetrieved);

    TestConnectionResponse testConnection(Connection connection);

    QueryAllResponse queryAll(String connectionLinkId, Query query, Connection connection);

    ConnectionTypesResponses getAllConnectionTypes();

    SaveConnectionResponse saveConnection(Connection connection);

    GetConnectionResponse getConnection(Long connectionId);

    DeleteConnectionResponse deleteConnection(Long connectionId);

    UpdateConnectionResponse updateConnection(Connection connection);

    ListTablesResponse listTables(String connectionLinkId, String tableNameLike, int maxEntries, Connection connection);
}
