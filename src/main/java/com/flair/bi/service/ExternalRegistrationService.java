package com.flair.bi.service;

import com.flair.bi.config.Constants;
import com.flair.bi.config.firebase.FirebaseProperties;
import com.flair.bi.domain.User;
import com.flair.bi.security.jwt.TokenProvider;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.RandomStringUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExternalRegistrationService {

    private final UserService userService;
    private final FirebaseProperties firebaseProperties;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;

    @SneakyThrows
    public RegisterResult register(String idToken) {
        if (!firebaseProperties.isEnabled()) {
            throw new IllegalStateException("Cannot register external user if firebase is not enabled");
        }

        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        String email = decodedToken.getEmail().toLowerCase();
        List<String> names = Arrays.asList(decodedToken.getName().split(" ", 2));
        if (names.size() == 1) {
            names.add(names.get(0));
        }

        User user = userService.getUserByEmailAnyRealm(email)
                .orElseGet(() -> userService.createUser(email,
                        passwordEncoder.encode(RandomStringUtils.random(10)),
                        names.get(0),
                        names.get(1),
                        email,
                        Constants.LanguageKeys.ENGLISH,
                        Constants.EXTERNAL_USER));

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                user.getEmail(), user.getPassword());

        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.createToken(authentication, false);
        return new RegisterResult(jwt);
    }

    @Data
    public static class RegisterResult {
        private final String jwt;
    }
}
