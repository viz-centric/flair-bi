package com.flair.bi.websocket.grpc.config;

import java.util.function.Supplier;

import io.grpc.ManagedChannel;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ManagedChannelFactory {

	private final Supplier<ManagedChannel> supplier;

	public ManagedChannel getInstance() {
		return supplier.get();
	}
}
