package com.flair.bi.view;

import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.domain.QView;
import com.flair.bi.domain.Release;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.domain.ViewState;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.repository.ViewRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.BookMarkWatchService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.ViewWatchService;
import com.flair.bi.view.export.ViewExportDTO;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing View.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
class ViewServiceImpl implements ViewService {

	private final ViewRepository viewRepository;

	private final UserService userService;

	private final IViewStateRepository viewStateCouchDbRepository;

	private final AccessControlManager accessControlManager;

	private final ViewWatchService viewWatchService;

	private final JdbcTemplate jdbcTemplate;

	private final BookMarkWatchService bookMarkWatchService;

	/**
	 * Save a views.
	 *
	 * @param views the entity to save
	 * @return the persisted entity
	 */
	@Override
	public View save(View views) {
		log.debug("Request to save View : {}", views);
		boolean create = null == views.getId();
		View view = views;

		if (!create) {
			view = findById(views.getId());
			view.setDescription(views.getDescription());
			// view.setImage(views.getImage());
			view.setImageContentType(views.getImageContentType());
			view.setImageLocation(views.getImageLocation());

			// changes of view being published or not can be only applied by user who has
			// permission to do that
			if (accessControlManager.hasAccess(view.getId().toString(), Action.TOGGLE_PUBLISH, "VIEW")) {
				if (views.isPublished() && view.getCurrentRelease() != null) {
					view.setPublished(views.isPublished());
				} else if (!views.isPublished()) {
					view.setPublished(views.isPublished());
				}
			}

			view.setViewName(views.getViewName());
			view.setViewDashboard(views.getViewDashboard());
		} else {

			User user = userService.getUserWithAuthoritiesByLoginOrError();
			view.setRealm(user.getRealmById(SecurityUtils.getUserAuth().getRealmId()));

			// we temporary set the invalid id, because first we want to make sure that
			// saving into couchdb was successfull
			// and then fully commit on postgres.
			// Because if error on couchdb occurs it will trigger postgres rollbacking.
			ViewState vs = new ViewState();
			vs.setId("temp");
			view.setCurrentEditingState(vs);
		}

		View v = viewRepository.save(view);

		if (create) {
			Set<Permission> permissions = view.getPermissions();
			permissions = new HashSet<>(accessControlManager.addPermissions(permissions));
			final View vw = v;
			permissions.forEach(x -> accessControlManager.connectPermissions(x,
					new Permission(vw.getViewDashboard().getId().toString(), x.getAction(),
							vw.getViewDashboard().getScope()),
					x.getAction().equals(Action.READ) || x.getAction().equals(Action.REQUEST_PUBLISH)
							|| x.getAction().equals(Action.MANAGE_PUBLISH)
							|| x.getAction().equals(Action.READ_PUBLISHED),
					true,
					vw.getRealm()));

			ViewState viewState = new ViewState();
			viewStateCouchDbRepository.add(viewState);

			v.setCurrentEditingState(viewState);
			v = viewRepository.save(v);
		}

		return v;
	}

	/**
	 * Change the release version of the view
	 *
	 * @param view          view
	 * @param versionNumber version number to be release
	 */
	private void changeReleaseVersion(View view, Long versionNumber) {
		if (null == view) {
			throw new EntityNotFoundException();
		}

		if (view.getCurrentRelease() != null && !view.getCurrentRelease().getVersionNumber().equals(versionNumber)) {
			view.getReleases().stream().filter(x -> x.getVersionNumber().equals(versionNumber)).findFirst()
					.ifPresent(view::setCurrentRelease);
		}

	}

	/**
	 * Get all the views.
	 *
	 * @return the list of entities
	 */
	@Override
	@Transactional(readOnly = true)
	public List<View> findAll() {
		log.debug("Request to get all View");
		return ImmutableList.copyOf(
				viewRepository.findAll(hasUserRealmAccess())
		);
	}

