package com.flair.bi.release;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.DashboardRelease;
import com.flair.bi.domain.QReleaseRequest;
import com.flair.bi.domain.Release;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.domain.User;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.repository.DashboardReleaseRepository;
import com.flair.bi.repository.ReleaseRequestRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.ReleasesAlertsDTO;
import com.flair.bi.view.ViewService;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
@Slf4j
class ReleaseRequestServiceImpl implements ReleaseRequestService {

	private final ReleaseRequestRepository releaseRequestRepository;

	private final UserService userService;

	private final DashboardReleaseRepository dashboardReleaseRepository;

	private final ReleaseRequestProcessor<ViewRelease> viewReleaseReleaseRequestProcessor;

	private final ReleaseRequestProcessor<DashboardRelease> dashboardReleaseReleaseRequestProcessor;

	private final ViewService viewService;

	private final DashboardService dashboardService;

	private final JdbcTemplate jdbcTemplate;

	public ReleaseRequestServiceImpl(ReleaseRequestRepository releaseRequestRepository, UserService userService,
			DashboardReleaseRepository dashboardReleaseRepository,
			@Qualifier(value = "viewReleaseProcessor") ReleaseRequestProcessor<ViewRelease> viewReleaseReleaseRequestProcessor,
			@Qualifier(value = "dashboardReleaseProcessor") ReleaseRequestProcessor<DashboardRelease> dashboardReleaseReleaseRequestProcessor,
			ViewService viewService, DashboardService dashboardService, JdbcTemplate jdbcTemplate) {
		this.releaseRequestRepository = releaseRequestRepository;
		this.userService = userService;
		this.dashboardReleaseRepository = dashboardReleaseRepository;
		this.viewReleaseReleaseRequestProcessor = viewReleaseReleaseRequestProcessor;
		this.dashboardReleaseReleaseRequestProcessor = dashboardReleaseReleaseRequestProcessor;
		this.viewService = viewService;
		this.dashboardService = dashboardService;
		this.jdbcTemplate = jdbcTemplate;
	}

	/**
	 * Get all requests that correspond to releases that are in pending state
	 *
	 * @return collection of {@link ReleaseRequest}
	 */
	@Transactional(readOnly = true)
	@Override
	public Collection<ReleaseRequest> getAllRequests() {

		Iterable<ReleaseRequest> releaseRequests = releaseRequestRepository.findAll(hasUserRealmAccess());
// fetch view releases
		releaseRequests.forEach(x -> x.getRelease().getViewReleases().size());

		return ImmutableList.copyOf(
				releaseRequests
		);

	}

	/**
	 * Retrieve a {@link ReleaseRequest} by id
	 *
	 * @param id id of a release request
	 * @return release request or null
	 */
	@Override
	public ReleaseRequest getRequestById(Long id) {
		return findById(id);
	}

	@Override
	public void approveRelease(Long requestId) {
		ReleaseRequest releaseRequest = findById(requestId);

		User user = userService.getUserWithAuthoritiesByLogin(SecurityUtils.getCurrentUserLogin())
				.orElseThrow(RuntimeException::new);

		// set that dashboard release is approved
		DashboardRelease release = releaseRequest.getRelease();
		release.setProcessedBy(user);
		release.setReleaseStatus(Release.Status.APPROVED);
		release.getViewReleases().forEach(x -> {
			x.setReleaseStatus(Release.Status.APPROVED);

			if (x.getProcessedBy() == null) {
				x.setProcessedBy(user);
			}
		});

		Dashboard dashboard = release.getDashboard();

		// proceed with publishing views
		release.getViewReleases().forEach(x -> viewService.publishRelease(x.getView().getId(), x));

		// proceed with publishing dashboard
		dashboardService.publishRelease(dashboard.getId(), release);

		releaseRequestRepository.deleteById(requestId);
	}

