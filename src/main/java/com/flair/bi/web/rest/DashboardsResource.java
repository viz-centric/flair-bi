package com.flair.bi.web.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.DashboardRelease;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.FileUploadService;
import com.flair.bi.service.ViewExportImportException;
import com.flair.bi.service.ViewExportImportService;
import com.flair.bi.service.dto.CountDTO;
import com.flair.bi.view.ViewService;
import com.flair.bi.view.export.ViewExportDTO;
import com.flair.bi.view.export.ViewImportResult;
import com.flair.bi.web.rest.dto.CreateDashboardReleaseDTO;
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
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Dashboard.
 */
@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class DashboardsResource {

	private final DashboardService dashboardService;

	private final ReleaseRequestService service;

	private final ViewService viewService;

	private final FileUploadService imageUploadService;

	private final ViewsResource viewsResource;

	private final ObjectMapper objectMapper;

	private final ViewExportImportService viewExportImportService;

	/**
	 * POST /dashboard : Create a new dashboard.
	 *
	 * @param dashboard the dashboard to create
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         dashboard, or with status 400 (Bad Request) if the dashboard has
	 *         already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/dashboards")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('DASHBOARDS', 'WRITE', 'APPLICATION')")
	public ResponseEntity<Dashboard> createDashboards(@Valid @RequestBody Dashboard dashboard)
			throws URISyntaxException {
		log.debug("REST request to save Dashboard : {}", dashboard);
		if (dashboard.getId() != null) {
			return ResponseEntity.badRequest().headers(
					HeaderUtil.createFailureAlert("dashboard", "idexists", "A new dashboard cannot already have an ID"))
					.body(null);
		}
		Dashboard result = dashboardService.save(dashboard);
		try {
			if (dashboard.getImage() != null) {
				String loc = imageUploadService.uploadedImageAndReturnPath(dashboard.getImage(), result.getId(),
						dashboard.getImageContentType(), "dashboard");
				dashboard.setImageLocation(loc);
				dashboardService.updateImageLocation(loc, result.getId());
			}
		} catch (Exception e) {
			return ResponseEntity.badRequest()
					.headers(HeaderUtil.createFailureAlert("dashboard", "imageupload", "image is not uploaded"))
					.body(null);
		}
		return ResponseEntity.created(new URI("/api/dashboard/" + result.getId()))
				.headers(HeaderUtil.createEntityCreationAlert("dashboard", result.getId().toString())).body(result);
	}

	/**
	 * PUT /dashboard : Updates an existing dashboard.
	 *
	 * @param dashboard the dashboard to update
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         dashboard, or with status 400 (Bad Request) if the dashboard is not
	 *         valid, or with status 500 (Internal Server Error) if the dashboard
	 *         couldnt be updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/dashboards")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#dashboard.id, 'UPDATE', 'DASHBOARD')")
	public ResponseEntity<Dashboard> updateDashboards(@Valid @RequestBody Dashboard dashboard)
			throws URISyntaxException {
		log.debug("REST request to update Dashboard : {}", dashboard);
		if (dashboard.getId() == null) {
			return createDashboards(dashboard);
		}
		try {
			if (dashboard.getImage() != null) {
				String imageLocation = dashboardService.getImageLocation(dashboard.getId());
				imageUploadService.deleteImage(imageLocation);
				String loc = imageUploadService.uploadedImageAndReturnPath(dashboard.getImage(), dashboard.getId(),
						dashboard.getImageContentType(), "dashboard");
				dashboard.setImageLocation(loc);
			}
		} catch (Exception e) {
			return ResponseEntity.badRequest()
					.headers(HeaderUtil.createFailureAlert("dashboard", "imageupload", "image is not uploaded"))
					.body(null);
		}
		Dashboard result = dashboardService.save(dashboard);
		return ResponseEntity.ok()
				.headers(HeaderUtil.createEntityUpdateAlert("dashboard", dashboard.getId().toString())).body(result);
	}

	/**
	 * GET /dashboards : get all the dashboards.
	 *
	 * @param predicate predicate
	 * @param pageable  pageable
	 * @throws URISyntaxException error
	 * @return the ResponseEntity with status 200 (OK) and the list of dashboards in
	 *         body
	 */
	@GetMapping("/dashboards")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('DASHBOARDS', 'READ', 'APPLICATION')")
	public ResponseEntity<List<Dashboard>> getAllDashboards(
			@QuerydslPredicate(root = Dashboard.class) Predicate predicate, @ApiParam Pageable pageable)
			throws URISyntaxException {
		log.debug("REST request to get all Dashboard");
		Page<Dashboard> page = dashboardService.findAllByPrincipalPermissions(pageable, predicate);
		HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/dashboards");
		return ResponseEntity.status(200).headers(headers).body(page.getContent());
	}

	@GetMapping("/dashboards/count")
	public ResponseEntity<CountDTO> getDashboardsCount() {
		log.debug("REST request to get dashboard count");
		Long count = dashboardService.countByPrincipalPermissions();
		return ResponseEntity.ok(new CountDTO(count));
	}

	/**
	 * GET /dashboards/:id : get the "id" dashboards.
	 *
	 * @param id the id of the dashboards to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the dashboards,
	 *         or with status 404 (Not Found)
	 */
	@GetMapping("/dashboards/{id}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'READ', 'DASHBOARD') || @accessControlManager.hasAccess(#id, 'READ_PUBLISHED', 'DASHBOARD')")
	public ResponseEntity<Dashboard> getDashboards(@PathVariable Long id) {
		log.debug("REST request to get Dashboard : {}", id);
		Dashboard dashboard = dashboardService.findOne(id);
		return Optional.ofNullable(dashboard).map(result -> new ResponseEntity<>(result, HttpStatus.OK))
				.orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
	}

	/**
	 * DELETE /dashboards/:id : delete the "id" dashboards.
	 *
	 * @param id the id of the dashboards to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/dashboards/{id}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'DELETE', 'DASHBOARD')")
	public ResponseEntity<Void> deleteDashboards(@PathVariable Long id) {
		log.debug("REST request to delete Dashboard : {}", id);
		List<View> dashboardViews = viewService.findByDashboardId(id);
		for (View view : dashboardViews) {
			viewsResource.deleteViews(view.getId());
		}
		String imageLocation = dashboardService.getImageLocation(id);
		if (imageLocation != null) {
			imageUploadService.deleteImage(imageLocation);
		}
		dashboardService.delete(id);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("dashboards", id.toString())).build();
	}

	@GetMapping("/dashboards/{id}/datasource")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'READ', 'DASHBOARD')  ||"
			+ "@accessControlManager.hasAccess(#id, 'READ_PUBLISHED', 'DASHBOARD')")
	public ResponseEntity<Datasource> getDatasource(@PathVariable Long id) {
		log.debug("REST request to retrieve dashboard datasource: {}", id);
		final Dashboard dashboard = dashboardService.findOne(id);
		return ResponseEntity.ok(dashboard.getDashboardDatasource());
	}

	@PutMapping("/dashboards/{id}/requestRelease")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'REQUEST_PUBLISH', 'DASHBOARD')")
	public ResponseEntity<ReleaseRequest> requestRelease(@PathVariable Long id,
			@Valid @RequestBody CreateDashboardReleaseDTO dto) {
		Dashboard dashboard = dashboardService.findOne(id);

		DashboardRelease dashboardRelease = new DashboardRelease();
		dashboardRelease.setComment(dto.getComment());
		dashboardRelease.setDashboard(dashboard);
		dto.getViewIds().forEach(x -> {
			View view = viewService.findOne(x);
			ViewRelease viewRelease = new ViewRelease();
			viewRelease.setComment(dto.getComment());
			viewRelease.setViewState(view.getCurrentEditingState());
			viewRelease.setView(view);
			dashboardRelease.add(viewRelease);

		});

		return ResponseEntity.ok(service.requestRelease(dashboardRelease));
	}

	@GetMapping("/dashboards/{id}/releases")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'READ_PUBLISHED', 'DASHBOARD')")
	public Collection<DashboardRelease> getDashboardReleases(@PathVariable Long id) {
		return dashboardService.getDashboardReleases(id);
	}

	@GetMapping("/dashboards/{id}/releases/list")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'READ_PUBLISHED', 'DASHBOARD')")
	public List<DashboardRelease> getDashboardReleasesList(@PathVariable Long id) {
		return dashboardService.getDashboardReleasesList(id);
	}

	@GetMapping("/dashboards/{id}/releases/latest")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'READ_PUBLISHED', 'DASHBOARD')")
	public DashboardRelease getLatestRelease(@PathVariable Long id) {
		return dashboardService.getCurrentDashboardRelease(id);
	}

	@GetMapping("/dashboards/{id}/releases/{version}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'READ_PUBLISHED', 'DASHBOARD')")
	public DashboardRelease getRelease(@PathVariable Long id, @PathVariable Long version) {
		return dashboardService.getReleaseByVersion(id, version);
	}

	@PostMapping("/dashboards/{id}/importView")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess(#id, 'WRITE', 'DASHBOARD')")
	public ResponseEntity<ViewImportResult> importView(@PathVariable Long id,
													   @RequestParam("file") MultipartFile file) throws IOException, ViewExportImportException {
		byte[] bytes = file.getBytes();
		ViewExportDTO viewExportDTO = objectMapper.readValue(bytes, ViewExportDTO.class);
		return ResponseEntity.ok(viewExportImportService.importView(id, viewExportDTO));
	}

}
