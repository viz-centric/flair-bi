package com.flair.bi.web.rest.vm;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import com.flair.bi.config.Constants;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginVM {

	@Pattern(regexp = Constants.LOGIN_REGEX)
	@NotNull
	@Size(min = 1, max = 50)
	private String username;

	@NotNull
	@Size(min = ManagedUserVM.PASSWORD_MIN_LENGTH, max = ManagedUserVM.PASSWORD_MAX_LENGTH)
	private String password;

	private boolean rememberMe;

}
