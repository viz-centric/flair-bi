package com.flair.bi.config.grpc;

import io.grpc.CallCredentials;
import io.grpc.Metadata;
import io.grpc.Status;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executor;

@RequiredArgsConstructor
public class JwtCredential extends CallCredentials {

    private final String key;
    private final String userId;

    @Override
    public void applyRequestMetadata(final RequestInfo requestInfo, final Executor executor,
                                     final MetadataApplier metadataApplier) {
        // Make a JWT compact serialized string.
        // This example omits setting the expiration, but a real application should do it.
        final String jwt = Jwts.builder()
                .setSubject(userId)
                .signWith(SignatureAlgorithm.HS256, key.getBytes(StandardCharsets.UTF_8))
                .compact();

        executor.execute(() -> {
            try {
                Metadata headers = new Metadata();
                headers.put(Constant.AUTHORIZATION_METADATA_KEY,
                        String.format("%s %s", Constant.BEARER_TYPE, jwt));
                metadataApplier.apply(headers);
            } catch (Throwable e) {
                metadataApplier.fail(Status.UNAUTHENTICATED.withCause(e));
            }
        });
    }

    @Override
    public void thisUsesUnstableApi() {
        // noop
    }
}
