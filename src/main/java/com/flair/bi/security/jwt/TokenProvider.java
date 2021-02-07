package com.flair.bi.security.jwt;

import com.flair.bi.config.firebase.FirebaseProperties;
import com.flair.bi.security.PermissionGrantedAuthority;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import io.github.jhipster.config.JHipsterProperties;
import io.jsonwebtoken.Claims;
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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class TokenProvider implements InitializingBean {

	private static final String AUTHORITIES_KEY = "auth";
	private static final String EMAIL_KEY = "email";

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
		String authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority)
				.collect(Collectors.joining(","));
		if (firebaseProperties.isEnabled()) {
			return FirebaseAuth.getInstance()
					.createCustomToken(authentication.getName(), Map.of(
							AUTHORITIES_KEY, authorities,
							EMAIL_KEY, ((UserDetails)authentication.getPrincipal()).getUsername()
					));
		}

		long now = (new Date()).getTime();
		Date validity;
		if (rememberMe) {
			validity = new Date(now + this.tokenValidityInMillisecondsForRememberMe);
		} else {
			validity = new Date(now + this.tokenValidityInMilliseconds);
		}

		return Jwts.builder().setSubject(authentication.getName()).claim(AUTHORITIES_KEY, authorities)
				.signWith(key, SignatureAlgorithm.HS512).setExpiration(validity).compact();
	}

	@SneakyThrows
	public Authentication getAuthentication(String token) {

		if (firebaseProperties.isEnabled()) {
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
			String email = decodedToken.getEmail();
			UserDetails userDetails = userDetailsService.loadUserByUsername(email);
			return new UsernamePasswordAuthenticationToken(userDetails, token, userDetails.getAuthorities());
//			Map<String, Object> claims = decodedToken.getClaims();
//			Object a = claims.get(AUTHORITIES_KEY);
//			if (a != null) {
//				authorities = Arrays
//						.stream(a.toString().split(",")).map(PermissionGrantedAuthority::new)
//						.collect(Collectors.toList());
//			} else {
//				authorities = new ArrayList<>();
//			}
//			subject = email;
		}

		Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
		Collection<? extends GrantedAuthority> authorities = Arrays
				.stream(claims.get(AUTHORITIES_KEY).toString().split(",")).map(PermissionGrantedAuthority::new)
				.collect(Collectors.toList());
		String subject = claims.getSubject();

		User principal = new User(subject, "", authorities);

		return new UsernamePasswordAuthenticationToken(principal, token, authorities);
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
		} catch (JwtException | IllegalArgumentException | FirebaseAuthException e) {
			log.info("Invalid JWT token.", e);
		}
		return false;
	}
}
