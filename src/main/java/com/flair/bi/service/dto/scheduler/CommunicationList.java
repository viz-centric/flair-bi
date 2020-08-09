package com.flair.bi.service.dto.scheduler;

import java.util.Arrays;

public class CommunicationList {
	emailsDTO email[];
	Integer teams[];

	public CommunicationList() {
	}

	public emailsDTO[] getEmail() {
		return email;
	}

	public void setEmail(emailsDTO[] email) {
		this.email = email;
	}

	public Integer[] getTeams() {
		return teams;
	}

	public void setTeams(Integer[] teams) {
		this.teams = teams;
	}

	@Override
	public String toString() {
		return "CommunicationList [email=" + Arrays.toString(email) + ", teams=" + Arrays.toString(teams) + "]";
	}

}