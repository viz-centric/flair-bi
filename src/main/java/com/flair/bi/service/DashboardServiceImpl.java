package com.flair.bi.service;

import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.DashboardRelease;
import com.flair.bi.domain.QDashboard;
import com.flair.bi.domain.Release;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.exception.UniqueConstraintsException;
import com.flair.bi.repository.DashboardReleaseRepository;
import com.flair.bi.repository.DashboardRepository;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.security.AuthoritiesConstants;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.view.ViewService;
import com.flair.bi.view.VisualMetadataService;
import com.flair.bi.view.export.ViewExportDTO;
import com.flair.bi.view.export.ViewImportResult;
import com.flair.bi.web.rest.errors.ErrorConstants;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Dashboard.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class DashboardServiceImpl implements DashboardService {

	private final DashboardRepository dashboardRepository;

	private final UserRepository userRepository;

	private final AccessControlManager accessControlManager;

	private final ViewService viewService;

	private final DashboardReleaseRepository dashboardReleaseRepository;

	private final VisualMetadataService visualMetadataService;

	private final JdbcTemplate jdbcTemplate;

	/**
	 * Save a dashboard.
	 *
	 * @param dashboard the entity to save
	 * @return the persisted entity
	 */
	@Override
	public Dashboard save(Dashboard dashboard) {
		log.debug("Request to save Dashboard : {}", dashboard);
		try {
			boolean create = dashboard.getId() == null;
			if (!create) {
				Optional<Dashboard> oldOpt = dashboardRepository.findById(dashboard.getId());

				if (oldOpt.isEmpty()) {
					throw new com.flair.bi.web.rest.errors.EntityNotFoundException(
							"The dashboard that suppose to exist does not exist.");
				}

				Dashboard old = oldOpt.get();

				// we want to change the published version in case they are non null and
				// different
				if (old.getCurrentRelease() != null && dashboard.getCurrentRelease() != null
						&& !old.getCurrentRelease().equals(dashboard.getCurrentRelease())) {

					old = this.changeCurrentReleaseVersion(dashboard.getId(),
							dashboard.getCurrentRelease().getVersionNumber());

				}
				// change other attributes
				old.setDashboardName(dashboard.getDashboardName());
				old.setDescription(dashboard.getDescription());
				// old.setImage(dashboard.getImage());
				old.setImageContentType(dashboard.getImageContentType());
				old.setImageLocation(dashboard.getImageLocation());
				old.setCategory(dashboard.getCategory());
				old.setDashboardDatasource(dashboard.getDashboardDatasource());

				// changes of view being published or not can be only applied by user who has
				// permission to do that
				if (accessControlManager.hasAccess(dashboard.getId().toString(), Action.TOGGLE_PUBLISH, "DASHBOARD")) {
					if (dashboard.isPublished() && old.getCurrentRelease() != null) {
						updatePublishState(old, dashboard.isPublished());
					} else if (!dashboard.isPublished()) {
						updatePublishState(old, dashboard.isPublished());
					}
				}
				dashboard = dashboardRepository.save(old);
			}
			if (create) {
				dashboard = dashboardRepository.save(dashboard);
				final Collection<Permission> savedPerms = accessControlManager
						.addPermissions(dashboard.getPermissions());
				// owner gets all permissions except able to delete published dashboard and
				// managing dashboard release requests
				accessControlManager.grantAccess(SecurityUtils.getCurrentUserLogin(),
						savedPerms.stream()
								.filter(x -> !x.getAction().equals(Action.DELETE_PUBLISHED)
										&& !x.getAction().equals(Action.MANAGE_PUBLISH)
										&& !x.getAction().equals(Action.TOGGLE_PUBLISH))
								.collect(Collectors.toList()));
				accessControlManager.assignPermissions(AuthoritiesConstants.ADMIN, savedPerms);

				if (!dashboard.getDashboardViews().isEmpty()) {
					// if there are also views add them
					dashboard.getDashboardViews().forEach(viewService::save);
				}
			}
		} catch (Exception e) {
			log.error("error occured while saving dashboard : " + e.getMessage());
			if (e.getMessage().contains("[dashboard_name_unique]")) {
				throw new UniqueConstraintsException(ErrorConstants.UNIQUE_CONSTRAINTS_ERROR, e);
			}
		}
		return dashboard;
	}

	/**
	 * Update publish state for each dashboard and cascading the change to views
	 *
	 * @param dashboard dashboard
	 * @param value     publish state value
	 */
	private void updatePublishState(Dashboard dashboard, boolean value) {
		dashboard.setPublished(value);
		dashboard.getDashboardViews().stream().peek(x -> x.setPublished(value)).forEach(viewService::save);
	}

	/**
	 * Get all the dashboards.
	 *
	 * @return the list of entities
	 */
	@Override
	@Transactional(readOnly = true)
	public List<Dashboard> findAll() {
		log.debug("Request to get all Dashboard");
		return dashboardRepository.findAll();
	}

	/**
	 * Get all the dashboards that principal has permission to.
	 *
	 * @return the list of entities
	 */
	@Override
	@Transactional(readOnly = true)
	public Page<Dashboard> findAllByPrincipalPermissions(Pageable pageable, Predicate predicate) {
		BooleanBuilder booleanBuilder = new BooleanBuilder(predicate).and(userHasPermission());
		return dashboardRepository.findAll(booleanBuilder, pageable);
	}

	@Override
	@Transactional(readOnly = true)
	public Long countByPrincipalPermissions() {
		return dashboardRepository.count(userHasPermission());
	}

	private Predicate userHasPermission() {
		final Optional<User> loggedInUser = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin());
		final User user = loggedInUser.orElseThrow(() -> new RuntimeException("User not found"));
		// retrieve all dashboard permissions that we have 'READ' permission
		final Set<Permission> permissions = user.getPermissionsByActionAndPermissionType(
				Arrays.asList(Action.READ, Action.READ_PUBLISHED), "DASHBOARD");
		return QDashboard.dashboard.id
				.in(permissions.stream().map(x -> Long.parseLong(x.getResource())).collect(Collectors.toSet()));
	}

	/**
	 * Get one dashboards by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Override
	@Transactional(readOnly = true)
	public Dashboard findOne(Long id) {
		log.debug("Request to get Dashboard : {}", id);
		return dashboardRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Dashboard with id: " + id + " does not exist"));
	}

	/**
	 * Delete the dashboards by id.
	 *
	 * @param id the id of the entity
	 */
	@Override
	public void delete(Long id) {
		log.debug("Request to delete Dashboard : {}", id);

		final Optional<Dashboard> dashboardOpt = dashboardRepository.findById(id);

		if (dashboardOpt.isEmpty()) {
			return;
		}

		final Dashboard dashboard = dashboardOpt.get();

		if (dashboard.isPublished()
				&& !accessControlManager.hasAccess(id.toString(), Action.DELETE_PUBLISHED, "DASHBOARD")) {
			throw new AccessDeniedException("User does not have a privilege");
		}

		dashboardReleaseRepository.deleteAll(dashboard.getDashboardReleases());
		accessControlManager.removePermissions(dashboard);
		dashboardRepository.delete(dashboard);
	}

	/**
	 * Retrieve all dashboards with views and permissions
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 */
	@Override
	public Page<Dashboard> findAll(Pageable pageable) {
		log.debug("Request to get dashboard page: {}", pageable);
		return dashboardRepository.findAll(pageable);
	}

	/**
	 * Find all dashboards by datasource ids
	 *
	 * @param datasourceIds list of datasource ids
	 * @return the list of dashboards
	 */
	@Override
	public List<Dashboard> findAllByDatasourceIds(List<Long> datasourceIds) {
		log.debug("Request to get all dashboards by datasources id");
		return dashboardRepository.findByDashboardDatasourceIdIn(datasourceIds);
	}

	/**
	 * Launch a new release of a dashboard
	 * <p>
	 * Release has to be previously approved else it will be rejected
	 *
	 * @param id      id of a dashboard
	 * @param release release to be published
	 * @return updated dashboard
	 */
	@Override
	public Dashboard publishRelease(Long id, DashboardRelease release) {
		if (!release.getReleaseStatus().equals(Release.Status.APPROVED)) {
			throw new IllegalArgumentException("Must be approved");
		}

		Dashboard dashboard = dashboardRepository.getOne(id);

		if (release.getVersionNumber().equals(-1L)) {
			Long version = dashboard.getDashboardReleases().stream()
					.max((o1, o2) -> Release.maxVersion().compare(o1, o2)).map(Release::getVersionNumber)
					.filter(x -> !x.equals(-1L)).map(x -> x + 1).orElse(1L);

			release.setVersionNumber(version);
		}

		dashboard.setPublished(true);
		dashboard.setCurrentRelease(release);

		return dashboardRepository.save(dashboard);
	}

	/**
	 * Retrieve latest release
	 *
	 * @param dashboardId id of a view
	 * @return latest dashboard release, can be null
	 */
	@Override
	public DashboardRelease getCurrentDashboardRelease(Long dashboardId) {
		return dashboardRepository.findById(dashboardId).map(Dashboard::getCurrentRelease).orElse(null);
	}

	/**
	 * Retrieve release by version
	 *
	 * @param dashboardId id of a dashboard
	 * @param version     version of dashboard release
	 * @return dashboard release, can be null if not exists
	 */
	@Override
	public DashboardRelease getReleaseByVersion(Long dashboardId, Long version) {
		return dashboardRepository.findById(dashboardId).map(Dashboard::getDashboardReleases)
				.map(x -> x.stream().filter(y -> y.getVersionNumber().equals(version)).findFirst().orElse(null))
				.orElse(null);
	}

	/**
	 * Get all releases for that dashboard
	 *
	 * @param dashboardId id of a view
	 * @return collection of view releases
	 */
	@Override
	public Collection<DashboardRelease> getDashboardReleases(Long dashboardId) {
		return dashboardRepository.findById(dashboardId).map(Dashboard::getDashboardReleases)
				.orElse(Collections.emptySet());
	}

	/**
	 * Change the version of current release
	 *
	 * @param id      id of a dashboard
	 * @param version version of the release
	 * @return changed dashboard, or untouched if version is not valid
	 */
	@Override
	public Dashboard changeCurrentReleaseVersion(Long id, Long version) {
		final Dashboard dashboard = dashboardRepository.findById(id).orElseThrow(EntityNotFoundException::new);

		boolean hasRelease = dashboard.getDashboardReleases().stream()
				.anyMatch(x -> x.getVersionNumber().equals(version));

		if (!hasRelease) {
			return null;
		}

		return dashboard.getDashboardReleases().stream()
				.filter(x -> x.getReleaseStatus().equals(Release.Status.APPROVED))
				.filter(x -> x.getVersionNumber().equals(version)).findFirst().map(x -> {
					// change the version according to the dashboard release
					x.getViewReleases()
							.forEach(y -> viewService.changeCurrentRelease(y.getView().getId(), y.getVersionNumber()));

					dashboard.setCurrentRelease(x);

					List<View> views = x.getViewReleases().stream().map(ViewRelease::getView)
							.collect(Collectors.toList());

					// for other views that are not in this release set release version to be null
					dashboard.getDashboardViews().stream().filter(y -> !views.contains(y))
							.forEach(y -> viewService.changeCurrentRelease(y.getId(), -1L));

					dashboardRepository.save(dashboard);
					return dashboard;

				}).orElse(null);

	}

	public void updateImageLocation(String imageLocation, Long id) {
		try {
			jdbcTemplate.update("UPDATE dashboards SET image_location=? WHERE id=?", imageLocation, id);
		} catch (Exception e) {
			log.error("error occured while updating image location" + e.getMessage());
		}
	}

	@Override
	public String getImageLocation(Long id) {
		String imageLocation = null;
		try {
			List<String> loc = jdbcTemplate.query("select image_location from dashboards where id=?",
					new Object[] { id }, new RowMapper<String>() {
						public String mapRow(ResultSet srs, int rowNum) throws SQLException {
							return srs.getString("image_location");
						}
					});
			imageLocation = loc.get(0);
		} catch (Exception e) {
			log.error("error occured while getting image location" + e.getMessage());
		}
		return imageLocation;
	}

    @Override
    public ViewImportResult importView(Long dashboardId, ViewExportDTO viewExportDTO) {
		log.debug("Importing dashboard {} view {}", dashboardId, viewExportDTO);
		final Dashboard dashboard = dashboardRepository.findById(dashboardId).orElseThrow(EntityNotFoundException::new);

		viewExportDTO.getEditState().setId(null);
		viewExportDTO.getEditState().setRevision(null);

		View view = ViewExportDTO.to(viewExportDTO);
		view.setViewDashboard(dashboard);
		View savedView = viewService.save(view);

		Optional.ofNullable(viewExportDTO.getEditState())
				.map(editState -> editState.getVisualMetadataSet())
				.orElseGet(() -> new HashSet<>())
				.forEach(vm -> {
					vm.setId(null);
					visualMetadataService.save(savedView.getId(), vm);
				});

		ViewImportResult result = new ViewImportResult();
		result.setId(savedView.getId());
		return result;
    }

    @Override
	public List<DashboardRelease> getDashboardReleasesList(Long dashboardId) {
		return dashboardReleaseRepository.findByDashboardId(dashboardId);
	}
}