	@Override
	public void rejectRelease(Long requestId) {
		ReleaseRequest releaseRequest = findById(requestId);

		DashboardRelease release = releaseRequest.getRelease();

		User user = userService.getUserWithAuthoritiesByLogin(SecurityUtils.getCurrentUserLogin())
				.orElseThrow(RuntimeException::new);

		release.setReleaseStatus(Release.Status.REJECT);
		release.setProcessedBy(user);
		release.setVersionNumber(-1L);

		release.getViewReleases().forEach(x -> {
			if (x.getProcessedBy() == null) {
				x.setProcessedBy(user);
			}
		});

		releaseRequestRepository.deleteById(requestId);
		dashboardReleaseRepository.save(release);
	}

	private ReleaseRequest findById(Long requestId) {
		return releaseRequestRepository.findOne(hasUserRealmAccess().and(QReleaseRequest.releaseRequest.id.eq(requestId)))
				.orElseThrow();
	}

	/**
	 * Make a request for a release
	 *
	 * @param release release to be requested
	 * @return created request for given release
	 */
	@Override
	public ReleaseRequest requestRelease(Release release) {
		if (release instanceof DashboardRelease) {
			return dashboardReleaseReleaseRequestProcessor.requestRelease((DashboardRelease) release);
		} else if (release instanceof ViewRelease) {
			return viewReleaseReleaseRequestProcessor.requestRelease((ViewRelease) release);
		} else {
			throw new UnsupportedOperationException("No supported");
		}
	}

	@Override
	public List<ReleasesAlertsDTO> getTodaysReleasedAlerts(int offset) {
		List<ReleasesAlertsDTO> releasesAlerts = new ArrayList<ReleasesAlertsDTO>();
		try {
			User user = userService.getUserWithAuthoritiesByLoginOrError();
			releasesAlerts = jdbcTemplate.query(
					"select type,comment,name,lastModifiedDate from ( select 'VIEW' as type,vr.release_comment as comment,v.view_name as name,vr.last_modified_date as lastModifiedDate from views v inner join view_releases vr on v.id=vr.view_id where vr.release_status='APPROVED' and v.realm_id = ? and date_part('day',age(current_date, vr.last_modified_date::date))=0 "
							+ "UNION ALL select 'DASHBOARD' as type,dr.release_comment as comment,d.dashboard_name as name,dr.last_modified_date as lastModifiedDate from dashboards d inner join dashboard_releases dr on d.id=dr.dashboard_id where dr.release_status='APPROVED' and d.realm_id = ? and date_part('day',age(current_date, dr.last_modified_date::date))=0 ) alert order by lastModifiedDate desc LIMIT 5 OFFSET ?",
					new Object[] { SecurityUtils.getUserAuth().getRealmId(), SecurityUtils.getUserAuth().getRealmId(), offset }, new RowMapper<ReleasesAlertsDTO>() {
						public ReleasesAlertsDTO mapRow(ResultSet srs, int rowNum) throws SQLException {
							ReleasesAlertsDTO releasesAlertsDTO = new ReleasesAlertsDTO(srs.getString("type"),
									srs.getString("comment"), srs.getString("name"),
									srs.getTimestamp("lastModifiedDate"));
							return releasesAlertsDTO;
						}
					});
		} catch (Exception e) {
			log.error("error occured while getting todays release alerts" + e.getMessage());
		}
		return releasesAlerts;
	}

