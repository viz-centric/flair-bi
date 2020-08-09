package com.flair.bi.websocket.grpc.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptorAdapter;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.support.NativeMessageHeaderAccessor;
import org.springframework.util.StringUtils;

import com.flair.bi.security.jwt.TokenProvider;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtChannelInterceptor extends ChannelInterceptorAdapter {

	private final TokenProvider tokenProvider;

	@Override
	public Message<?> preSend(Message<?> message, MessageChannel channel) {
		StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

		if (StompCommand.CONNECT.equals(accessor.getCommand())) {
			NativeMessageHeaderAccessor headerAccessor = NativeMessageHeaderAccessor.getAccessor(message,
					NativeMessageHeaderAccessor.class);
			String jwt = headerAccessor.getFirstNativeHeader("token");
			// TODO handle oauth logic
			if (jwt != null && StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
				accessor.setUser(tokenProvider.getAuthentication(jwt));
			}
		}

		return message;
	}
}
