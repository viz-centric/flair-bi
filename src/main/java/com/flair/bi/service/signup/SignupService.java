package com.flair.bi.service.signup;

import com.flair.bi.domain.DraftUser;
import com.flair.bi.service.DraftUserService;
import com.flair.bi.service.email.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SignupService {

    private final DraftUserService draftUserService;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public void signup(String username, String password, String firstname, String lastname, String email, String provider) {
        DraftUser user = draftUserService.createUser(username, password, firstname,
                lastname, email, provider);
        emailVerificationService.sendConfirmYourEmailEmail(user);
    }
}
