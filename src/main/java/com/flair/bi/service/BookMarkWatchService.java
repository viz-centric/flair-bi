package com.flair.bi.service;

import com.flair.bi.domain.FeatureBookmark;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.bookmarkwatch.BookmarkWatch;
import com.flair.bi.domain.bookmarkwatch.BookmarkWatchId;
import com.flair.bi.domain.bookmarkwatch.QBookmarkWatch;
import com.flair.bi.domain.viewwatch.QViewWatch;
import com.flair.bi.domain.viewwatch.ViewWatch;
import com.flair.bi.domain.viewwatch.ViewWatchId;
import com.flair.bi.repository.BookmarkWatchRepository;
import com.flair.bi.repository.FeatureBookmarkRepository;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.repository.ViewRepository;
import com.flair.bi.repository.ViewWatchRepository;
import com.flair.bi.security.SecurityUtils;
import com.querydsl.core.types.Predicate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.Optional;

import javax.persistence.EntityNotFoundException;
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class BookMarkWatchService {

    private final UserRepository userRepository;
    
    private final BookmarkWatchRepository bookmarkWatchRepository; 
    
    private final FeatureBookmarkRepository featureBookmarkRepository;
    
    private final JdbcTemplate jdbcTemplate;
    
    public Page<BookmarkWatch> findAll(Pageable pageable, Predicate predicate) {
        return bookmarkWatchRepository
            .findAll(
                QBookmarkWatch.bookmarkWatch.user.login.eq(SecurityUtils.getCurrentUserLogin()).and(predicate), pageable);
    }

    public void saveBookmarkWatch(Long bookmarkId,Long viewId,String login, View view) {
        if (null == login || null == view || null==bookmarkId) {
            return;
        }
        Optional<User> user = userRepository.findOneByLogin(login);

	  BookmarkWatchId id = user.map(x -> {
      	BookmarkWatchId bookmarkWatchId = new BookmarkWatchId();
          bookmarkWatchId.setUserId(x.getId());
          bookmarkWatchId.setBookmarkId(bookmarkId);
          bookmarkWatchId.setViewId(viewId);
          return bookmarkWatchId;
      }).orElseThrow(IllegalArgumentException::new);


	  BookmarkWatch bookmarkWatch = bookmarkWatchRepository.findOne(id);
        if (null == bookmarkWatch) {
        	bookmarkWatch = new BookmarkWatch();
        	bookmarkWatch.setId(id);
        	bookmarkWatch.setWatchCount(1L);
        	bookmarkWatch.setUser(user.orElseThrow(IllegalArgumentException::new));
        	bookmarkWatch.setView(view);
        	FeatureBookmark featureBookmark=featureBookmarkRepository.findOne(bookmarkId);
        	bookmarkWatch.setFeatureBookmark(featureBookmarkRepository.findOne(bookmarkId));
        } else {
        	bookmarkWatch.setWatchCount(bookmarkWatch.getWatchCount() + 1L);
        }

        bookmarkWatch.setWatchTime(ZonedDateTime.now());
        bookmarkWatch.setWatchCreatedTime(bookmarkWatch.getWatchCreatedTime());
        bookmarkWatchRepository.save(bookmarkWatch);

    }

    @Async
    public void saveBookmarkWatchAsync(Long bookmarkId,Long viewId,String login,View view) {
    	saveBookmarkWatch(bookmarkId,viewId,login,view);
    }
    

	public int getCreatedBookmarkCount(long userId) {
		List<Integer> counts=null;
		int count=0;
		try {			
			counts =jdbcTemplate.query("select count(*) as count  from bookmark_watches where user_id=?",    
					new Object[] {userId}, new RowMapper<Integer>() {
						public Integer mapRow(ResultSet srs, int rowNum)
								throws SQLException {
							return srs.getInt("count") ;
						}
					});
			if(!counts.isEmpty() && counts!=null)
			count=counts.get(0);

		} catch (Exception e) {
			log.error("error occured while getting created bookmarks count" + e.getMessage());
		} 
		return count;
	}
}
