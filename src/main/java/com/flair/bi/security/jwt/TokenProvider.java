package com.flair.bi.security.jwt;

import com.flair.bi.config.firebase.FirebaseProperties;
import com.flair.bi.security.UserAuthInfo;
import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import io.github.jhipster.config.JHipsterProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class TokenProvider implements InitializingBean {

	private static final String REAML_KEY = "realm";
	private static final String EMAIL_KEY = "email";
	private static final List<AuthErrorCode> TOKEN_ERROR_CODES = Arrays.asList(AuthErrorCode.EXPIRED_ID_TOKEN, AuthErrorCode.INVALID_ID_TOKEN);

	private Key key;

	private long tokenValidityInMilliseconds;

	private long tokenValidityInMillisecondsForRememberMe;

	private final JHipsterProperties jHipsterProperties;

	private final FirebaseProperties firebaseProperties;

	private final UserDetailsService userDetailsService;

	@Override
	public void afterPropertiesSet() throws Exception {
		byte[] keyBytes;
		String secret = jHipsterProperties.getSecurity().getAuthentication().getJwt().getSecret();
		if (!StringUtils.isEmpty(secret)) {
			log.warn("Warning: the JWT key used is not Base64-encoded. "
					+ "We recommend using the `jhipster.security.authentication.jwt.base64-secret` key for optimum security.");
			keyBytes = secret.getBytes(StandardCharsets.UTF_8);
		} else {
			log.debug("Using a Base64-encoded JWT secret key");
			keyBytes = Decoders.BASE64
					.decode(jHipsterProperties.getSecurity().getAuthentication().getJwt().getBase64Secret());
		}
		this.key = Keys.hmacShaKeyFor(keyBytes);
		this.tokenValidityInMilliseconds = 1000
				* jHipsterProperties.getSecurity().getAuthentication().getJwt().getTokenValidityInSeconds();
		this.tokenValidityInMillisecondsForRememberMe = 1000 * jHipsterProperties.getSecurity().getAuthentication()
				.getJwt().getTokenValidityInSecondsForRememberMe();
	}

	@SneakyThrows
	public String createToken(Authentication authentication, boolean rememberMe) {

		UserAuthInfo details = null;
		if (authentication instanceof UsernamePasswordAuthenticationToken) {
			UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) authentication;
			details = (UserAuthInfo) token.getDetails();
		}

		if (firebaseProperties.isEnabled()) {
			UserAuthInfo finalDetails = details;
			Map<String, Object> keys = new HashMap<>();
			keys.put(EMAIL_KEY, authentication.getName());
			if (details != null && details.getRealmId() != null) {
				keys.put(REAML_KEY, finalDetails.getRealmId());
			}
			return FirebaseAuth.getInstance()
					.createCustomToken(authentication.getName(), keys);
		}

		long now = (new Date()).getTime();
		Date validity;
		if (rememberMe) {
			validity = new Date(now + this.tokenValidityInMillisecondsForRememberMe);
		} else {
			validity = new Date(now + this.tokenValidityInMilliseconds);
		}

		JwtBuilder builder = Jwts.builder();

		if (details != null && details.getRealmId() != null) {
			builder.claim(REAML_KEY, details.getRealmId());
		}

		return builder
				.setSubject(authentication.getName())
				.signWith(key, SignatureAlgorithm.HS512)
				.setExpiration(validity)
				.compact();
	}

	@SneakyThrows
	public Authentication getAuthentication(String token) {
		if (firebaseProperties.isEnabled()) {
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
			String email = decodedToken.getEmail();

			Long realmId = null;
			if (decodedToken.getClaims() != null) {
				realmId = Long.valueOf(decodedToken.getClaims().get(REAML_KEY).toString());
			}

			return getUsernamePasswordAuthenticationToken(email, token, realmId);
		}

		Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();

		Long realmId = null;
		Object realmStr = claims.get(REAML_KEY);
		if (realmStr != null) {
			realmId = Long.parseLong(realmStr.toString());
		}

		String subject = claims.getSubject();
		return getUsernamePasswordAuthenticationToken(subject, token, realmId);
	}

	private UsernamePasswordAuthenticationToken getUsernamePasswordAuthenticationToken(String username, String credentials, Long realmId) {
		UserDetails userDetails = userDetailsService.loadUserByUsername(username);
		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails,
				credentials,
				userDetails.getAuthorities());
		authenticationToken.setDetails(new UserAuthInfo(realmId));
		return authenticationToken;
	}

	public boolean validateToken(String authToken) {
		try {
			if (firebaseProperties.isEnabled()) {
				FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(authToken);
				String uid = decodedToken.getUid();
				return !org.apache.commons.lang3.StringUtils.isEmpty(uid);
			}
			Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			log.info("Invalid JWT token.", e);
		} catch (FirebaseAuthException e) {
			log.info("Firebase invalid JWT token.", e);
		}
		return false;
	}
}
