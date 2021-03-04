package com.flair.bi.security.jwt;

import com.flair.bi.config.firebase.FirebaseProperties;
import com.flair.bi.security.UserAuthInfo;
import com.google.auth.oauth2.OAuth2Credentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.FirebaseAuth;
import io.github.jhipster.config.JHipsterProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Base64;
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
	private static final SignatureAlgorithm SIGNATURE_ALGORITHM = SignatureAlgorithm.HS256;

	private Key key;

	private long tokenValidity;

	private long tokenValidityForRememberMe;

	private final JHipsterProperties jHipsterProperties;

	private final FirebaseProperties firebaseProperties;

	private final UserDetailsService userDetailsService;

	@Autowired
	@Qualifier("firebaseCredentials")
	private OAuth2Credentials firebaseCredentials;


	@Override
	public void afterPropertiesSet() throws Exception {
		if (firebaseProperties.isEnabled()) {
			ServiceAccountCredentials ser = (ServiceAccountCredentials) this.firebaseCredentials;
			this.key = ser.getPrivateKey();
		} else {
			String secret = jHipsterProperties.getSecurity().getAuthentication().getJwt().getSecret();
			byte[] keyBytes = DatatypeConverter.parseBase64Binary(
					Base64.getEncoder().encodeToString(secret.getBytes(StandardCharsets.UTF_8))
			);
			this.key = new SecretKeySpec(keyBytes, SIGNATURE_ALGORITHM.getJcaName());
			this.tokenValidity = jHipsterProperties.getSecurity().getAuthentication().getJwt().getTokenValidityInSeconds();
			this.tokenValidityForRememberMe = jHipsterProperties.getSecurity().getAuthentication().getJwt().getTokenValidityInSecondsForRememberMe();
		}
	}

	@SneakyThrows
	public String createToken(Authentication authentication, boolean rememberMe) {

		UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) authentication;
		UserAuthInfo details = (UserAuthInfo) token.getDetails();

		if (firebaseProperties.isEnabled()) {
			Map<String, Object> keys = new HashMap<>();
			keys.put(EMAIL_KEY, authentication.getName());
			keys.put(REAML_KEY, details.getRealmId());
			return FirebaseAuth.getInstance().createCustomToken(authentication.getName(), keys);
		}

		long now = (new Date()).getTime();
		Date validity;
		if (rememberMe) {
			validity = new Date(now + this.tokenValidityForRememberMe);
		} else {
			validity = new Date(now + this.tokenValidity);
		}

		JwtBuilder builder = Jwts.builder();

		if (details != null && details.getRealmId() != null) {
			builder.claim(REAML_KEY, details.getRealmId());
		}

		return builder
				.setSubject(authentication.getName())
				.signWith(key, SIGNATURE_ALGORITHM)
				.setExpiration(validity)
				.compact();
	}

	@SneakyThrows
	public Authentication getAuthentication(String token) {
		Claims claims = Jwts.parserBuilder()
				.setSigningKey(key)
				.build()
				.parseClaimsJws(token)
				.getBody();

		Long realmId;
		String email;
		if (firebaseProperties.isEnabled()) {
			email = claims.get("uid").toString();
			Map<String, Object> customClaims = (Map<String, Object>) claims.get("claims");
			realmId = Long.parseLong(customClaims.get(REAML_KEY).toString());
		} else {
			email = claims.getSubject();
			realmId = Long.parseLong(claims.get(REAML_KEY).toString());
		}

		return getUsernamePasswordAuthenticationToken(email, token, realmId);
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
			return getAuthentication(authToken) != null;
		} catch (JwtException | IllegalArgumentException e) {
			log.info("Invalid JWT token.", e);
		}
		return false;
	}
}
