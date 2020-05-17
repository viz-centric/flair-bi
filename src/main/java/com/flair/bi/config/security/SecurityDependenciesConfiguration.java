package com.flair.bi.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.data.repository.query.SecurityEvaluationContextExtension;

@Configuration
public class SecurityDependenciesConfiguration {

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
		return new SecurityEvaluationContextExtension();
	}

//    /** TODO find migration solution for this
//     * This bean is used to extract the user information from the OAuth server and
//     * save the user information in application database
//     *
//     * @param userRepository user repository
//     * @param userService    user service
//     * @return principal extractor
//     */
//    @Bean
//    public PrincipalExtractor principalExtractor(UserRepository userRepository, UserService userService) {
//        return map -> {
//            final OktaUser oktaUser = OktaUser.from(map);
//            log.debug("Okta user: {}", oktaUser);
//            Optional<User> user = userRepository.findOneByLogin(oktaUser.getUsername());
//            if (!user.isPresent()) {
//                userService.createUser(oktaUser.getUsername(), passwordEncoder().encode(RandomStringUtils.random(10)),
//                        oktaUser.getFirstName(), oktaUser.getLastName(), oktaUser.getEmail(),
//                        Constants.LanguageKeys.ENGLISH, Constants.EXTERNAL_USER);
//            }
//            return oktaUser.getUsername();
//        };
//    }
}
