package com.flair.bi.web.rest;

import javax.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.service.SchedulerService;
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
}