	@Override
	public List<ReleasesAlertsDTO> getYesterdaysReleasedAlerts(int offset) {
		List<ReleasesAlertsDTO> releasesAlerts = new ArrayList<ReleasesAlertsDTO>();
		try {
			User user = userService.getUserWithAuthoritiesByLoginOrError();
			releasesAlerts = jdbcTemplate.query(
					"select type,comment,name,lastModifiedDate from (select 'VIEW' as type,vr.release_comment as comment,v.view_name as name,vr.last_modified_date as lastModifiedDate from views v inner join view_releases vr on v.id=vr.view_id where vr.release_status='APPROVED' and v.realm_id = ? and date_part('day',age(current_date, vr.last_modified_date::date))=1 "
							+ "UNION ALL select 'DASHBOARD' as type,dr.release_comment as comment,d.dashboard_name as name,dr.last_modified_date as lastModifiedDate from dashboards d inner join dashboard_releases dr on d.id=dr.dashboard_id where dr.release_status='APPROVED' and d.realm_id = ? and date_part('day',age(current_date, dr.last_modified_date::date))=1 ) alert order by lastModifiedDate desc LIMIT 5 OFFSET ?",
					new Object[] { SecurityUtils.getUserAuth().getRealmId(), SecurityUtils.getUserAuth().getRealmId(), offset }, new RowMapper<ReleasesAlertsDTO>() {
						public ReleasesAlertsDTO mapRow(ResultSet srs, int rowNum) throws SQLException {
							ReleasesAlertsDTO releasesAlertsDTO = new ReleasesAlertsDTO(srs.getString("type"),
									srs.getString("comment"), srs.getString("name"),
									srs.getTimestamp("lastModifiedDate"));
							return releasesAlertsDTO;
						}
					});
		} catch (Exception e) {
			log.error("error occured while getting yesterdays release alerts" + e.getMessage());
		}
		return releasesAlerts;
	}

	@Override
	public List<ReleasesAlertsDTO> getThisWeekReleasedAlerts(int offset) {
		List<ReleasesAlertsDTO> releasesAlerts = new ArrayList<ReleasesAlertsDTO>();
		try {
			User user = userService.getUserWithAuthoritiesByLoginOrError();
			releasesAlerts = jdbcTemplate.query(
					"select type,comment,name,lastModifiedDate from ( select 'VIEW' as type,vr.release_comment as comment,v.view_name as name,vr.last_modified_date as lastModifiedDate from views v inner join view_releases vr on v.id=vr.view_id where vr.release_status='APPROVED' and v.realm_id = ? and vr.last_modified_date::date BETWEEN NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER+1 AND NOW()::DATE-EXTRACT(DOW from NOW())::INTEGER+7 "
							+ "UNION ALL select 'DASHBOARD' as type,dr.release_comment as comment,d.dashboard_name as name,dr.last_modified_date as lastModifiedDate from dashboards d inner join dashboard_releases dr on d.id=dr.dashboard_id where dr.release_status='APPROVED' and d.realm_id = ? and dr.last_modified_date::date BETWEEN NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER+1 AND NOW()::DATE-EXTRACT(DOW from NOW())::INTEGER+7 ) alert order by lastModifiedDate desc LIMIT 5 OFFSET ?",
					new Object[] { SecurityUtils.getUserAuth().getRealmId(), SecurityUtils.getUserAuth().getRealmId(), offset }, new RowMapper<ReleasesAlertsDTO>() {
						public ReleasesAlertsDTO mapRow(ResultSet srs, int rowNum) throws SQLException {
							ReleasesAlertsDTO releasesAlertsDTO = new ReleasesAlertsDTO(srs.getString("type"),
									srs.getString("comment"), srs.getString("name"),
									srs.getTimestamp("lastModifiedDate"));
							return releasesAlertsDTO;
						}
					});
		} catch (Exception e) {
			log.error("error occured while getting this week release alerts" + e.getMessage());
		}
		return releasesAlerts;
	}

