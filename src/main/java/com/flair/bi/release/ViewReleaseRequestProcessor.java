package com.flair.bi.release;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.DashboardRelease;
import com.flair.bi.domain.QDashboard;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.repository.DashboardRepository;
import com.flair.bi.repository.ReleaseRequestRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.UserService;
import com.flair.bi.web.rest.errors.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

@Component(value = "viewReleaseProcessor")
@Transactional
@RequiredArgsConstructor
class ViewReleaseRequestProcessor implements ReleaseRequestProcessor<ViewRelease> {

	private final ReleaseRequestRepository releaseRequestRepository;

	private final UserService userService;

	private final DashboardRepository dashboardRepository;

	@Override
	public ReleaseRequest requestRelease(ViewRelease entity) {

		ReleaseRequest request = new ReleaseRequest();
		request.setRequestedBy(userService.getUserWithAuthoritiesByLogin(SecurityUtils.getCurrentUserLogin())
				.orElseThrow(RuntimeException::new));
		request.setComment(entity.getComment());

		Optional<Dashboard> dashboard = dashboardRepository
				.findOne(QDashboard.dashboard.dashboardViews.contains(entity.getView()));

		DashboardRelease dashboardRelease = new DashboardRelease();
		dashboardRelease.setRequestedBy(request.getRequestedBy());
		dashboardRelease.add(entity);
		dashboardRelease.setComment(entity.getComment());

		// since they are fresh releases they do not have assigned version number until,
		// first approved
		dashboardRelease.setVersionNumber(-1L);
		entity.setVersionNumber(-1L);
		entity.setRequestedBy(request.getRequestedBy());

		return dashboard.map(dash -> {
			dash.add(dashboardRelease);

			List<ViewRelease> viewReleases = dash.getDashboardViews().stream()
					.filter(x -> !x.getId().equals(entity.getView().getId())).filter(x -> x.getCurrentRelease() != null)
					.map(View::getCurrentRelease).collect(Collectors.toList());
			dashboardRelease.add(viewReleases);
			request.setRelease(dashboardRelease);
			ReleaseRequest r = releaseRequestRepository.save(request);
			dashboardRepository.save(dash);
			return r;
		}).orElseThrow(() -> new EntityNotFoundException("Cannot make a release no dashboard found"));
	}

}
