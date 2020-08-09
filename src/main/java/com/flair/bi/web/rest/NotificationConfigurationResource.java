package com.flair.bi.web.rest;

import java.util.List;

import javax.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.service.SchedulerService;
import com.flair.bi.service.dto.scheduler.EmailConfigParametersDTO;
import com.flair.bi.service.dto.scheduler.GetChannelConnectionDTO;
import com.flair.bi.service.dto.scheduler.GetJiraTicketResponseDTO;
import com.flair.bi.service.dto.scheduler.GetJiraTicketsDTO;
import com.flair.bi.service.dto.scheduler.JiraParametersDTO;
import com.flair.bi.service.dto.scheduler.OpenJiraTicketDTO;
import com.flair.bi.service.dto.scheduler.TeamConfigParametersDTO;

import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationConfigurationResource {

	private final SchedulerService schedulerService;

	@GetMapping("/notification/channelParameters/")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'READ','APPLICATION')")
	public GetChannelConnectionDTO getChannelParameters(@RequestParam(required = false) String channel) {
		return schedulerService.getChannelParameters(channel);
	}

	@PostMapping("/notification/createTeamConfig")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'WRITE','APPLICATION')")
	public String createTeamConfig(@Valid @RequestBody TeamConfigParametersDTO teamConfigParametersDTO) {
		return schedulerService.createTeamConfig(teamConfigParametersDTO);
	}

	@PutMapping("/notification/updateTeamConfig")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'UPDATE','APPLICATION')")
	public String updateTeamConfig(@Valid @RequestBody TeamConfigParametersDTO teamConfigParametersDTO) {
		return schedulerService.updateTeamConfig(teamConfigParametersDTO);
	}

	@PostMapping("/notification/createEmailConfig")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'WRITE','APPLICATION')")
	public String createEmailConfig(@Valid @RequestBody EmailConfigParametersDTO emailConfigParametersDTO) {
		return schedulerService.createEmailConfig(emailConfigParametersDTO);
	}

	@PutMapping("/notification/updateEmailConfig")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'UPDATE','APPLICATION')")
	public String updateEmailConfig(@Valid @RequestBody EmailConfigParametersDTO emailConfigParametersDTO) {
		return schedulerService.updateEmailConfig(emailConfigParametersDTO);
	}

	@GetMapping("/notification/getEmailConfig/")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'READ','APPLICATION')")
	public EmailConfigParametersDTO getEmailConfig(@RequestParam(required = false) Integer id) {
		return schedulerService.getEmailConfig(id);
	}

	@GetMapping("/notification/getTeamConfig/")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'READ','APPLICATION')")
	public List<TeamConfigParametersDTO> getTeamConfig(@RequestParam(required = false) Integer id) {
		return schedulerService.getTeamConfig(id);
	}

	@GetMapping("/notification/getTeamNames/")
	@Timed
	public List<String> getTeamNames(@RequestParam(required = false) Integer id) {
		return schedulerService.getTeamNames(id);
	}

	@DeleteMapping("/notification/deleteChannelConfig")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'DELETE','APPLICATION')")
	public String deleteChannelConfig(@RequestParam Integer id) {
		return schedulerService.deleteChannelConfig(id);
	}

	@PostMapping("/notification/createJiraConfig")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'WRITE','APPLICATION')")
	public String createJiraConfig(@Valid @RequestBody JiraParametersDTO jiraParametersDTO) {
		return schedulerService.createJiraConfig(jiraParametersDTO);
	}

	@PutMapping("/notification/updateJiraConfig")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'UPDATE','APPLICATION')")
	public String updateJiraConfig(@Valid @RequestBody JiraParametersDTO jiraParametersDTO) {
		return schedulerService.updateJiraConfig(jiraParametersDTO);
	}

	@GetMapping("/notification/getJiraConfig/")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'READ','APPLICATION')")
	public JiraParametersDTO getJiraConfig(@RequestParam(required = false) Integer id) {
		return schedulerService.getJiraConfig(id);
	}

	@GetMapping("/notification/createJiraTicket/")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'READ','APPLICATION')")
	public GetJiraTicketResponseDTO createJiraTicket(@RequestParam Integer id) {
		return schedulerService.createJiraTicket(id);
	}

	@GetMapping("/notification/getJiraTickets/")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'READ','APPLICATION')")
	GetJiraTicketsDTO getJiraTickets(@RequestParam String status, @RequestParam Integer page,
			@RequestParam Integer pageSize) {
		return schedulerService.getJiraTickets(status, page, pageSize);
	}

	@GetMapping("/notification/disableTicketCreationRequest/")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'READ','APPLICATION')")
	String disableTicketCreationRequest(@RequestParam Integer schedulerTaskLogId) {
		return schedulerService.disableTicketCreationRequest(schedulerTaskLogId);
	}

	@PostMapping("/notification/notifyOpenedJiraTicket")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'WRITE','APPLICATION')")
	public String notifyOpenedJiraTicket(@Valid @RequestBody OpenJiraTicketDTO openJiraTicketDTO) {
		return schedulerService.notifyOpenedJiraTicket(openJiraTicketDTO);
	}

	@GetMapping("/notification/isConfigExist/")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('NOTIFICATION_CONFIG', 'READ','APPLICATION')")
	Boolean isConfigExist(@RequestParam(required = false) Integer id) {
		return schedulerService.isConfigExist(id);
	}

}
