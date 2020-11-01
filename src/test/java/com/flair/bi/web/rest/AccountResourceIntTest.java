package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.User;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.security.AuthoritiesConstants;
import com.flair.bi.service.MailService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.UserDTO;
import com.flair.bi.web.rest.dto.RealmDTO;
import com.flair.bi.web.rest.vm.ManagedUserVM;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyObject;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test class for the AccountResource REST controller.
 *
 * @see UserService
 */
@Ignore
public class AccountResourceIntTest extends AbstractIntegrationTest {

	@Inject
	private UserRepository userRepository;

	@Inject
	private UserService userService;

	@Mock
	private UserService mockUserService;

	@Mock
	private MailService mockMailService;

	private MockMvc restUserMockMvc;

	private MockMvc restMvc;

	@Before
	public void setup() {

		MockitoAnnotations.initMocks(this);
		doNothing().when(mockMailService).sendActivationEmail((User) anyObject());

		AccountResource accountResource = new AccountResource(userService, null, mockMailService);
		AccountResource accountUserMockResource = new AccountResource(mockUserService, null,
				mockMailService);

		this.restMvc = MockMvcBuilders.standaloneSetup(accountResource).build();
		this.restUserMockMvc = MockMvcBuilders.standaloneSetup(accountUserMockResource).build();
	}

	@Test
	public void testNonAuthenticatedUser() throws Exception {
		restUserMockMvc.perform(get("/api/authenticate").accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk())
				.andExpect(content().string(""));
	}

	@Test
	public void testAuthenticatedUser() throws Exception {
		restUserMockMvc.perform(get("/api/authenticate").with(request -> {
			request.setRemoteUser("test");
			return request;
		}).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk()).andExpect(content().string("test"));
	}

