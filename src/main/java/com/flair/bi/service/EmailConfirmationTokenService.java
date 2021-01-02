package com.flair.bi.service;

import com.flair.bi.domain.EmailConfirmationToken;
import com.flair.bi.repository.EmailConfirmationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailConfirmationTokenService {

    private final EmailConfirmationTokenRepository emailConfirmationTokenRepository;

    public String createToken(Long draftUserId) {
        EmailConfirmationToken token = new EmailConfirmationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setDateCreated(Instant.now());
        token.setDraftUserId(draftUserId);
        EmailConfirmationToken emailConfirmationToken = emailConfirmationTokenRepository.save(token);
        return emailConfirmationToken.getToken();
    }
}
