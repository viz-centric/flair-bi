package com.flair.bi.service.signup;

import com.flair.bi.domain.DraftUser;
import com.flair.bi.domain.EmailConfirmationToken;
import com.flair.bi.service.DraftUserService;
import com.flair.bi.service.EmailConfirmationTokenService;
import com.flair.bi.service.email.EmailVerificationService;
import com.flair.bi.service.impl.RealmService;
import com.flair.bi.service.impl.ReplicateRealmResult;
import com.flair.bi.web.rest.dto.RealmDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class SignupService {

    private final DraftUserService draftUserService;
    private final RealmService realmService;
    private final EmailVerificationService emailVerificationService;
    private final EmailConfirmationTokenService emailConfirmationTokenService;

    @Transactional
    public void signup(String username, String password, String firstname, String lastname, String email, String provider) {
        DraftUser user = draftUserService.createUser(username, password, firstname,
                lastname, email, provider);
        emailVerificationService.sendConfirmYourEmailEmail(user);
    }

    @Transactional
    public ConfirmUserResult confirmUser(Long realmId, String emailVerificationToken, String realmCreationToken) {
        RealmDTO realm = realmService.findOne(realmId);
        if (!Objects.equals(realm.getToken(), realmCreationToken)) {
            throw new IllegalStateException("Realm does not belong to that user " + realm + " token " + realmCreationToken);
        }
        EmailConfirmationToken emailConfirmationToken = emailConfirmationTokenService.findByToken(emailVerificationToken);
        DraftUser draftUser = emailConfirmationToken.getDraftUser();

        ReplicateRealmResult result = realmService.replicateRealm(realm.getId(), draftUser);
        return ConfirmUserResult.builder()
                .jwtToken(result.getJwtToken())
                .build();
    }
}
