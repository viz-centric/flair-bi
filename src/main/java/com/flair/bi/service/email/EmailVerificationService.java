package com.flair.bi.service.email;

import com.flair.bi.domain.DraftUser;
import com.flair.bi.domain.EmailConfirmationToken;
import com.flair.bi.domain.EmailConfirmationTokenStatus;
import com.flair.bi.service.EmailConfirmationTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final SendGridService sendGridService;
    private final EmailConfirmationTokenService emailConfirmationTokenService;

    public void sendConfirmYourEmailEmail(DraftUser user) {
        log.debug("Sending email confirmation email {} customer name {}", user.getEmail(), user.getFirstName());
        EmailConfirmationToken confirmationToken = emailConfirmationTokenService.createToken(user);
        sendGridService.sendConfirmYourEmailEmail(user.getEmail(),
                user.getFirstName() + user.getLastName(),
                confirmationToken.getToken());
    }

    @Transactional
    public void confirmEmail(String token) {
        log.info("Confirming email for token {}", token);
        EmailConfirmationToken confirmationToken = emailConfirmationTokenService.findByToken(token);
        emailConfirmationTokenService.updateStatus(confirmationToken, EmailConfirmationTokenStatus.CONFIRMED);
    }
}
