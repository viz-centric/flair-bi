package com.flair.bi.view;

import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.domain.ViewState;
import com.flair.bi.view.export.ViewExportDTO;
import com.querydsl.core.types.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing {@link View}
 */
public interface ViewService {
	/**
	 * Save a view.
	 *
	 * @param view the entity to save
	 * @return the persisted entity
	 */
	View save(View view);

	/**
	 * Get all the views.
	 *
	 * @return the list of entities
	 */
	List<View> findAll();

	/**
	 * Retrieve all view where user has access to
	 *
	 * @param predicate additional predicates
	 * @return collection of views
	 */
	List<View> findAllByPrincipalPermissions(Predicate predicate);

	/**
	 * Retrieve all view where user has access to paginated.
	 *
	 * @param predicate additional predicates
	 * @param pageable  pagination
	 * @return collection of views
	 */
	Page<View> findAllByPrincipalPermissions(Predicate predicate, Pageable pageable);

	/**
	 * Count number of views user has access to
	 *
	 * @return integer
	 */
	Long countByPrincipalPermissions();

	/**
	 * Return views recently created by authenticated user
	 *
	 * @return collection of views
	 */
	List<View> recentlyCreated();

	/**
	 * Return most popular views
	 *
	 * @return collection of views
	 */
	List<View> mostPopular();

	/**
	 * Get one views by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	View findOne(Long id);

	/**
	 * Delete the views by id.
	 *
	 * @param id the id of the entity
	 */
	void delete(Long id);

	/**
	 * Find list of views by dashboard identifier
	 *
	 * @param dashboardId parameter representing dashboard id
	 * @return collection of views
	 */
	List<View> findByDashboardId(Long dashboardId);

	/**
	 * Find list of views by dashboard identifier
	 *
	 * @param dashboardId parameter representing dashboard id
	 * @param pageable  pagination
	 * @return collection of views
	 */
	Page<View> findByDashboardId(Long dashboardId,Pageable pageable);

	/**
	 * Retrieve current editing state of {@link View}
	 *
	 * @param viewId id of a view
	 * @return view state, never null
	 */
	ViewState getCurrentEditingViewState(Long viewId);

	/**
	 * Save an editing view state
	 *
	 * @param viewId    id of the view
	 * @param viewState view state
	 * @return saved view state
	 */
	ViewState saveViewState(Long viewId, ViewState viewState);

	/**
	 * Retrieve latest release
	 *
	 * @param viewId id of a view
	 * @return latest view state, can be null
	 */
	ViewRelease getCurrentViewStateRelease(Long viewId);

	/**
	 * Retrieve release state by version
	 *
	 * @param viewId  id of a view
	 * @param version version of view state
	 * @return view state, or null if not exists
	 */
	ViewRelease getReleaseViewStateByVersion(Long viewId, Long version);

	/**
	 * Get all releases that view has
	 *
	 * @param viewId id of a view
	 * @return collection of view releases
	 */
	List<ViewRelease> getViewReleases(Long viewId);

	/**
	 * Publish a new release for view
	 * <p>
	 * Release has to be approved else it will be rejected
	 *
	 * @param id      id of a view
	 * @param release release to be published
	 * @return updated view
	 */
	View publishRelease(Long id, ViewRelease release);

	/**
	 * Change the current release of the view
	 *
	 * @param id      id of a view
	 * @param version version of the release
	 * @return view that is changed, no changes occur if the version does not exist
	 */
	View changeCurrentRelease(Long id, Long version);

	void updateImageLocation(String imageLocation, Long id);

	String getImageLocation(Long id);

	View findByDashboardIdAndViewName(Long id, String viewName);

    /**
     * Prepare given view for export.
     * @param id
     * @return view to be exported
     */
    ViewExportDTO exportView(Long id);

	Optional<View> findViewCurrentEditingStateId(String viewStateId);

	void deleteAllByRealmId(Long realmId);
}