	@Override
	public List<ReleasesAlertsDTO> getLastWeekReleasedAlerts(int offset) {
		List<ReleasesAlertsDTO> releasesAlerts = new ArrayList<ReleasesAlertsDTO>();
		try {
			User user = userService.getUserWithAuthoritiesByLoginOrError();
			releasesAlerts = jdbcTemplate.query(
					"select type,comment,name,lastModifiedDate from ( select 'VIEW' as type,vr.release_comment as comment,v.view_name as name,vr.last_modified_date as lastModifiedDate from views v inner join view_releases vr on v.id=vr.view_id where vr.release_status='APPROVED' and v.realm_id = ? and vr.last_modified_date::date BETWEEN NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER-6 AND NOW()::DATE-EXTRACT(DOW from NOW())::INTEGER "
							+ "UNION ALL select 'DASHBOARD' as type,dr.release_comment as comment,d.dashboard_name as name,dr.last_modified_date as lastModifiedDate from dashboards d inner join dashboard_releases dr on d.id=dr.dashboard_id where dr.release_status='APPROVED' and d.realm_id = ? and dr.last_modified_date::date BETWEEN NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER-6 AND NOW()::DATE-EXTRACT(DOW from NOW())::INTEGER ) alert order by lastModifiedDate desc LIMIT 5 OFFSET ?",
					new Object[] { SecurityUtils.getUserAuth().getRealmId(), SecurityUtils.getUserAuth().getRealmId(), offset }, new RowMapper<ReleasesAlertsDTO>() {
						public ReleasesAlertsDTO mapRow(ResultSet srs, int rowNum) throws SQLException {
							ReleasesAlertsDTO releasesAlertsDTO = new ReleasesAlertsDTO(srs.getString("type"),
									srs.getString("comment"), srs.getString("name"),
									srs.getTimestamp("lastModifiedDate"));
							return releasesAlertsDTO;
						}
					});
		} catch (Exception e) {
			log.error("error occured while getting last week release alerts" + e.getMessage());
		}
		return releasesAlerts;
	}

	@Override
	public List<ReleasesAlertsDTO> getOlderReleasedAlerts(int offset) {
		List<ReleasesAlertsDTO> releasesAlerts = new ArrayList<ReleasesAlertsDTO>();
		try {
			User user = userService.getUserWithAuthoritiesByLoginOrError();
			releasesAlerts = jdbcTemplate.query(
					"select type,comment,name,lastModifiedDate from ( select 'VIEW' as type,vr.release_comment as comment,v.view_name as name,vr.last_modified_date as lastModifiedDate from views v inner join view_releases vr on v.id=vr.view_id where vr.release_status='APPROVED' and v.realm_id = ? and vr.last_modified_date::date < NOW()::DATE-EXTRACT(DOW from NOW())::INTEGER-6 "
							+ "UNION ALL select 'DASHBOARD' as type,dr.release_comment as comment,d.dashboard_name as name,dr.last_modified_date as lastModifiedDate from dashboards d inner join dashboard_releases dr on d.id=dr.dashboard_id where dr.release_status='APPROVED' and d.realm_id = ? and dr.last_modified_date::date < NOW()::DATE-EXTRACT(DOW from NOW())::INTEGER-6 ) alert order by lastModifiedDate desc LIMIT 5 OFFSET ?",
					new Object[] { SecurityUtils.getUserAuth().getRealmId(), SecurityUtils.getUserAuth().getRealmId(), offset }, new RowMapper<ReleasesAlertsDTO>() {
						public ReleasesAlertsDTO mapRow(ResultSet srs, int rowNum) throws SQLException {
							ReleasesAlertsDTO releasesAlertsDTO = new ReleasesAlertsDTO(srs.getString("type"),
									srs.getString("comment"), srs.getString("name"),
									srs.getTimestamp("lastModifiedDate"));
							return releasesAlertsDTO;
						}
					});
		} catch (Exception e) {
			log.error("error occured while getting last week release alerts" + e.getMessage());
		}
		return releasesAlerts;
	}