	@Override
	@Transactional(readOnly = true)
	public List<View> findAllByPrincipalPermissions(Predicate predicate) {
		log.debug("Request to get all View");
		return ImmutableList.copyOf(
				viewRepository.findAll(userHasPermission().and(predicate).and(hasUserRealmAccess()))
		);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<View> findAllByPrincipalPermissions(Predicate predicate, Pageable pageable) {
		log.debug("Request to get paginated View");
		return viewRepository.findAll(userHasPermission().and(predicate).and(hasUserRealmAccess()), pageable);
	}

	private BooleanExpression userHasPermission() {
		final User user = userService.getUserWithAuthoritiesByLoginOrError();
		// retrieve all view permissions that we have 'READ' permission or
		// 'READ_PUBLISHED'
		final Set<Permission> permissions = user
				.getPermissionsByActionAndPermissionType(Arrays.asList(Action.READ, Action.READ_PUBLISHED), "VIEW");
		return QView.view.id
				.in(permissions.stream().map(x -> Long.parseLong(x.getResource())).collect(Collectors.toSet()));
	}

	@Override
	@Transactional(readOnly = true)
	public Long countByPrincipalPermissions() {
		return viewRepository.count(userHasPermission().and(hasUserRealmAccess()));
	}

	@Override
	@Transactional(readOnly = true)
	public List<View> recentlyCreated() {
		final BooleanExpression createdBy = QView.view.createdBy.eq(SecurityUtils.getCurrentUserLogin());
		final Sort sort = Sort.by(Sort.Direction.DESC, "createdDate");
		final PageRequest pageRequest = PageRequest.of(0, 5, sort);

		return viewRepository.findAll(createdBy.and(userHasPermission().and(hasUserRealmAccess())), pageRequest).getContent();
	}

	@Override
	@Transactional(readOnly = true)
	public List<View> mostPopular() {
		final Sort sort = Sort.by(Sort.Direction.DESC, "watchCount");
		final PageRequest pageRequest = PageRequest.of(0, 5, sort);
		return viewRepository.findAll(userHasPermission().and(hasUserRealmAccess()), pageRequest).getContent();
	}

	/**
	 * Get one views by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Override
	@Transactional
	public View findOne(Long id) {
		log.debug("Request to get View : {}", id);
		View view = findById(id);
		viewWatchService.saveViewWatch(SecurityUtils.getCurrentUserLogin(), view);
		return view;
	}

	private View findById(Long id) {
		return viewRepository.findOne(hasUserRealmAccess().and(QView.view.id.eq(id))).orElseThrow();
	}

	/**
	 * Delete the views by id.
	 *
	 * @param id the id of the entity
	 */
	@Override
	public void delete(Long id) {
		log.debug("Request to delete View : {}", id);
		try {
			final View view = findById(id);
			if (view.isPublished() && !accessControlManager.hasAccess(id.toString(), Action.DELETE_PUBLISHED, "VIEW")) {
				throw new AccessDeniedException("User does not have a priviledge");
			}
			// delete view permissions and connections
			Set<Permission> permissions = view.getPermissions();
			permissions.forEach(x -> accessControlManager.disconnectPermissions(x, new Permission(
					view.getViewDashboard().getId().toString(), x.getAction(), view.getViewDashboard().getScope())));
			// remove permissions
			accessControlManager.removePermissions(permissions);
			// remove bookmark watches
			bookMarkWatchService.deleteBookmarkWatchesByViewId(id);
			viewRepository.delete(view);
			// if the document is already deleted we ignore the error
			// remove view
			viewStateCouchDbRepository.remove(viewStateCouchDbRepository.get(view.getCurrentEditingState().getId()));
			view.getReleases().stream().map(ViewRelease::getViewState).map(ViewState::getId)
					.map(viewStateCouchDbRepository::get).forEach(viewStateCouchDbRepository::remove);
		} catch (Exception e) {
			log.error(e.getMessage());
		}

	}

	@Override
	@Transactional(readOnly = true)
	public Page<View> findByDashboardId(Long dashboardId,Pageable pageable) {
		final Sort sort = Sort.by(Sort.Direction.ASC, "viewName");
		final PageRequest pageRequest = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
		return viewRepository.findAll(hasUserRealmAccess().and(QView.view.viewDashboard.id.eq(dashboardId)), pageRequest);
	}

	@Override
	@Transactional(readOnly = true)
	public List<View> findByDashboardId(Long dashboardId) {
		return ImmutableList.copyOf(
				viewRepository.findAll(hasUserRealmAccess().and(QView.view.viewDashboard.id.eq(dashboardId)))
		);
	}

	/**
	 * Retrieve current editing state of {@link View}
	 *
	 * @param viewId id of a view
	 * @return view state, never null
	 */
	@Override
	public ViewState getCurrentEditingViewState(Long viewId) {
		final View view = findById(viewId);

		return viewStateCouchDbRepository.get(view.getCurrentEditingState().getId());
	}

	/**
	 * Save an editing view state
	 *
	 * @param viewId    id of the view
	 * @param viewState view state
	 * @return saved view state
	 */
	@Override
	public ViewState saveViewState(Long viewId, ViewState viewState) {
		final View view = findById(viewId);

		final ViewState vs = viewStateCouchDbRepository.get(view.getCurrentEditingState().getId());
		if (null == viewState || vs.isReadOnly()) {
			throw new EntityNotFoundException("View state not found");
		}

		if (view.getCurrentEditingState() != null && view.getCurrentEditingState().getId() != null) {
			if (!Objects.equals(view.getCurrentEditingState().getId(), vs.getId())) {
				throw new IllegalStateException("Cannot save view state " + vs.getId() + " for view " + viewId);
			}
		}
		view.setCurrentEditingState(vs);

		viewState.getVisualMetadataSet().stream().filter(x -> x.getId() == null).forEach(x -> x.setId(
				VisualMetadata.constructId(UUID.randomUUID().toString(), view.getCurrentEditingState().getId())));

		vs.setVisualMetadataSet(viewState.getVisualMetadataSet());

		viewStateCouchDbRepository.update(vs);

		return vs;
	}

	/**
	 * Retrieve latest release
	 *
	 * @param viewId id of a view
	 * @return latest view state, can be null
	 */
	@Override
	public ViewRelease getCurrentViewStateRelease(Long viewId) {
		View view = findById(viewId);

		if (view.getCurrentRelease() == null) {
			return null;
		} else {
			ViewRelease viewRelease = view.getCurrentRelease();
			viewRelease.setViewState(viewStateCouchDbRepository.get(view.getCurrentRelease().getViewState().getId()));
			return viewRelease;
		}
	}

	/**
	 * Retrieve release state by version
	 *
	 * @param viewId  id of a view
	 * @param version version of view state
	 * @return view state, or null if not exists
	 */
	@Override
	public ViewRelease getReleaseViewStateByVersion(Long viewId, Long version) {
		View view = findById(viewId);

		if (view.getCurrentRelease() != null && view.getCurrentRelease().getVersionNumber().equals(version)) {
			ViewState state = viewStateCouchDbRepository.get(view.getCurrentRelease().getViewState().getId());
			view.getCurrentRelease().setViewState(state);
			return view.getCurrentRelease();
		} else {
			return view.getReleases().stream().filter(x -> x.getVersionNumber().equals(version)).findFirst().map(x -> {
				x.setViewState(viewStateCouchDbRepository.get(x.getViewState().getId()));
				return x;
			}).orElse(null);
		}

	}

	/**
	 * Get all releases that view has
	 *
	 * @param viewId id of a view
	 * @return collection of view releases
	 */
	@Override
	public List<ViewRelease> getViewReleases(Long viewId) {
		return new ArrayList<>(findById(viewId).getReleases());
	}

	/**
	 * Publish a new release for view
	 * <p>
	 * Release has to be approved else it will be rejected
	 *
	 * @param id      id of a view
	 * @param release release to be published
	 * @return updated view
	 */
	@Override
	public View publishRelease(Long id, ViewRelease release) {
		if (!release.getReleaseStatus().equals(Release.Status.APPROVED)) {
			throw new IllegalArgumentException("Must be approved");
		}

		View view = findById(id);
		view.setCurrentEditingState(viewStateCouchDbRepository.get(view.getCurrentEditingState().getId()));

		// load view state
		release.setViewState(viewStateCouchDbRepository.get(release.getViewState().getId()));

		if (release.getVersionNumber().equals(-1L)) {
			Long version = view.getReleases().stream().max((o1, o2) -> Release.maxVersion().compare(o1, o2))
					.map(Release::getVersionNumber).filter(x -> !x.equals(-1L)).map(x -> x + 1).orElse(1L);

			release.setVersionNumber(version);
		}

		// if current editing is same as release state we need to create a new view
		// state
		if (view.getCurrentEditingState().getId().equalsIgnoreCase(release.getViewState().getId())) {
			ViewState viewState = new ViewState();

			// copy new metadata
			release.getViewState().getVisualMetadataSet().forEach(viewState::addVisualMetadata);

			viewStateCouchDbRepository.add(viewState);
			view.setCurrentEditingState(viewState);

		}

		view.setPublished(true);
		view.setCurrentRelease(release);

		return viewRepository.save(view);
	}

	/**
	 * Change the current release of the view
	 *
	 * @param id      id of a view
	 * @param version version of the release
	 * @return view that is changed, no changes occur if the version does not exist
	 */
	@Override
	public View changeCurrentRelease(Long id, Long version) {
		return Optional.ofNullable(findById(id)).map(x -> {
			ViewRelease viewRelease = x.getReleases().stream()
					.filter(y -> y.getReleaseStatus().equals(Release.Status.APPROVED))
					.filter(y -> y.getVersionNumber().equals(version)).findFirst().orElse(null);

			x.setCurrentRelease(viewRelease);
			x.setPublished(viewRelease != null);
			return x;
		}).map(viewRepository::save).orElse(null);
	}

	public void updateImageLocation(String imageLocation, Long id) {
		try {
			jdbcTemplate.update("UPDATE views SET image_location=? WHERE id=?", imageLocation, id);
		} catch (Exception e) {
			log.error("error occured while updating image location" + e.getMessage());
		}
	}

	@Override
	public String getImageLocation(Long id) {
		String imageLocation = null;
		try {
			List<String> loc = jdbcTemplate.query("select image_location from views where id=?", new Object[] { id },
					new RowMapper<String>() {
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
	public View findByDashboardIdAndViewName(Long id, String viewName) {
		return viewRepository.findByDashboardIdAndViewNameAndRealmId(id, viewName, SecurityUtils.getUserAuth().getRealmId());
	}

	@Override
	@Transactional(readOnly = true)
	public ViewExportDTO exportView(Long id) {
		return Optional.ofNullable(findById(id)).map(view -> {
			view.setCurrentEditingState(viewStateCouchDbRepository.get(view.getCurrentEditingState().getId()));
			return ViewExportDTO.from(view);
		}).orElse(null);
	}

	@Transactional(readOnly = true)
	@Override
	public Optional<View> findViewCurrentEditingStateId(String viewStateId) {
		return viewRepository.findOne(QView.view.currentEditingState.id.eq(viewStateId).and(hasUserRealmAccess()));
	}

	@Override
	public void deleteAllByRealmId(Long realmId) {
		viewRepository.deleteAllByRealmId(realmId);
	}

	private BooleanExpression hasUserRealmAccess() {
		return QView.view.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
	}
}