	@Test
	public void testGetExistingAccount() throws Exception {
		User user = new User();
		user.setLogin("test");
		user.setFirstName("john");
		user.setLastName("doe");
		user.setEmail("john.doe@jhipter.com");
		user.getUserGroups().add(new UserGroup(AuthoritiesConstants.ADMIN));
		when(mockUserService.getUserWithAuthorities()).thenReturn(user);

		restUserMockMvc.perform(get("/api/account").accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.login").value("test")).andExpect(jsonPath("$.firstName").value("john"))
				.andExpect(jsonPath("$.lastName").value("doe"))
				.andExpect(jsonPath("$.email").value("john.doe@jhipter.com"))
				.andExpect(jsonPath("$.userGroups").value(AuthoritiesConstants.ADMIN));
	}

	@Test
	public void testGetUnknownAccount() throws Exception {
		when(mockUserService.getUserWithAuthorities()).thenReturn(null);

		restUserMockMvc.perform(get("/api/account").accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isInternalServerError());
	}

	@Test
	@Transactional
	public void testRegisterValid() throws Exception {
		ManagedUserVM validUser = new ManagedUserVM(null, // id
				"joe", // login
				"password", // password
				"Joe", // firstName
				"Shmoe", // lastName
				"joe@example.com", // e-mail
				true, // activated
				"en", // langKey
				new HashSet<>(Arrays.asList(AuthoritiesConstants.USER)), null, null, // createdBy
				null, // createdDate
				null, // lastModifiedBy
				null, // lastModifiedDate
				new RealmDTO(1L,"test")
		);

		restMvc.perform(post("/api/register").contentType(TestUtil.APPLICATION_JSON_UTF8)
				.content(TestUtil.convertObjectToJsonBytes(validUser))).andExpect(status().isCreated());

		Optional<User> user = userRepository.findOneByLogin("joe");
		assertThat(user.isPresent()).isTrue();
	}

	@Test
	@Transactional
	public void testRegisterInvalidLogin() throws Exception {
		ManagedUserVM invalidUser = new ManagedUserVM(null, // id
				"funky-log!n", // login <-- invalid
				"password", // password
				"Funky", // firstName
				"One", // lastName
				"funky@example.com", // e-mail
				true, // activated
				"en", // langKey
				new HashSet<>(Arrays.asList(AuthoritiesConstants.USER)), null, null, // createdBy
				null, // createdDate
				null, // lastModifiedBy
				null, // lastModifiedDate
				new RealmDTO(1L,"test")
		);

		restUserMockMvc.perform(post("/api/register").contentType(TestUtil.APPLICATION_JSON_UTF8)
				.content(TestUtil.convertObjectToJsonBytes(invalidUser))).andExpect(status().isBadRequest());

		Optional<User> user = userRepository.findOneByEmailAndRealmId("funky@example.com", 1L);
		assertThat(user.isPresent()).isFalse();
	}

	@Test
	@Transactional
	public void testRegisterInvalidEmail() throws Exception {
		ManagedUserVM invalidUser = new ManagedUserVM(null, // id
				"bob", // login
				"password", // password
				"Bob", // firstName
				"Green", // lastName
				"invalid", // e-mail <-- invalid
				true, // activated
				"en", // langKey
				new HashSet<>(Arrays.asList(AuthoritiesConstants.USER)), null, null, // createdBy
				null, // createdDate
				null, // lastModifiedBy
				null, // lastModifiedDate
				new RealmDTO(1L,"test")
		);

		restUserMockMvc.perform(post("/api/register").contentType(TestUtil.APPLICATION_JSON_UTF8)
				.content(TestUtil.convertObjectToJsonBytes(invalidUser))).andExpect(status().isBadRequest());

		Optional<User> user = userRepository.findOneByLogin("bob");
		assertThat(user.isPresent()).isFalse();
	}

	@Test
	@Transactional
	public void testRegisterInvalidPassword() throws Exception {
		ManagedUserVM invalidUser = new ManagedUserVM(null, // id
				"bob", // login
				"123", // password with only 3 digits
				"Bob", // firstName
				"Green", // lastName
				"bob@example.com", // e-mail
				true, // activated
				"en", // langKey
				new HashSet<>(Arrays.asList(AuthoritiesConstants.USER)), null, null, // createdBy
				null, // createdDate
				null, // lastModifiedBy
				null, // lastModifiedDate
				new RealmDTO(1L,"test")
		);

		restUserMockMvc.perform(post("/api/register").contentType(TestUtil.APPLICATION_JSON_UTF8)
				.content(TestUtil.convertObjectToJsonBytes(invalidUser))).andExpect(status().isBadRequest());

		Optional<User> user = userRepository.findOneByLogin("bob");
		assertThat(user.isPresent()).isFalse();
	}

	@Test
	@Transactional
	public void testRegisterDuplicateLogin() throws Exception {
		// Good
		ManagedUserVM validUser = new ManagedUserVM(null, // id
				"alice", // login
				"password", // password
				"Alice", // firstName
				"Something", // lastName
				"alice@example.com", // e-mail
				true, // activated
				"en", // langKey
				new HashSet<>(Arrays.asList(AuthoritiesConstants.USER)), null, null, // createdBy
				null, // createdDate
				null, // lastModifiedBy
				null, // lastModifiedDate
				new RealmDTO(1L,"test")
		);

		// Duplicate login, different e-mail
		ManagedUserVM duplicatedUser = new ManagedUserVM(validUser.getId(), validUser.getLogin(),
				validUser.getPassword(), validUser.getLogin(), validUser.getLastName(), "alicejr@example.com", true,
				validUser.getLangKey(), validUser.getPermissions(), validUser.getUserGroups(), validUser.getCreatedBy(),
				validUser.getCreatedDate(), validUser.getLastModifiedBy(), validUser.getLastModifiedDate(),validUser.getRealm());

		// Good user
		restMvc.perform(post("/api/register").contentType(TestUtil.APPLICATION_JSON_UTF8)
				.content(TestUtil.convertObjectToJsonBytes(validUser))).andExpect(status().isCreated());

		// Duplicate login
		restMvc.perform(post("/api/register").contentType(TestUtil.APPLICATION_JSON_UTF8)
				.content(TestUtil.convertObjectToJsonBytes(duplicatedUser))).andExpect(status().is4xxClientError());

		Optional<User> userDup = userRepository.findOneByEmailAndRealmId("alicejr@example.com", 1L);
		assertThat(userDup.isPresent()).isFalse();
	}

	@Test
	@Transactional
	public void testRegisterDuplicateEmail() throws Exception {
		// Good
		ManagedUserVM validUser = new ManagedUserVM(null, // id
				"john", // login
				"password", // password
				"John", // firstName
				"Doe", // lastName
				"john@example.com", // e-mail
				true, // activated
				"en", // langKey
				new HashSet<>(Arrays.asList(AuthoritiesConstants.USER)), null, null, // createdBy
				null, // createdDate
				null, // lastModifiedBy
				null, // lastModifiedDate
				new RealmDTO(1L,"test")
		);

		// Duplicate e-mail, different login
		ManagedUserVM duplicatedUser = new ManagedUserVM(validUser.getId(), "johnjr", validUser.getPassword(),
				validUser.getLogin(), validUser.getLastName(), validUser.getEmail(), true, validUser.getLangKey(),
				validUser.getPermissions(), validUser.getUserGroups(), validUser.getCreatedBy(),
				validUser.getCreatedDate(), validUser.getLastModifiedBy(), validUser.getLastModifiedDate(),validUser.getRealm());

		// Good user
		restMvc.perform(post("/api/register").contentType(TestUtil.APPLICATION_JSON_UTF8)
				.content(TestUtil.convertObjectToJsonBytes(validUser))).andExpect(status().isCreated());

		// Duplicate e-mail
		restMvc.perform(post("/api/register").contentType(TestUtil.APPLICATION_JSON_UTF8)
				.content(TestUtil.convertObjectToJsonBytes(duplicatedUser))).andExpect(status().is4xxClientError());

		Optional<User> userDup = userRepository.findOneByLogin("johnjr");
		assertThat(userDup.isPresent()).isFalse();
	}

	@Test
	@Transactional
	public void testRegisterAdminIsIgnored() throws Exception {
		ManagedUserVM validUser = new ManagedUserVM(null, // id
				"badguy", // login
				"password", // password
				"Bad", // firstName
				"Guy", // lastName
				"badguy@example.com", // e-mail
				true, // activated
				"en", // langKey
				new HashSet<>(Arrays.asList(AuthoritiesConstants.ADMIN)), null, null, // createdBy
				null, // createdDate
				null, // lastModifiedBy
				null, // lastModifiedDate
				new RealmDTO(1L,"test")
		);

		restMvc.perform(post("/api/register").contentType(TestUtil.APPLICATION_JSON_UTF8)
				.content(TestUtil.convertObjectToJsonBytes(validUser))).andExpect(status().isCreated());

		Optional<User> userDup = userRepository.findOneByLogin("badguy");
		assertThat(userDup.isPresent()).isTrue();
	}

	@Test
	@Transactional
	public void testSaveInvalidLogin() throws Exception {
		UserDTO invalidUser = new UserDTO("funky-log!n", // login <-- invalid
				"Funky", // firstName
				"One", // lastName
				"funky@example.com", // e-mail
				true, // activated
				"en", // langKey
				null, // userType
				new HashSet<>(Collections.singletonList(AuthoritiesConstants.USER)), null,new RealmDTO(1L,"test"));

		restUserMockMvc.perform(post("/api/account").contentType(TestUtil.APPLICATION_JSON_UTF8)
				.content(TestUtil.convertObjectToJsonBytes(invalidUser))).andExpect(status().isBadRequest());

		Optional<User> user = userRepository.findOneByEmailAndRealmId("funky@example.com", 1L);
		assertThat(user.isPresent()).isFalse();
	}
}