	@Override
	public int getTodaysReleasedAlertsCount() {
		List<Integer> counts = null;

		int totalAlerts = 0;
		try {
			User user = userService.getUserWithAuthoritiesByLoginOrError();
			counts = jdbcTemplate.query(
					"select count(*) as count\n" +
							"from (select 1\n" +
							"      from view_releases vr\n" +
							"               join views v on v.id = vr.view_id and v.realm_id = ?\n" +
							"      where vr.release_status = 'APPROVED'\n" +
							"        and date_part('day', age(current_date, vr.last_modified_date::date)) = 0\n" +
							"      UNION ALL\n" +
							"      select 1\n" +
							"      from dashboard_releases dr\n" +
							"               join dashboards d on d.id = dr.dashboard_id and d.realm_id = ?\n" +
							"      where dr.release_status = 'APPROVED'\n" +
							"        and date_part('day', age(current_date, dr.last_modified_date::date)) = 0) alert",
					new Object[] { SecurityUtils.getUserAuth().getRealmId(), SecurityUtils.getUserAuth().getRealmId() }, new RowMapper<Integer>() {
						public Integer mapRow(ResultSet srs, int rowNum) throws SQLException {
							return srs.getInt("count");
						}
					});
			if (!counts.isEmpty() && counts != null)
				totalAlerts = counts.get(0);

		} catch (Exception e) {
			log.error("error occured while getting todays release alerts count" + e.getMessage());
		}
		return totalAlerts;
	}

	@Override
	public int getYesterdaysReleasedCount() {
		List<Integer> counts = null;

		int totalAlerts = 0;
		try {
			User user = userService.getUserWithAuthoritiesByLoginOrError();
			counts = jdbcTemplate.query(
					"select count(*) as count\n" +
							"from (select 1\n" +
							"      from view_releases vr\n" +
							"               join views v on v.id = vr.view_id and v.realm_id = ?\n" +
							"      where vr.release_status = 'APPROVED'\n" +
							"        and date_part('day', age(current_date, vr.last_modified_date::date)) = 1\n" +
							"      UNION ALL\n" +
							"      select 1\n" +
							"      from dashboard_releases dr\n" +
							"               join dashboards d on d.id = dr.dashboard_id and d.realm_id = ?\n" +
							"      where dr.release_status = 'APPROVED'\n" +
							"        and date_part('day', age(current_date, dr.last_modified_date::date)) = 1) alert",
					new Object[] { SecurityUtils.getUserAuth().getRealmId(), SecurityUtils.getUserAuth().getRealmId() }, new RowMapper<Integer>() {
						public Integer mapRow(ResultSet srs, int rowNum) throws SQLException {
							return srs.getInt("count");
						}
					});
			if (!counts.isEmpty() && counts != null)
				totalAlerts = counts.get(0);

		} catch (Exception e) {
			log.error("error occured while getting Yesterdays release alerts count" + e.getMessage());
		}
		return totalAlerts;
	}

	@Override
	public int getThisWeekReleasedCount() {
		List<Integer> counts = null;

		int totalAlerts = 0;
		try {
			User user = userService.getUserWithAuthoritiesByLoginOrError();
			counts = jdbcTemplate.query(
					"select count(*) as count\n" +
							"from (select 1\n" +
							"      from view_releases vr\n" +
							"               join views v on v.id = vr.view_id and v.realm_id = ?\n" +
							"      where vr.release_status = 'APPROVED'\n" +
							"        and vr.last_modified_date::date BETWEEN NOW()::DATE - EXTRACT(DOW FROM NOW())::INTEGER + 1 AND NOW()::DATE - EXTRACT(DOW from NOW())::INTEGER + 7\n" +
							"      UNION ALL\n" +
							"      select 1\n" +
							"      from dashboard_releases dr\n" +
							"               join dashboards d on d.id = dr.dashboard_id and d.realm_id = ?\n" +
							"      where dr.release_status = 'APPROVED'\n" +
							"        and dr.last_modified_date::date BETWEEN NOW()::DATE - EXTRACT(DOW FROM NOW())::INTEGER + 1 AND NOW()::DATE - EXTRACT(DOW from NOW())::INTEGER + 7) alert",
					new Object[] { SecurityUtils.getUserAuth().getRealmId(), SecurityUtils.getUserAuth().getRealmId() }, new RowMapper<Integer>() {
						public Integer mapRow(ResultSet srs, int rowNum) throws SQLException {
							return srs.getInt("count");
						}
					});
			if (!counts.isEmpty() && counts != null)
				totalAlerts = counts.get(0);

		} catch (Exception e) {
			log.error("error occured while getting this week release alerts count" + e.getMessage());
		}
		return totalAlerts;
	}

