package com.flair.bi.web.rest;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.PersistentToken;
import com.flair.bi.domain.User;
import com.flair.bi.repository.PersistentTokenRepository;
import com.flair.bi.security.AuthoritiesConstants;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.security.jwt.JWTConfigurer;
import com.flair.bi.service.MailService;
import com.flair.bi.service.ProviderRegistrationService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.UserDTO;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.vm.KeyAndPasswordVM;
import com.flair.bi.web.rest.vm.ManagedUserVM;
import com.flair.bi.web.rest.vm.RealmInfo;
import io.micrometer.core.annotation.Timed;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Nullable;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AccountResource {

	private final UserService userService;

	private final ProviderRegistrationService providerRegistrationService;

	private final PersistentTokenRepository persistentTokenRepository;

	private final MailService mailService;

	/**
	 * POST /register : register the user.
	 *
	 * @param managedUserVM the managed user View Model
	 * @return the ResponseEntity with status 201 (Created) if the user is
	 *         registered or 400 (Bad Request) if the login or e-mail is already in
	 *         use
	 */
	@PostMapping(path = "/register", produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE })
	@Timed
	public ResponseEntity<?> registerAccount(@Valid @RequestBody ManagedUserVM managedUserVM) {

		HttpHeaders textPlainHeaders = new HttpHeaders();
		textPlainHeaders.setContentType(MediaType.TEXT_PLAIN);

		return userService.getUserByLogin(managedUserVM.getLogin().toLowerCase())
				.map(user -> new ResponseEntity<>("login already in use", textPlainHeaders, HttpStatus.BAD_REQUEST))
				.orElseGet(() -> userService.getUserByEmail(managedUserVM.getEmail())
						.map(user -> new ResponseEntity<>("e-mail address already in use", textPlainHeaders,
								HttpStatus.BAD_REQUEST))
						.orElseGet(() -> {
							User user = userService.createUser(managedUserVM.getLogin(), managedUserVM.getPassword(),
									managedUserVM.getFirstName(), managedUserVM.getLastName(),
									managedUserVM.getEmail().toLowerCase(), managedUserVM.getLangKey(), null);

							mailService.sendActivationEmail(user);
							return new ResponseEntity<>(HttpStatus.CREATED);
						}));
	}

	@PostMapping(path = "/registerWithProvider")
	@Timed
	public ResponseEntity<RegisterWithProviderResponse> registerWithProvider(@Valid @RequestBody RegisterWithProviderRequest request,
												  HttpServletResponse response) {
		ProviderRegistrationService.RegisterResult result = providerRegistrationService.register(request.getIdToken(), request.getRealmId());
		if (result.getJwt() != null) {
			response.addHeader(JWTConfigurer.AUTHORIZATION_HEADER, "Bearer " + result.getJwt());
		}
		return ResponseEntity.ok(RegisterWithProviderResponse.builder()
				.token(
						result.getEmailConfirmationToken()
				)
				.realms(
						Optional.ofNullable(result.getRealms())
								.map(realms -> realms.stream().map(r -> new RealmInfo(r.getName(), r.getId())).collect(Collectors.toList()))
								.orElse(null)
				)
				.build());
	}

	@Data
	private static class RegisterWithProviderRequest {
		@NotEmpty
		private String idToken;
		@Nullable
		private Long realmId;
	}

	@Data
	@Builder
	private static class RegisterWithProviderResponse {
		private final String token;
		private final List<RealmInfo> realms;
	}

	/**
	 * GET /activate : activate the registered user.
	 *
	 * @param key the activation key
	 * @return the ResponseEntity with status 200 (OK) and the activated user in
	 *         body, or status 500 (Internal Server Error) if the user couldn't be
	 *         activated
	 */
	@GetMapping("/activate")
	@Timed
	@Secured(AuthoritiesConstants.ADMIN)
	public ResponseEntity<String> activateAccount(@RequestParam(value = "key") String key) {
		return userService.activateRegistration(key).map(user -> new ResponseEntity<String>(HttpStatus.OK))
				.orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
	}

	/**
	 * GET /authenticate : check if the user is authenticated, and return its login.
	 *
	 * @param request the HTTP request
	 * @return the login if the user is authenticated
	 */
	@GetMapping("/authenticate")
	@Timed
	public String isAuthenticated(HttpServletRequest request) {
		log.debug("REST request to check if the current user is authenticated");
		return request.getRemoteUser();
	}

	/**
	 * GET /account : get the current user.
	 *
	 * @return the ResponseEntity with status 200 (OK) and the current user in body,
	 *         or status 500 (Internal Server Error) if the user couldn't be
	 *         returned
	 */
	@GetMapping("/account")
	@Timed
	public ResponseEntity<UserDTO> getAccount() {
		User userWithAuthorities = userService.getUserWithAuthorities();
		return Optional.ofNullable(userWithAuthorities)
				.map(user -> new ResponseEntity<>(new UserDTO(user), HttpStatus.OK))
				.orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
	}

	/**
	 * POST /account : update the current user information.
	 *
	 * @param userDTO the current user information
	 * @return the ResponseEntity with status 200 (OK), or status 400 (Bad Request)
	 *         or 500 (Internal Server Error) if the user couldn't be updated
	 */
	@PostMapping("/account")
	@Timed
	public ResponseEntity<String> saveAccount(@Valid @RequestBody UserDTO userDTO) {
		Optional<User> existingUser = userService.getUserByEmail(userDTO.getEmail());
		if (existingUser.isPresent() && (!existingUser.get().getLogin().equalsIgnoreCase(userDTO.getLogin()))) {
			return ResponseEntity.badRequest()
					.headers(HeaderUtil.createFailureAlert("user-management", "emailexists", "Email already in use"))
					.body(null);
		}
		return userService.getUserByLogin(SecurityUtils.getCurrentUserLogin()).map(u -> {
			userService.updateUser(userDTO.getFirstName(), userDTO.getLastName(), userDTO.getEmail(),
					userDTO.getLangKey());
			return new ResponseEntity<String>(HttpStatus.OK);
		}).orElseGet(() -> new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
	}

	/**
	 * POST /account/change_password : changes the current user's password
	 *
	 * @param password the new password
	 * @return the ResponseEntity with status 200 (OK), or status 400 (Bad Request)
	 *         if the new password is not strong enough
	 */
	@PostMapping(path = "/account/change_password", produces = MediaType.TEXT_PLAIN_VALUE)
	@Timed
	public ResponseEntity<?> changePassword(@RequestBody String password) {
		if (!checkPasswordLength(password)) {
			return new ResponseEntity<>("Incorrect password", HttpStatus.BAD_REQUEST);
		}
		userService.changePassword(password);
		return new ResponseEntity<>(HttpStatus.OK);
	}

	/**
	 * GET /account/sessions : get the current open sessions.
	 *
	 * @return the ResponseEntity with status 200 (OK) and the current open sessions
	 *         in body, or status 500 (Internal Server Error) if the current open
	 *         sessions couldn't be retrieved
	 */
	@GetMapping("/account/sessions")
	@Timed
	public ResponseEntity<List<PersistentToken>> getCurrentSessions() {
		return userService.getUserByLogin(SecurityUtils.getCurrentUserLogin())
				.map(user -> new ResponseEntity<>(persistentTokenRepository.findByUser(user), HttpStatus.OK))
				.orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
	}

	/**
	 * DELETE /account/sessions?series={series} : invalidate an existing session.
	 * <p>
	 * - You can only delete your own sessions, not any other user's session - If
	 * you delete one of your existing sessions, and that you are currently logged
	 * in on that session, you will still be able to use that session, until you
	 * quit your browser: it does not work in real time (there is no API for that),
	 * it only removes the "remember me" cookie - This is also true if you
	 * invalidate your current session: you will still be able to use it until you
	 * close your browser or that the session times out. But automatic login (the
	 * "remember me" cookie) will not work anymore. There is an API to invalidate
	 * the current session, but there is no API to check which session uses which
	 * cookie.
	 *
	 * @param series the series of an existing session
	 * @throws UnsupportedEncodingException if the series couldnt be URL decoded
	 */
	@DeleteMapping("/account/sessions/{series}")
	@Timed
	public void invalidateSession(@PathVariable String series) throws UnsupportedEncodingException {
		String decodedSeries = URLDecoder.decode(series, "UTF-8");
		userService.getUserByLogin(SecurityUtils.getCurrentUserLogin()).ifPresent(u -> {
			persistentTokenRepository.findByUser(u).stream()
					.filter(persistentToken -> StringUtils.equals(persistentToken.getSeries(), decodedSeries)).findAny()
					.ifPresent(t -> persistentTokenRepository.deleteById(decodedSeries));
		});
	}

	/**
	 * POST /account/reset_password/init : Send an e-mail to reset the password of
	 * the user
	 *
	 * @param mail the mail of the user
	 * @return the ResponseEntity with status 200 (OK) if the e-mail was sent, or
	 *         status 400 (Bad Request) if the e-mail address is not registered
	 */
	@PostMapping(path = "/account/reset_password/init", produces = MediaType.TEXT_PLAIN_VALUE)
	@Timed
	public ResponseEntity<?> requestPasswordReset(@RequestBody String mail) {
		return userService.requestPasswordReset(mail).map(user -> {
			if (user.getUserType().equals(Constants.EXTERNAL_USER))
				return new ResponseEntity<>("e-mail address is linked to external login", HttpStatus.BAD_REQUEST);
			mailService.sendPasswordResetMail(user);
			return new ResponseEntity<>("e-mail was sent", HttpStatus.OK);
		}).orElse(new ResponseEntity<>("e-mail address not registered", HttpStatus.BAD_REQUEST));
	}

	/**
	 * POST /account/reset_password/finish : Finish to reset the password of the
	 * user
	 *
	 * @param keyAndPassword the generated key and the new password
	 * @return the ResponseEntity with status 200 (OK) if the password has been
	 *         reset, or status 400 (Bad Request) or 500 (Internal Server Error) if
	 *         the password could not be reset
	 */
	@PostMapping(path = "/account/reset_password/finish", produces = MediaType.TEXT_PLAIN_VALUE)
	@Timed
	public ResponseEntity<String> finishPasswordReset(@RequestBody KeyAndPasswordVM keyAndPassword) {
		if (!checkPasswordLength(keyAndPassword.getNewPassword())) {
			return new ResponseEntity<>("Incorrect password", HttpStatus.BAD_REQUEST);
		}
		return userService.completePasswordReset(keyAndPassword.getNewPassword(), keyAndPassword.getKey())
				.map(user -> new ResponseEntity<String>(HttpStatus.OK))
				.orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
	}

	private boolean checkPasswordLength(String password) {
		return (!StringUtils.isEmpty(password) && password.length() >= ManagedUserVM.PASSWORD_MIN_LENGTH
				&& password.length() <= ManagedUserVM.PASSWORD_MAX_LENGTH);
	}
}
