package com.flair.bi.service;

import com.flair.bi.domain.DraftUser;
import com.flair.bi.domain.EmailConfirmationToken;
import com.flair.bi.domain.EmailConfirmationTokenStatus;
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

    public EmailConfirmationToken createToken(DraftUser draftUser) {
        EmailConfirmationToken token = new EmailConfirmationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setDateCreated(Instant.now());
        token.setDraftUser(draftUser);
        token.setStatus(EmailConfirmationTokenStatus.NEW);
        return emailConfirmationTokenRepository.save(token);
    }

    public EmailConfirmationToken findByToken(String token) {
        return emailConfirmationTokenRepository.findByToken(token);
    }

    public void updateStatus(EmailConfirmationToken confirmationToken, EmailConfirmationTokenStatus status) {
        confirmationToken.setStatus(status);
        emailConfirmationTokenRepository.save(confirmationToken);
    }
}
