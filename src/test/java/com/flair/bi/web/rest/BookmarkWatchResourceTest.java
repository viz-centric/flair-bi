package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.bookmarkwatch.BookmarkWatch;
import com.flair.bi.domain.bookmarkwatch.BookmarkWatchId;
import com.flair.bi.service.BookMarkWatchService;
import com.flair.bi.service.UserService;
import com.querydsl.core.types.Predicate;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Arrays;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Ignore
public class BookmarkWatchResourceTest extends AbstractIntegrationTest {

	MockMvc restMvc;

	@Autowired
	BookmarkWatchResource bookmarkWatchResource;

	@Autowired
	WebApplicationContext webApplicationContext;

	@MockBean
	BookMarkWatchService bookMarkWatchService;

	@MockBean
	UserService userService;

	@Before
	public void setUp() throws Exception {
		restMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
	}

	@Test
	public void getBookmarkWatchs() throws Exception {
		BookmarkWatch bookmarkWatch = new BookmarkWatch();
		bookmarkWatch.setWatchCount(3L);
		BookmarkWatchId id = new BookmarkWatchId();
		id.setBookmarkId(20L);
		bookmarkWatch.setId(id);
		User user = new User();
		user.setId(7L);
		bookmarkWatch.setUser(user);
		View view = new View();
		view.setId(10L);
		bookmarkWatch.setView(view);
		when(bookMarkWatchService.findAll(any(Pageable.class), any(Predicate.class))).thenReturn(
				new PageImpl<>(Arrays.asList(bookmarkWatch), PageRequest.of(1, 10, Sort.Direction.DESC, "user"), 10));

		restMvc.perform(get("/api/bookmark-watches").accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.[0].id.bookmarkId").value(is(20)))
				.andExpect(jsonPath("$.[0].user.id").value(is(7))).andExpect(jsonPath("$.[0].view.id").value(is(10)))
				.andExpect(jsonPath("$.[0].watchTime").value(notNullValue()))
				.andExpect(jsonPath("$.[0].watchCreatedTime").value(notNullValue()))
				.andExpect(jsonPath("$.[0].watchCount").value(is(3)));
	}

	@Test
	public void getCreatedBookmarkWatchsCount() throws Exception {
		User user = new User();
		user.setId(10L);
		when(userService.getUserWithAuthoritiesByLogin(anyString())).thenReturn(Optional.of(user));
		when(bookMarkWatchService.getCreatedBookmarkCount()).thenReturn(20);

		restMvc.perform(get("/api/bookmark-watches/recently-created/count").accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.count").value(is(20)));
	}
}