	@Override
	public int getLastWeekReleasedCount() {
		List<Integer> counts = null;

		int totalAlerts = 0;
		try {
			User user = userService.getUserWithAuthoritiesByLoginOrError();
			counts = jdbcTemplate.query(
					"select count(*) as count\n" +
							"from (select 1\n" +
							"      from view_releases vr\n" +
							"               join views v on v.id = vr.view_id and v.realm_id = ?\n" +
							"      where vr.release_status = 'APPROVED'\n" +
							"        and vr.last_modified_date::date BETWEEN NOW()::DATE - EXTRACT(DOW FROM NOW())::INTEGER - 6 AND NOW()::DATE - EXTRACT(DOW from NOW())::INTEGER\n" +
							"      UNION ALL\n" +
							"      select 1\n" +
							"      from dashboard_releases dr\n" +
							"               join dashboards d on d.id = dr.dashboard_id and d.realm_id = ?\n" +
							"      where dr.release_status = 'APPROVED'\n" +
							"        and dr.last_modified_date::date BETWEEN NOW()::DATE - EXTRACT(DOW FROM NOW())::INTEGER - 6 AND NOW()::DATE - EXTRACT(DOW from NOW())::INTEGER) alert",
					new Object[] { SecurityUtils.getUserAuth().getRealmId(), SecurityUtils.getUserAuth().getRealmId() }, new RowMapper<Integer>() {
						public Integer mapRow(ResultSet srs, int rowNum) throws SQLException {
							return srs.getInt("count");
						}
					});
			if (!counts.isEmpty() && counts != null)
				totalAlerts = counts.get(0);

		} catch (Exception e) {
			log.error("error occured while getting  last week release alerts count" + e.getMessage());
		}
		return totalAlerts;
	}

	@Override
	public int getOlderReleasedCount() {
		List<Integer> counts = null;

		int totalAlerts = 0;
		try {
			User user = userService.getUserWithAuthoritiesByLoginOrError();
			counts = jdbcTemplate.query(
					"select count(*) as count\n" +
							"from (select 1\n" +
							"      from view_releases vr\n" +
							"               join views v on v.id = vr.view_id and v.realm_id = ?\n" +
							"      where vr.release_status = 'APPROVED'\n" +
							"        and vr.last_modified_date::date < NOW()::DATE - EXTRACT(DOW from NOW())::INTEGER - 6\n" +
							"      UNION ALL\n" +
							"      select 1\n" +
							"      from dashboard_releases dr\n" +
							"               join dashboards d on d.id = dr.dashboard_id and d.realm_id = ?\n" +
							"      where dr.release_status = 'APPROVED'\n" +
							"        and dr.last_modified_date::date < NOW()::DATE - EXTRACT(DOW from NOW())::INTEGER - 6) alert",
					new Object[] { SecurityUtils.getUserAuth().getRealmId(), SecurityUtils.getUserAuth().getRealmId() }, new RowMapper<Integer>() {
						public Integer mapRow(ResultSet srs, int rowNum) throws SQLException {
							return srs.getInt("count");
						}
					});
			if (!counts.isEmpty() && counts != null)
				totalAlerts = counts.get(0);

		} catch (Exception e) {
			log.error("error occured while getting older release alerts count" + e.getMessage());
		}
		return totalAlerts;
	}

	@Override
	public ReleaseRequest save(ReleaseRequest request) {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		if (request.getRealm() == null) {
			request.setRealm(user.getRealmById(SecurityUtils.getUserAuth().getRealmId()));
		} else {
			if (!Objects.equals(request.getRealm().getId(), SecurityUtils.getUserAuth().getRealmId())) {
				throw new IllegalStateException("Cannot save release request for realm " + request.getRealm().getId());
			}
		}
		return releaseRequestRepository.save(request);
	}

	private BooleanExpression hasUserRealmAccess() {
		return QReleaseRequest.releaseRequest.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
	}
}
