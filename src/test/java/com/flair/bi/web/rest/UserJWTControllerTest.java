package com.flair.bi.web.rest;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.junit.Ignore;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.User;
import com.flair.bi.security.jwt.TokenProvider;
import com.flair.bi.web.rest.vm.LoginVM;

@Ignore
public class UserJWTControllerTest extends AbstractIntegrationTest {

	@MockBean
	AuthenticationManager authenticationManager;
	@MockBean
	TokenProvider tokenProvider;

	@Test
	public void authorize() {
		LoginVM loginVM = new LoginVM();
		loginVM.setPassword("passwd");
		loginVM.setRememberMe(true);
		loginVM.setUsername("usr");

		User principal = new User();
		User credentials = new User();
		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(principal, credentials);
		when(authenticationManager.authenticate(any(Authentication.class)))
				.thenReturn(authenticationToken);

		when(tokenProvider.createToken(eq(authenticationToken), eq(true)))
				.thenReturn("token");

		ResponseEntity<Map> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/authenticate",
						HttpMethod.POST,
						new HttpEntity<>(loginVM),
						Map.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("token", response.getBody().get("id_token"));
	}
}