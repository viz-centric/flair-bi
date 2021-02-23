package com.flair.bi.service;

import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.bookmarkwatch.BookmarkWatch;
import com.flair.bi.domain.bookmarkwatch.BookmarkWatchId;
import com.flair.bi.domain.bookmarkwatch.QBookmarkWatch;
import com.flair.bi.repository.BookmarkWatchRepository;
import com.flair.bi.security.SecurityUtils;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class BookMarkWatchService {

	private final UserService userService;

	private final BookmarkWatchRepository bookmarkWatchRepository;

	@Lazy // TODO: remove this dependency to avoid cycling dependency issue
	@Autowired
	private FeatureBookmarkService featureBookmarkService;

	private final JdbcTemplate jdbcTemplate;

	public Page<BookmarkWatch> findAll(Pageable pageable, Predicate predicate) {
		return bookmarkWatchRepository.findAll(
				QBookmarkWatch.bookmarkWatch.user.login.eq(SecurityUtils.getCurrentUserLogin()).and(predicate),
				pageable);
	}

	@Async
	public void saveBookmarkWatchAsync(Long bookmarkId, Long viewId, View view) {
		if (null == view || null == bookmarkId) {
			return;
		}
		User user = userService.getUserWithAuthoritiesByLoginOrError();

		if (!Objects.equals(SecurityUtils.getUserAuth().getRealmId(), view.getRealm().getId())) {
			throw new IllegalStateException("User " + user.getId() + " does not belong to realm " + view.getRealm().getId());
		}

		BookmarkWatchId id = new BookmarkWatchId();
		id.setUserId(user.getId());
		id.setBookmarkId(bookmarkId);
		id.setViewId(viewId);

		BookmarkWatch bookmarkWatch = bookmarkWatchRepository.findById(id).map(x -> x.incrementWatchCount())
				.orElseGet(() -> {
					final BookmarkWatch x = new BookmarkWatch();
					x.setId(id);
					x.setWatchCount(1L);
					x.setUser(user);
					x.setView(view);
					x.setFeatureBookmark(featureBookmarkService.findOne(bookmarkId));
					return x;
				});

		bookmarkWatch.setWatchTime(ZonedDateTime.now());
		bookmarkWatch.setWatchCreatedTime(bookmarkWatch.getWatchCreatedTime());
		bookmarkWatchRepository.save(bookmarkWatch);

	}

	public int getCreatedBookmarkCount() {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		List<Integer> counts;
		int count = 0;
		try {
			counts = jdbcTemplate.query("select count(*) as count  from bookmark_watches where user_id=?",
					new Object[] { user.getId() }, new RowMapper<Integer>() {
						public Integer mapRow(ResultSet srs, int rowNum) throws SQLException {
							return srs.getInt("count");
						}
					});
			if (!counts.isEmpty())
				count = counts.get(0);

		} catch (Exception e) {
			log.error("error occured while getting created bookmarks count" + e.getMessage());
		}
		return count;
	}

	public void deleteBookmarkWatchesByViewId(Long viewId) {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		try {
			jdbcTemplate.update("delete from bookmark_watches where view_id=? and user_id=?",
					viewId, user.getId());
		} catch (Exception e) {
			log.error("error occured while deleting bookmark watches" + e.getMessage());
		}
	}

	public void deleteBookmarkWatchesByBookmarkId(Long bookmarkId) {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		try {
			jdbcTemplate.update("delete from bookmark_watches where bookmark_id=? and user_id=?",
					bookmarkId, user.getId());
		} catch (Exception e) {
			log.error("error occured while deleting bookmark watches" + e.getMessage());
		}
	}

}
