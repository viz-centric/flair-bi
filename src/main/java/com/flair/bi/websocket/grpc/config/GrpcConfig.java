package com.flair.bi.websocket.grpc.config;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.EurekaClient;
import io.grpc.ManagedChannel;
import io.grpc.netty.shaded.io.grpc.netty.GrpcSslContexts;
import io.grpc.netty.shaded.io.grpc.netty.NegotiationType;
import io.grpc.netty.shaded.io.grpc.netty.NettyChannelBuilder;
import io.grpc.netty.shaded.io.netty.handler.ssl.SslContext;
import io.grpc.netty.shaded.io.netty.handler.ssl.SslContextBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.net.ssl.SSLException;
import java.io.File;
import java.util.function.Supplier;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class GrpcConfig {

    private final GrpcProperties properties;

    private final EurekaClient eurekaClient;

    @Bean
    public ManagedChannelFactory establishChannel() {
        Supplier<ManagedChannel> dynamicManagedChannel = () -> {
            log.info("GRPC config: Configuring GRPC message channel {}", properties);

            final InstanceInfo instanceInfo = eurekaClient.getNextServerFromEureka(
                    properties.getServer().getServiceName(),
                    false
            );

            final NettyChannelBuilder nettyChannelBuilder = NettyChannelBuilder.forAddress(
                    properties.getTls().isEnabled() ? instanceInfo.getHostName() : instanceInfo.getIPAddr(),
                    instanceInfo.getPort()
            );

            log.info("GRPC config: Hostname {} IP {} port {} secure port {} secure vip {}",
                    instanceInfo.getHostName(), instanceInfo.getIPAddr(), instanceInfo.getPort(), instanceInfo.getSecurePort(),
                    instanceInfo.getSecureVipAddress());

            if (properties.getTls().isEnabled()) {

                nettyChannelBuilder.negotiationType(NegotiationType.TLS);

                log.info("GRPC config: GRPC TLS enabled");

                try {
                    nettyChannelBuilder.sslContext(buildSslContext(
                            properties.getTls().getTrustCertCollectionFile(),
                            properties.getTls().getClientCertChainFile(),
                            properties.getTls().getClientPrivateKeyFile()
                    ));
                } catch (SSLException e) {
                    log.error("GRPC config: error", e);
                }
            } else {
                nettyChannelBuilder.usePlaintext();
            }
            return nettyChannelBuilder.build();
        };
        return new ManagedChannelFactory(dynamicManagedChannel);
    }

    private static SslContext buildSslContext(String trustCertCollectionFilePath,
                                              String clientCertChainFilePath,
                                              String clientPrivateKeyFilePath) throws SSLException {
        SslContextBuilder builder = GrpcSslContexts.forClient();
        if (trustCertCollectionFilePath != null) {
            builder.trustManager(new File(trustCertCollectionFilePath));
        }
        if (clientCertChainFilePath != null && clientPrivateKeyFilePath != null) {
            builder.keyManager(new File(clientCertChainFilePath), new File(clientPrivateKeyFilePath));
        }
        return builder.build();
    }
}
