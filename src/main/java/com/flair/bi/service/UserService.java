package com.flair.bi.service;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.QUser;
import com.flair.bi.domain.Realm;
import com.flair.bi.domain.User;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.PersistentTokenRepository;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.repository.security.UserGroupRepository;
import com.flair.bi.security.AuthoritiesConstants;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.dto.UserBasicDTO;
import com.flair.bi.service.util.RandomUtil;
import com.flair.bi.web.rest.vm.ManagedUserVM;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service class for managing users.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class UserService {

	private final PasswordEncoder passwordEncoder;

	private final UserRepository userRepository;

	private final PersistentTokenRepository persistentTokenRepository;

	private final UserGroupRepository userGroupRepository;

	private final JdbcTemplate jdbcTemplate;

	public Optional<User> activateRegistration(String key) {
		log.debug("Activating user for activation key {}", key);
		return userRepository.findOneByActivationKey(key).map(user -> {
			// activate given user for the registration key.
			user.setActivated(true);
			user.setActivationKey(null);
			log.debug("Activated user: {}", user);

			userRepository.save(user);
			return user;
		});
	}

	public Optional<User> completePasswordReset(String newPassword, String key) {
		log.debug("Reset user password for reset key {}", key);

		return userRepository.findOneByResetKey(key).filter(user -> {
			ZonedDateTime oneDayAgo = ZonedDateTime.now().minusHours(24);
			return user.getResetDate().isAfter(oneDayAgo);
		}).map(user -> {
			user.setPassword(passwordEncoder.encode(newPassword));
			user.setResetKey(null);
			user.setResetDate(null);
			return user;
		});
	}

	public Optional<User> requestPasswordReset(String mail) {
		return userRepository.findOneByEmail(mail).filter(User::isActivated).map(user -> {
			user.setResetKey(RandomUtil.generateResetKey());
			user.setResetDate(ZonedDateTime.now());

			userRepository.save(user);
			return user;
		});
	}

	public User createUser(String login, String password, String firstName, String lastName, String email,
			String langKey, String userType) {
		return createUser(login, password, firstName, lastName, email, langKey, userType, null);
	}

	public User createUser(String login, String password, String firstName, String lastName, String email,
			String langKey, String userType, Set<String> authorities) {
		User user = getUserWithAuthoritiesByLoginOrError(SecurityUtils.getCurrentUserLogin());
		Realm realm = user.getRealm();
		Set<String> foundAuthorityNames = ImmutableSet.of();
		if (authorities != null) {
			foundAuthorityNames = AuthoritiesConstants.ALL.stream().filter(authority -> authorities.contains(authority))
					.collect(Collectors.toSet());
		}
		if (foundAuthorityNames.isEmpty()) {
			foundAuthorityNames = ImmutableSet.of(AuthoritiesConstants.USER);
		}
		List<UserGroup> userGroups = userGroupRepository.findAllByNameInAndRealmId(foundAuthorityNames, realm.getId());
		User newUser = new User();
		String encryptedPassword = passwordEncoder.encode(password);
		newUser.setLogin(login);
		// new user gets initially a generated password
		newUser.setPassword(encryptedPassword);
		newUser.setFirstName(firstName);
		newUser.setLastName(lastName);
		newUser.setEmail(email);
		newUser.setLangKey(langKey);
		newUser.setActivated(true);
		newUser.addUserGroups(userGroups);
		newUser.setRealm(realm);
		newUser.setUserType(StringUtils.isNoneBlank(userType) ? userType : Constants.INTERNAL_USER);
		userRepository.save(newUser);
		log.debug("Created Information for User: {} authorities {}", newUser, foundAuthorityNames);
		return newUser;
	}

	public User createUser(ManagedUserVM managedUserVM) {
		User currentUser = getUserWithAuthoritiesByLoginOrError(SecurityUtils.getCurrentUserLogin());
		User user = new User();
		user.setLogin(managedUserVM.getLogin());
		user.setFirstName(managedUserVM.getFirstName());
		user.setLastName(managedUserVM.getLastName());
		user.setEmail(managedUserVM.getEmail());
		if (managedUserVM.getLangKey() == null) {
			user.setLangKey("en"); // default language
		} else {
			user.setLangKey(managedUserVM.getLangKey());
		}
		if (managedUserVM.getUserGroups() != null) {
			user.setUserGroups(
					userGroupRepository.findAllByNameInAndRealmId(managedUserVM.getUserGroups(), currentUser.getRealm().getId())
							.stream()
							.collect(Collectors.toSet())
			);
		}
		String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
		user.setPassword(encryptedPassword);
		user.setResetKey(RandomUtil.generateResetKey());
		user.setResetDate(ZonedDateTime.now());
		user.setActivated(true);
		user.setUserType(Constants.INTERNAL_USER);
		user.setRealm(currentUser.getRealm());
		user = userRepository.save(user);
		log.debug("Created Information for User: {}", user);
		return user;
	}

	public void updateUser(String firstName, String lastName, String email, String langKey) {
		userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).ifPresent(user -> {
			user.setFirstName(firstName);
			user.setLastName(lastName);
			user.setEmail(email);
			user.setLangKey(langKey);

			userRepository.save(user);
			log.debug("Changed Information for User: {}", user);
		});
	}

	public void updateUser(Long id, String login, String firstName, String lastName, String email, boolean activated,
			String langKey, Set<String> userGroups) {

		userRepository.findById(id).ifPresent(user -> {
			user.setLogin(login);
			user.setFirstName(firstName);
			user.setLastName(lastName);
			user.setEmail(email);
			user.setActivated(activated);
			user.setLangKey(langKey);

			user.getUserGroups().clear();
			user.addUserGroups(
					userGroupRepository.findAllByNameInAndRealmId(userGroups, user.getRealm().getId())
							.stream()
							.collect(Collectors.toSet())
			);

			userRepository.save(user);

			log.debug("Changed Information for User: {}", user);
		});
	}

	public void deleteUser(String login) {
		userRepository.findOneByLogin(login).ifPresent(user -> {
			userRepository.delete(user);
			log.debug("Deleted User: {}", user);
		});
	}

	public void changePassword(String password) {
		userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).ifPresent(user -> {
			if (user.getUserType().equals(Constants.INTERNAL_USER)) {
				final String encryptedPassword = passwordEncoder.encode(password);
				user.setPassword(encryptedPassword);
				userRepository.save(user);
				log.debug("Changed password for User: {}", user);
			} else {
				log.warn("External users cannot change password. User: {}", user);
			}
		});
	}

	@Transactional(readOnly = true)
	public Optional<User> getUserWithAuthoritiesByLogin(String login) {
		return userRepository.findOneByLogin(login).map(user -> {
			user.retrieveAllUserPermissions().size();
			return user;
		});
	}

	@Transactional(readOnly = true)
	public Optional<User> getUserByLogin(String login) {
		return userRepository.findOneByLogin(login);
	}

	@Transactional(readOnly = true)
	public User getUserWithAuthoritiesByLoginOrError(String login) {
		return getUserWithAuthoritiesByLogin(login).orElseThrow(RuntimeException::new);
	}

	@Transactional(readOnly = true)
	public User getUserWithAuthorities(Long id) {
		User user = userRepository.getOne(id);
		// eagerly load the association
		user.retrieveAllUserPermissions(false).size();
		return user;
	}

	@Transactional(readOnly = true)
	public User getUserWithAuthorities() {
		Optional<User> optionalUser = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin());
		User user = null;
		if (optionalUser.isPresent()) {
			user = optionalUser.get();
			// eagerly load the association
			user.retrieveAllUserPermissions(false).size();
		}
		return user;
	}

	@Transactional(readOnly = true)
	public Page<User> findAllWithAuthorities(Pageable pageable) {
		Page<User> users = userRepository.findAll(pageable);
		users.getContent().forEach(x -> x.retrieveAllUserPermissions().size());
		return users;
	}

	@Transactional(readOnly = true)
	public Page<User> findAllWithAuthorities(Pageable pageable, Predicate predicate) {
		BooleanBuilder booleanBuilder = new BooleanBuilder(predicate);
		Page<User> users = userRepository.findAll(booleanBuilder, pageable);
		users.getContent().forEach(x -> x.retrieveAllUserPermissions().size());
		return users;
	}

	@Transactional(readOnly = true)
	public List<User> findAllWithAuthorities(Predicate predicate) {
		User user = getUserWithAuthoritiesByLoginOrError(SecurityUtils.getCurrentUserLogin());
		Long realmId = user.getRealm().getId();
		Iterable<User> users = userRepository.findAll(QUser.user.realm.id.eq(realmId).and(predicate));
		users.forEach(x -> x.retrieveAllUserPermissions().size());
		return ImmutableList.copyOf(users);
	}

	public UserBasicDTO getUserNameByEmail(String email) {
		List<UserBasicDTO> userBasicDTOList = null;
		UserBasicDTO userBasicDTO = null;
		try {
			userBasicDTOList = jdbcTemplate.query(
					"select first_name,email from jhi_user where email = ?",
					new Object[] {email}, new RowMapper<UserBasicDTO>() {
						public UserBasicDTO mapRow(ResultSet srs, int rowNum) throws SQLException {
							UserBasicDTO userBasicDTO = new UserBasicDTO();
							String firstName = srs.getString("first_name") !=null ? srs.getString("first_name") : "User";
							userBasicDTO.setFirstName(firstName);
							userBasicDTO.setEmail(srs.getString("email"));
							return userBasicDTO;
						}
					});
			if (!userBasicDTOList.isEmpty() && userBasicDTOList != null)
				userBasicDTO = userBasicDTOList.get(0);
		} catch (Exception e) {
			log.error("error occured while getting user name" + e.getMessage());
		}
		return userBasicDTO;
	}

	/**
	 * Persistent Token are used for providing automatic authentication, they should
	 * be automatically deleted after 30 days.
	 * <p>
	 * This is scheduled to get fired everyday, at midnight.
	 * </p>
	 */
	@Scheduled(cron = "0 0 0 * * ?")
	public void removeOldPersistentTokens() {
		LocalDate now = LocalDate.now();
		persistentTokenRepository.findByTokenDateBefore(now.minusMonths(1)).forEach(token -> {
			log.debug("Deleting token {}", token.getSeries());
			User user = token.getUser();
			user.getPersistentTokens().remove(token);
			persistentTokenRepository.delete(token);
		});
	}

	/**
	 * Not activated users should be automatically deleted after 3 days.
	 * <p>
	 * This is scheduled to get fired everyday, at 01:00 (am).
	 * </p>
	 */
	@Scheduled(cron = "0 0 1 * * ?")
	public void removeNotActivatedUsers() {
		ZonedDateTime now = ZonedDateTime.now();
		List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minusDays(3));
		for (User user : users) {
			log.debug("Deleting not activated user {}", user.getLogin());
			userRepository.delete(user);
		}
	}

	public void saveUser(User user) {
		userRepository.save(user);
	}

	public void saveAllUsers(Iterable<User> users) {
		userRepository.saveAll(users);
	}

	@Transactional(readOnly = true)
	public Optional<User> getUserByEmail(String email) {
		return userRepository.findOneByEmail(email);
	}

	public void deleteAllByRealmId(Long realmId) {
		userRepository.deleteAllByRealmId(realmId);
	}
}
