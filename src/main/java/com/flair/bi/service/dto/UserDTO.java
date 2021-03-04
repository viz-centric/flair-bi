package com.flair.bi.service.dto;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.User;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.web.rest.dto.RealmDTO;
import org.hibernate.validator.constraints.Email;

import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * A DTO representing a user, with his authorities.
 */
public class UserDTO {

	@Pattern(regexp = Constants.LOGIN_REGEX)
	@Size(min = 1, max = 50)
	private String login;

	@Size(max = 50)
	private String firstName;

	@Size(max = 50)
	private String lastName;

	@Email
	@Size(min = 5, max = 100)
	private String email;

	private boolean activated = false;

	@Size(min = 2, max = 5)
	private String langKey;

	private Set<String> userGroups;

	private Set<String> permissions;

	private String userType;

    private Set<RealmDTO> realms = new HashSet<>();

    public UserDTO() {
    }

	public UserDTO(User user) {
		this(user.getLogin(), user.getFirstName(), user.getLastName(), user.getEmail(), user.isActivated(),
				user.getLangKey(), user.getUserType(),
				user.retrieveAllUserPermissions(false).stream().map(Permission::getStringValue)
						.collect(Collectors.toSet()),
				user.getUserGroups().stream().map(UserGroup::getName).collect(Collectors.toSet()),
				user.getRealms().stream().map(r -> new RealmDTO(r.getId(), r.getName())).collect(Collectors.toSet()));
	}

	public UserDTO(String login, String firstName, String lastName, String email, boolean activated, String langKey,
				   String userType, Set<String> permissions, Set<String> userGroups, Set<RealmDTO> realms) {
		this.login = login;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.activated = activated;
		this.langKey = langKey;
		this.userType = userType;
		this.permissions = permissions;
		this.userGroups = userGroups;
		this.realms = realms;
	}

	public UserDTO(String login, String firstName, String lastName, String email, boolean activated, String langKey,
				   String userType, Set<String> permissions, Set<String> userGroups, RealmDTO realm) {
		this(login, firstName, lastName, email, activated, langKey, userType, permissions, userGroups,
				Stream.of(realm).collect(Collectors.toSet()));
	}

	public String getLogin() {
		return login;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public String getEmail() {
		return email;
	}

	public boolean isActivated() {
		return activated;
	}

	public String getLangKey() {
		return langKey;
	}

	public String getUserType() {
		return userType;
	}

	public Set<String> getUserGroups() {
		return userGroups;
	}

	public Set<String> getPermissions() {
		return permissions;
	}

    public Set<RealmDTO> getRealms() {
        return realms;
    }

    public void setRealms(Set<RealmDTO> realms) {
        this.realms = realms;
    }
}
