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
public class ClientGrpcConfig {

    private final GrpcProperties properties;

    private final EurekaClient eurekaClient;

    @Bean(name = "engineChannelFactory")
    public ManagedChannelFactory engineChannelFactory() {
        return createManagedChannelFactory(
                properties.getServer().getEngineServiceName(),
                properties.getTls().isEnabled(),
                properties.getTls().getTrustCertCollectionFile(),
                properties.getTls().getClientCertChainFile(),
                properties.getTls().getClientPrivateKeyFile()
        );
    }

    @Bean(name = "notificationsChannelFactory")
    public ManagedChannelFactory notificationsChannelFactory() {
        return createManagedChannelFactory(
                properties.getServer().getNotificationsServiceName(),
                properties.getTls().isEnabled(),
                properties.getTls().getNotificationsTrustCertCollectionFile(),
                properties.getTls().getNotificationsClientCertChainFile(),
                properties.getTls().getNotificationsClientPrivateKeyFile()
        );
    }

    private ManagedChannelFactory createManagedChannelFactory(String serviceName,
                                                              boolean tlsEnabled,
                                                              String trustCertCollectionFile,
                                                              String clientCertChainFile,
                                                              String clientPrivateKeyFile) {
        Supplier<ManagedChannel> dynamicManagedChannel = () -> {
            log.info("GRPC client config: Configuring GRPC message channel serviceName {} tlsEnabled {} trustCertCollectionFile {} clientCertChainFile {} clientPrivateKeyFile {}",
                    serviceName, tlsEnabled, trustCertCollectionFile, clientCertChainFile, clientPrivateKeyFile);

            final InstanceInfo instanceInfo = eurekaClient.getNextServerFromEureka(
                    serviceName,
                    false);

            final NettyChannelBuilder nettyChannelBuilder = NettyChannelBuilder.forAddress(
                    tlsEnabled ? instanceInfo.getHostName() : instanceInfo.getIPAddr(),
                    instanceInfo.getPort()
            );

            log.info("GRPC client config: Hostname {} IP {} port {} secure port {} secure vip {}",
                    instanceInfo.getHostName(), instanceInfo.getIPAddr(), instanceInfo.getPort(), instanceInfo.getSecurePort(),
                    instanceInfo.getSecureVipAddress());

            if (tlsEnabled) {

                nettyChannelBuilder.negotiationType(NegotiationType.TLS);

                log.info("GRPC client config: GRPC TLS enabled");

                try {
                    nettyChannelBuilder.sslContext(buildSslContext(
                            trustCertCollectionFile,
                            clientCertChainFile,
                            clientPrivateKeyFile
                    ));
                } catch (SSLException e) {
                    log.error("GRPC client config: error", e);
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
