package com.flair.bi.web.rest;

import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.domain.ViewState;
import com.flair.bi.exception.UniqueConstraintsException;
import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.FileUploadService;
import com.flair.bi.service.ViewWatchService;
import com.flair.bi.service.dto.CountDTO;
import com.flair.bi.view.ViewService;
import com.flair.bi.view.export.ViewExportDTO;
import com.flair.bi.web.rest.dto.CreateViewReleaseRequestDTO;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.querydsl.core.types.Predicate;
import io.micrometer.core.annotation.Timed;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing View.
 */
@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class ViewsResource {

	private final ViewService viewService;

	private final ViewWatchService viewWatchService;

	private final ReleaseRequestService releaseRequestService;

	private final FileUploadService imageUploadService;

	/**
	 * POST /view : Create a new view.
	 *
	 * @param view the view to create
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         view, or with status 400 (Bad Request) if the view has already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/views")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#view.viewDashboard.id, 'WRITE', 'DASHBOARD')")
	public ResponseEntity<View> createViews(@Valid @RequestBody View view) throws URISyntaxException {
		log.debug("REST request to save View : {}", view);
		if (view.getId() != null) {
			return ResponseEntity.badRequest()
					.headers(HeaderUtil.createFailureAlert("view", "idexists", "A new view cannot already have an ID"))
					.body(null);
		}
		View viewExist = viewService.findByDashboardIdAndViewName(view.getViewDashboard().getId(), view.getViewName());
		if (viewExist != null)
			throw new UniqueConstraintsException("View already exists with this name");
		View result = viewService.save(view);
		try {
			if (view.getImage() != null) {
				String loc = imageUploadService.uploadedImageAndReturnPath(view.getImage(), result.getId(),
						view.getImageContentType(), "view");
				view.setImageLocation(loc);
				viewService.updateImageLocation(loc, result.getId());
			}
		} catch (Exception e) {
			return ResponseEntity.badRequest()
					.headers(HeaderUtil.createFailureAlert("view", "imageupload", "image is not uploaded")).body(null);
		}
		return ResponseEntity.created(new URI("/api/view/" + result.getId()))
				.headers(HeaderUtil.createEntityCreationAlert("view", result.getId().toString())).body(result);
	}

	/**
	 * PUT /view : Updates an existing view.
	 *
	 * @param view the view to update
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         view, or with status 400 (Bad Request) if the view is not valid, or
	 *         with status 500 (Internal Server Error) if the view couldnt be
	 *         updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/views")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#view.id, 'UPDATE', 'VIEW')")
	public ResponseEntity<View> updateViews(@Valid @RequestBody View view) throws URISyntaxException {
		log.debug("REST request to update View : {}", view);
		if (view.getId() == null) {
			return createViews(view);
		}
		try {
			if (view.getImage() != null) {
				String imageLocation = viewService.getImageLocation(view.getId());
				imageUploadService.deleteImage(imageLocation);
				String loc = imageUploadService.uploadedImageAndReturnPath(view.getImage(), view.getId(),
						view.getImageContentType(), "view");
				view.setImageLocation(loc);
			}
		} catch (Exception e) {
			return ResponseEntity.badRequest()
					.headers(HeaderUtil.createFailureAlert("view", "imageupload", "image is not uploaded")).body(null);
		}
		View result = viewService.save(view);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert("view", view.getId().toString()))
				.body(result);
	}

	/**
	 * GET /views : get all the views.
	 *
	 * @param predicate      predicate
	 * @param pageable       pageable if paginated wanted
	 * @param shouldPaginate if query is paginated
	 * @return the ResponseEntity with status 200 (OK) and the list of views in body
	 * @throws URISyntaxException when URI cannot be constructed
	 */
	@GetMapping("/views")
	@Timed
	public ResponseEntity<List<View>> getAllViews(@QuerydslPredicate(root = View.class) Predicate predicate,
			@ApiParam Pageable pageable,
			@RequestParam(name = "paginate", defaultValue = "false", required = false) boolean shouldPaginate)
			throws URISyntaxException {
		log.debug("REST request to get all View");
		if (shouldPaginate) {
			Page<View> page = viewService.findAllByPrincipalPermissions(predicate, pageable);
			HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/views");
			return ResponseEntity.status(200).headers(headers).body(page.getContent());
		} else {
			return ResponseEntity.ok(viewService.findAllByPrincipalPermissions(predicate));
		}
	}

	@GetMapping("/views/count")
	@Timed
	public CountDTO getViewsCount() {
		log.debug("REST request to get all views count");
		return new CountDTO(viewService.countByPrincipalPermissions());
	}

	@GetMapping("/views/recentlyCreated")
	@Timed
	public List<View> getRecentlyCreated() {
		return viewService.recentlyCreated();
	}

	@GetMapping("/views/mostPopular")
	@Timed
	public List<View> getMostPopular() {
		return viewService.mostPopular();
	}

	/**
	 * GET /views/:id : get the "id" views.
	 *
	 * @param id the id of the views to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the views, or
	 *         with status 404 (Not Found)
	 */
	@GetMapping("/views/{id}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'READ', 'VIEW') || @accessControlManager.hasAccess(#id, 'READ_PUBLISHED', 'VIEW')")
	public ResponseEntity<View> getViews(@PathVariable Long id) {
		log.debug("REST request to get View : {}", id);
		View view = viewService.findOne(id);
		viewWatchService.saveViewWatch(SecurityUtils.getCurrentUserLogin(), view);
		return Optional.ofNullable(view).map(result -> new ResponseEntity<>(result, HttpStatus.OK))
				.orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
	}

	/**
	 * DELETE /views/:id : delete the "id" views.
	 *
	 * @param id the id of the views to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/views/{id}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'DELETE', 'VIEW')")
	public ResponseEntity<Void> deleteViews(@PathVariable Long id) {
		log.debug("REST request to delete View : {}", id);
		String imageLocation = viewService.getImageLocation(id);
		imageUploadService.deleteImage(imageLocation);
		viewService.delete(id);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("views", id.toString())).build();
	}

	@GetMapping("/views/{viewId}/viewState")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#viewId, 'READ', 'VIEW')")
	public ResponseEntity<ViewState> getCurrentEditingState(@PathVariable Long viewId) {
		log.debug("REST request to get editing view state for view {}", viewId);
		ViewState currentEditingViewState = viewService.getCurrentEditingViewState(viewId);
		return ResponseEntity.ok(currentEditingViewState);
	}

	@PutMapping("/views/{viewId}/viewState")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#viewId, 'UPDATE', 'VIEW')")
	public ResponseEntity<ViewState> bulkSave(@PathVariable Long viewId,
			@Valid @RequestBody SaveViewStateDTO viewState) {

		ViewState vs = new ViewState();
		vs.setId(viewState.getId());
		vs.setVisualMetadataSet(new HashSet<>(viewState.getVisualMetadataSet()));
		return ResponseEntity.ok(viewService.saveViewState(viewId, vs));
	}

	@PutMapping("/views/{viewId}/requestRelease")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#viewId, 'REQUEST_PUBLISH', 'VIEW')")
	public ResponseEntity<ReleaseRequest> requestRelease(@PathVariable Long viewId,
			@Valid @RequestBody CreateViewReleaseRequestDTO dto) {
		View view = viewService.findOne(viewId);

		ViewRelease viewRelease = new ViewRelease();
		viewRelease.setComment(dto.getComment());
		viewRelease.setViewState(view.getCurrentEditingState());
		viewRelease.setView(view);

		return ResponseEntity.ok(releaseRequestService.requestRelease(viewRelease));
	}

	@GetMapping("/views/{viewId}/releases")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#viewId, 'READ_PUBLISHED', 'VIEW')")
	public ResponseEntity<List<ViewRelease>> getViewReleases(@PathVariable Long viewId) {
		return ResponseEntity.ok(viewService.getViewReleases(viewId));
	}

	@GetMapping("/views/{viewId}/releases/latest")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#viewId, 'READ_PUBLISHED', 'VIEW')")
	public ResponseEntity<ViewRelease> getLatestRelease(@PathVariable Long viewId) {
		return ResponseEntity.ok(viewService.getCurrentViewStateRelease(viewId));
	}

	@GetMapping("/views/{viewId}/releases/{version}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#viewId, 'READ_PUBLISHED', 'VIEW')")
	public ResponseEntity<ViewRelease> getRelease(@PathVariable Long viewId, @PathVariable Long version) {
		return ResponseEntity.ok(viewService.getReleaseViewStateByVersion(viewId, version));
	}

	@GetMapping("/views/{viewId}/export")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#viewId, 'READ', 'VIEW')")
	public ResponseEntity<ViewExportDTO> getExport(@PathVariable Long viewId) {
		return ResponseEntity.ok(viewService.exportView(viewId));
	}
}
