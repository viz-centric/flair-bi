package com.flair.bi.config.security;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.User;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.service.UserService;
import com.google.common.collect.ImmutableSet;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.boot.autoconfigure.security.oauth2.resource.PrincipalExtractor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.data.repository.query.SecurityEvaluationContextExtension;

import java.util.Collection;
import java.util.Optional;


@Configuration
@Slf4j
public class SecurityDependenciesConfiguration {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
        return new SecurityEvaluationContextExtension();
    }

    /**
     * This bean is used to extract the user information from the OAuth server and save the user
     * information in application database
     *
     * @param userRepository user repository
     * @param userService user service
     * @return principal extractor
     */
    @Bean
    public PrincipalExtractor principalExtractor(UserRepository userRepository, UserService userService) {
        return map -> {
            map.forEach((k, v) -> log.debug("PrincipalExtractor Key :{} value :{}", k, v));
            String email = (String) map.get("email");
            Optional<User> user = userRepository.findOneByEmail(email);
            if (!user.isPresent()) {
                Collection<String> groups = (Collection<String>) map.get("groups");
                userService.createUser(email, passwordEncoder().encode(RandomStringUtils.random(10)), (String) map.get("given_name"),
                    (String) map.get("family_name"), email, Constants.LanguageKeys.ENGLISH,
                    Constants.EXTERNAL_USER, ImmutableSet.copyOf(groups));
            }
            return email;
        };
    }
}
