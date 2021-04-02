package com.flair.bi.service;

import com.flair.bi.service.dto.scheduler.EmailConfigParametersDTO;
import com.flair.bi.service.dto.scheduler.GetChannelConnectionDTO;
import com.flair.bi.service.dto.scheduler.GetJiraTicketResponseDTO;
import com.flair.bi.service.dto.scheduler.GetJiraTicketsDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportLogDTO;
import com.flair.bi.service.dto.scheduler.GetSchedulerReportLogsDTO;
import com.flair.bi.service.dto.scheduler.GetSearchReportsDTO;
import com.flair.bi.service.dto.scheduler.JiraParametersDTO;
import com.flair.bi.service.dto.scheduler.OpenJiraTicketDTO;
import com.flair.bi.service.dto.scheduler.SchedulerNotificationDTO;
import com.flair.bi.service.dto.scheduler.SchedulerReportsDTO;
import com.flair.bi.service.dto.scheduler.TeamConfigParametersDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestNotificationsGrpcService implements INotificationsGrpcService {
	@Override
	public GetSchedulerReportDTO getSchedulerReport(String visualizationId) {
		return null;
	}

	@Override
	public GetSchedulerReportDTO createSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO) {
		return null;
	}

	@Override
	public GetSchedulerReportDTO updateSchedulerReport(SchedulerNotificationDTO schedulerNotificationDTO) {
		return null;
	}

	@Override
	public SchedulerReportsDTO getScheduledReportsByUser(String username, Integer pageSize, Integer page) {
		return null;
	}

	@Override
	public GetSchedulerReportDTO deleteSchedulerReport(String visualizationId) {
		return null;
	}

	@Override
	public Integer getScheduledReportsCount(String username) {
		return null;
	}

	@Override
	public void executeImmediateScheduledReport(String visualizationId) {

	}

	@Override
	public GetSchedulerReportLogsDTO getScheduleReportLogs(String visualizationid, Integer pageSize, Integer page) {
		return null;
	}

	@Override
	public GetSearchReportsDTO searchReports(String username, String reportName, String startDate, String endDate,
			Integer pageSize, Integer page, Boolean thresholdAlert,String dashboardName,String viewName) {
		return null;
	}

	@Override
	public GetChannelConnectionDTO getChannelParameters(String channel) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String createTeamConfig(TeamConfigParametersDTO teamConfigParametersDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String updateTeamConfig(TeamConfigParametersDTO teamConfigParametersDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String createEmailConfig(EmailConfigParametersDTO emailConfigParametersDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String updateEmailConfig(EmailConfigParametersDTO emailConfigParametersDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public EmailConfigParametersDTO getEmailConfig(Integer id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<TeamConfigParametersDTO> getTeamConfig(Integer id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String deleteChannelConfig(Integer id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String createJiraConfig(JiraParametersDTO jiraParametersDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String updateJiraConfig(JiraParametersDTO jiraParametersDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public JiraParametersDTO getJiraConfig(Integer id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public GetSchedulerReportLogDTO getReportLogByMetaId(Long taskLogMetaId) {
		return null;
	}

	@Override
	public GetJiraTicketResponseDTO createJiraTicket(Integer id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public GetJiraTicketsDTO getJiraTickets(String status, Integer page, Integer pageSize) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String disableTicketCreationRequest(Integer schedulerTaskLogId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String notifyOpenedJiraTicket(OpenJiraTicketDTO openJiraTicketDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Boolean isConfigExist(Integer id) {
		return null;
	}

	@Override
	public List<String> getTeamNames(Integer id) {
		// TODO Auto-generated method stub
		return null;
	}

}
