package com.flair.bi.service;

import com.flair.bi.config.grpc.JwtCredential;
import io.grpc.CallCredentials;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

import static com.flair.bi.security.SecurityUtils.getCurrentUserLogin;

@Service
@RequiredArgsConstructor
@Slf4j
public class GrpcCredentialsService {

    @Value("${app.auth.jwt-key:}")
    private String jwtKey;

    public Optional<CallCredentials> getCredentials() {
        String currentUserLogin = getCurrentUserLogin();
        log.debug("Grpc credentials current user login {}", currentUserLogin);
        return Optional.of(new JwtCredential(jwtKey, currentUserLogin));
    }

}
