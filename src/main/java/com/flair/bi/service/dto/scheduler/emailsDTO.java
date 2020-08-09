package com.flair.bi.service.dto.scheduler;

public class emailsDTO {

	private String user_email;
	private String user_name;

	public emailsDTO() {
	}

	public String getUser_email() {
		return user_email;
	}

	public void setUser_email(String user_email) {
		this.user_email = user_email;
	}

	public String getUser_name() {
		return user_name;
	}

	public void setUser_name(String user_name) {
		this.user_name = user_name;
	}

	@Override
	public String toString() {
		return "emailsDTO [user_email=" + user_email + ", user_name=" + user_name + "]";
	}

}
