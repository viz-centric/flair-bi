package com.flair.bi.websocket.grpc.config;

import io.grpc.ManagedChannel;
import lombok.RequiredArgsConstructor;

import java.util.function.Supplier;

@RequiredArgsConstructor
public class ManagedChannelFactory {

    private final Supplier<ManagedChannel> supplier;

    public ManagedChannel getInstance() {
        return supplier.get();
    }
}
