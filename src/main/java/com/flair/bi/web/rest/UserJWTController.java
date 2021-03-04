package com.flair.bi.web.rest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.flair.bi.domain.Realm;
import com.flair.bi.security.jwt.JWTConfigurer;
import com.flair.bi.service.auth.AuthService;
import com.flair.bi.service.impl.RealmService;
import com.flair.bi.service.signup.ConfirmUserResult;
import com.flair.bi.service.signup.SignupService;
import com.flair.bi.web.rest.vm.AuthorizeRequest;
import com.flair.bi.web.rest.vm.RealmInfo;
import io.micrometer.core.annotation.Timed;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class UserJWTController {

	private final AuthService authService;

	private final SignupService signupService;

	private final RealmService realmService;

	@PostMapping("/authenticate")
	@Timed
	public ResponseEntity<?> authorize(@Valid @RequestBody AuthorizeRequest authorizeRequest, HttpServletResponse response) {
		try {
			if (authorizeRequest.getRealmId() == null) {
				authService.auth(authorizeRequest.getUsername(), authorizeRequest.getPassword());
				Set<Realm> realms = realmService.findAllByUsername(authorizeRequest.getUsername());
				if (realms.size() > 1) {
					return ResponseEntity.ok(
							AuthorizeResponse.builder()
									.realms(realms.stream()
											.map(r -> new RealmInfo(r.getName(), r.getId()))
											.collect(Collectors.toList()))
									.build()
					);
				} else if (realms.size() == 1) {
					Long realmId = realms.stream().findFirst().orElseThrow().getId();
					authorizeRequest.setRealmId(realmId);
				}
			}

			String jwt = authService.auth(authorizeRequest.getUsername(),
					authorizeRequest.getPassword(),
					authorizeRequest.isRememberMe(),
					authorizeRequest.getRealmId());

			response.addHeader(JWTConfigurer.AUTHORIZATION_HEADER, "Bearer " + jwt);
			return ResponseEntity.ok(
					AuthorizeResponse.builder()
							.idToken(jwt)
							.build()
			);
		} catch (AuthenticationException ae) {
			log.debug("Authentication exception trace: ", ae);
			return new ResponseEntity<>(Collections.singletonMap("AuthenticationException", ae.getLocalizedMessage()),
					HttpStatus.UNAUTHORIZED);
		}
	}

	@PostMapping("/signup")
	@Timed
	public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
		signupService.signup(request.getUsername(), request.getPassword(), request.getFirstname(),
				request.getLastname(), request.getEmail(), request.getProvider());
		return ResponseEntity.ok().build();
	}

	@Data
	public static class SignupRequest {
		@NotEmpty
		String username;
		@NotEmpty
		String firstname;
		@NotEmpty
		String lastname;
		@NotEmpty
		String password;
		@NotEmpty
		String email;

		String provider;
	}

	@PostMapping("/confirm_user")
	@Timed
	public ResponseEntity<?> confirmUser(@Valid @RequestBody ConfirmUserRequest request,
														   HttpServletResponse response) {
		log.info("Confirm user {}", request);
		try {
			ConfirmUserResult result = signupService.confirmUser(request.getRealmId(), request.getEmailVerificationToken(), request.getRealmCreationToken());
			response.addHeader(JWTConfigurer.AUTHORIZATION_HEADER, "Bearer " + result.getJwtToken());
			return ResponseEntity.ok(AuthorizeResponse.builder()
					.idToken(result.getJwtToken())
					.build());
		} catch (AuthenticationException ae) {
			log.trace("Authentication exception trace: ", ae);
			return new ResponseEntity<>(Collections.singletonMap("AuthenticationException", ae.getLocalizedMessage()),
					HttpStatus.UNAUTHORIZED);
		}
	}

	@Data
	public static class ConfirmUserRequest {
		@NotNull
		Long realmId;
		@NotEmpty
		String emailVerificationToken;
		@NotEmpty
		String realmCreationToken;
	}

	@Data
	@RequiredArgsConstructor
	@Builder
	private static class AuthorizeResponse {
		@JsonProperty("id_token")
		private final String idToken;
		private final List<RealmInfo> realms;
	}
}
