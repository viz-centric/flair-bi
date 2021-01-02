package com.flair.bi.service.email;

import com.flair.bi.domain.DraftUser;
import com.flair.bi.service.EmailConfirmationTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final SendGridService sendGridService;
    private final EmailConfirmationTokenService emailConfirmationTokenService;

    public void sendConfirmYourEmailEmail(DraftUser user) {
        log.debug("Sending email confirmation email {} customer name {}", user.getEmail(), user.getFirstName());
        String confirmationToken = emailConfirmationTokenService.createToken(user.getId());
        sendGridService.sendConfirmYourEmailEmail(user.getEmail(),
                user.getFirstName() + user.getLastName(),
                confirmationToken);
    }
}
