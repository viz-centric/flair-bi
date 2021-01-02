package com.flair.bi.web.rest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.flair.bi.domain.DraftUser;
import com.flair.bi.security.jwt.JWTConfigurer;
import com.flair.bi.security.jwt.TokenProvider;
import com.flair.bi.service.DraftUserService;
import com.flair.bi.web.rest.vm.LoginVM;
import io.micrometer.core.annotation.Timed;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import java.util.Collections;

@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class UserJWTController {

	private final TokenProvider tokenProvider;

	private final AuthenticationManager authenticationManager;

	private final DraftUserService draftUserService;

	@PostMapping("/authenticate")
	@Timed
	public ResponseEntity<?> authorize(@Valid @RequestBody LoginVM loginVM, HttpServletResponse response) {

		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
				loginVM.getUsername(), loginVM.getPassword());

		try {
			Authentication authentication = this.authenticationManager.authenticate(authenticationToken);
			SecurityContextHolder.getContext().setAuthentication(authentication);
			String jwt = tokenProvider.createToken(authentication, loginVM.isRememberMe());
			response.addHeader(JWTConfigurer.AUTHORIZATION_HEADER, "Bearer " + jwt);
			return ResponseEntity.ok(new JWTToken(jwt));
		} catch (AuthenticationException ae) {
			log.trace("Authentication exception trace: ", ae);
			return new ResponseEntity<>(Collections.singletonMap("AuthenticationException", ae.getLocalizedMessage()),
					HttpStatus.UNAUTHORIZED);
		}
	}

	@PostMapping("/signup")
	@Timed
	public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
		DraftUser user = draftUserService.createUser(request.getUsername(), request.getPassword(), request.getFirstname(),
				request.getLastname(), request.getEmail(), request.getProvider());
		return ResponseEntity.ok().build();
	}

	@Data
	private static class SignupRequest {
		@NotEmpty
		final String username;
		@NotEmpty
		final String firstname;
		@NotEmpty
		final String lastname;
		@NotEmpty
		final String password;
		@NotEmpty
		final String email;

		final String provider;
	}

	/**
	 * Object to return as body in JWT Authentication.
	 */
	static class JWTToken {

		private String idToken;

		JWTToken(String idToken) {
			this.idToken = idToken;
		}

		@JsonProperty("id_token")
		String getIdToken() {
			return idToken;
		}

		void setIdToken(String idToken) {
			this.idToken = idToken;
		}
	}
}
