package com.flair.bi.service;

import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.viewwatch.QViewWatch;
import com.flair.bi.domain.viewwatch.ViewWatch;
import com.flair.bi.domain.viewwatch.ViewWatchId;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.repository.ViewRepository;
import com.flair.bi.repository.ViewWatchRepository;
import com.flair.bi.security.SecurityUtils;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ViewWatchService {

	private final ViewWatchRepository viewWatchRepository;

	private final ViewRepository viewRepository;

	private final UserRepository userRepository;

	public Page<ViewWatch> findAll(Pageable pageable, Predicate predicate) {
		return viewWatchRepository.findAll(
				QViewWatch.viewWatch.user.login.eq(SecurityUtils.getCurrentUserLogin()).and(predicate), pageable);
	}

	public void saveViewWatch(String login, View view) {
		if (null == login || null == view) {
			return;
		}
		Optional<User> user = userRepository.findOneByLogin(login);

		final ViewWatchId id = user.map(x -> {
			ViewWatchId viewWatchId = new ViewWatchId();
			viewWatchId.setUserId(x.getId());
			viewWatchId.setViewId(view.getId());
			return viewWatchId;
		}).orElseThrow(IllegalArgumentException::new);

		final ViewWatch viewWatch = viewWatchRepository.findById(id).map(x -> x.incrementWatchCount()).orElseGet(() -> {
			ViewWatch x = new ViewWatch();
			x.setId(id);
			x.setWatchCount(1L);
			x.setUser(user.orElseThrow(IllegalArgumentException::new));
			x.setView(view);
			return x;
		});

		viewWatch.setWatchTime(ZonedDateTime.now());
		viewRepository.save(view);
		viewWatchRepository.save(viewWatch);

	}

	@Async
	public void saveViewWatchAsync(String login, View view) {
		saveViewWatch(login, view);
	}
}
