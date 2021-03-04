package com.flair.bi.service;

import com.flair.bi.config.firebase.FirebaseProperties;
import com.flair.bi.domain.Realm;
import com.flair.bi.service.auth.AuthService;
import com.flair.bi.service.impl.RealmService;
import com.flair.bi.service.signup.SignUpWithProviderResult;
import com.flair.bi.service.signup.SignupService;
import com.flair.bi.web.rest.vm.RealmInfo;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProviderRegistrationService {

    private final SignupService signupService;
    private final FirebaseProperties firebaseProperties;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;
    private final RealmService realmService;
    private final AuthService authService;

    @SneakyThrows
    public RegisterResult register(String idToken, Long realmId) {
        if (!firebaseProperties.isEnabled()) {
            throw new IllegalStateException("Cannot register external user if firebase is not enabled");
        }

        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        String email = decodedToken.getEmail();
        UserDetails userDetails = null;
        try {
            userDetails = userDetailsService.loadUserByUsername(email);
        } catch (UsernameNotFoundException e) {
            log.info("User {} not found so registering a new user - {}", email, e.getMessage());
        }

        if (userDetails != null) {
            if (realmId == null) {
                Set<Realm> realms = realmService.findAllByUsername(userDetails.getUsername());
                if (realms.size() > 1) {
                    return RegisterResult.builder()
                            .realms(realms.stream()
                                    .map(r -> new RealmInfo(r.getName(), r.getId()))
                                    .collect(Collectors.toList()))
                            .build();
                } else if (realms.size() == 1) {
                    realmId = realms.stream().findFirst().orElseThrow().getId();
                }
            }
            String token = authService.auth(userDetails, realmService.findOneAsRealm(realmId));
            return RegisterResult.builder()
                    .jwt(token)
                    .build();
        }

        List<String> names = getNames(decodedToken);
        String signInProvider = getSignInProvider(decodedToken);

        SignUpWithProviderResult signupResult = signupService.signupWithProvider(email,
                passwordEncoder.encode(RandomStringUtils.random(10)),
                names.get(0),
                names.get(1),
                email,
                signInProvider);

        return RegisterResult.builder()
                .emailConfirmationToken(signupResult.getEmailToken())
                .build();
    }

    private List<String> getNames(FirebaseToken decodedToken) {
        if (decodedToken.getName() == null) {
            return Arrays.asList("Github", "User");
        }
        String name = decodedToken.getName();
        List<String> names = Arrays.asList(name.split(" ", 2));
        if (names.size() == 1) {
            names.add(names.get(0));
        }
        return names;
    }

    private String getSignInProvider(FirebaseToken decodedToken) {
        Map<String, Object> firebase = (Map<String, Object>) decodedToken.getClaims().get("firebase");
        return (String) firebase.get("sign_in_provider");
    }

    @Data
    @Builder
    public static class RegisterResult {
        private final String emailConfirmationToken;
        private final String jwt;
        private final List<RealmInfo> realms;
    }
}
