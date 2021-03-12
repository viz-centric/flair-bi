package com.flair.bi.service;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.DraftUser;
import com.flair.bi.repository.DraftUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class DraftUserService {

	private final PasswordEncoder passwordEncoder;
	private final DraftUserRepository draftUserRepository;

	public DraftUser createUser(String login, String password, String firstName, String lastName, String email) {
		return createUser(login, password, firstName, lastName, email, null);
	}

	public DraftUser createUser(String login, String password, String firstName, String lastName, String email,
								String userType) {
		DraftUser user = new DraftUser();
		String encryptedPassword = passwordEncoder.encode(password);
		user.setUsername(login);
		user.setPassword(encryptedPassword);
		user.setFirstName(firstName);
		user.setLastName(lastName);
		user.setEmail(email);
		user.setUserType(StringUtils.isNoneBlank(userType) ? userType : Constants.INTERNAL_USER);
		user.setDateCreated(Instant.now());

		log.debug("Creating draft user {}", user);

		return draftUserRepository.save(user);
	}

	public void deleteUser(Long draftUserId) {
		draftUserRepository.deleteById(draftUserId);
	}
}
