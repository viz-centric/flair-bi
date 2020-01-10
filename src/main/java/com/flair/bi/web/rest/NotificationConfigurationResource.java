package com.flair.bi.web.rest;

import java.util.List;

import javax.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.service.SchedulerService;
import com.flair.bi.service.dto.scheduler.EmailConfigParametersDTO;
import com.flair.bi.service.dto.scheduler.GetChannelConnectionDTO;
import com.flair.bi.service.dto.scheduler.TeamConfigParametersDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class NotificationConfigurationResource {

	private final SchedulerService schedulerService;

	@GetMapping("/notification/channelParameters/")
	@Timed
	public GetChannelConnectionDTO getChannelParameters(@RequestParam(required = false) String channel) {
		return schedulerService.getChannelParameters(channel);
	}

	@PostMapping("/notification/createTeamConfig")
	@Timed
	public String createTeamConfig(@Valid @RequestBody TeamConfigParametersDTO teamConfigParametersDTO) {
		return schedulerService.createTeamConfig(teamConfigParametersDTO);
	}

	@PutMapping("/notification/updateTeamConfig")
	@Timed
	public String updateTeamConfig(@Valid @RequestBody TeamConfigParametersDTO teamConfigParametersDTO) {
		return schedulerService.updateTeamConfig(teamConfigParametersDTO);
	}

	@PostMapping("/notification/createEmailConfig")
	@Timed
	public String createEmailConfig(@Valid @RequestBody EmailConfigParametersDTO emailConfigParametersDTO) {
		return schedulerService.createEmailConfig(emailConfigParametersDTO);
	}

	@PutMapping("/notification/updateEmailConfig")
	@Timed
	public String updateEmailConfig(@Valid @RequestBody EmailConfigParametersDTO emailConfigParametersDTO) {
		return schedulerService.updateEmailConfig(emailConfigParametersDTO);
	}

	@GetMapping("/notification/getEmailConfig/")
	@Timed
	public EmailConfigParametersDTO getEmailConfig(@RequestParam(required = false) Integer id) {
		return schedulerService.getEmailConfig(id);
	}

	@GetMapping("/notification/getTeamConfig/")
	@Timed
	public List<TeamConfigParametersDTO> getTeamConfig(@RequestParam(required = false) Integer id) {
		return schedulerService.getTeamConfig(id);
	}

	@DeleteMapping("/notification/deleteChannelConfig")
	@Timed
	public String deleteChannelConfig(@RequestParam Integer id) {
		return schedulerService.deleteChannelConfig(id);
	}
}
