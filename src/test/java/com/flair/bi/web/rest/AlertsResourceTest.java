package com.flair.bi.web.rest;

import com.flair.bi.FlairbiApp;
import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.dto.ReleasesAlertsDTO;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Arrays;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.*;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Ignore
@RunWith(SpringRunner.class)
@SpringBootTest(classes = FlairbiApp.class)
public class AlertsResourceTest {

	private MockMvc restMvc;

	@Autowired
	AlertsResource alertsResource;

	@MockBean
	ReleaseRequestService releaseRequestService;

	@Before
	public void setUp() throws Exception {
		restMvc = MockMvcBuilders.standaloneSetup(alertsResource).build();
	}

	@Test
	public void getReleaseAlerts() throws Exception {
		when(releaseRequestService.getTodaysReleasedAlerts(eq(0))).thenReturn(Arrays.asList(
				new ReleasesAlertsDTO("myRelease", "myComment", "myName", Timestamp.from(Instant.ofEpochSecond(1550510210)))
		));

		restMvc.perform(get("/api/release-alerts/1/0")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.[0].releaseType").value(is("myRelease")))
				.andExpect(jsonPath("$.[0].releaseName").value(is("myName")))
				.andExpect(jsonPath("$.[0].lastModifiedDate").value(is(1550510210000L)))
				.andExpect(jsonPath("$.[0].releaseComments").value(is("myComment")));
	}

	@Test
	public void getAllReleaseAlerts() throws Exception {
		restMvc.perform(get("/api/release-all-alerts")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
				.andExpect(jsonPath("$.[0].id").value(is(1)))
				.andExpect(jsonPath("$.[0].name").value(is("Today")))
				.andExpect(jsonPath("$.[0].alerts.length()").value(is(0)))
				.andExpect(jsonPath("$.[0].count").value(is(0)))
				.andExpect(jsonPath("$.[1].id").value(is(2)))
				.andExpect(jsonPath("$.[1].name").value(is("Yesterday")))
				.andExpect(jsonPath("$.[1].alerts.length()").value(is(0)))
				.andExpect(jsonPath("$.[1].count").value(is(0)))
				.andExpect(jsonPath("$.[2].id").value(is(3)))
				.andExpect(jsonPath("$.[2].name").value(is("This Week")))
				.andExpect(jsonPath("$.[2].alerts.length()").value(is(0)))
				.andExpect(jsonPath("$.[2].count").value(is(0)))
				.andExpect(jsonPath("$.[3].id").value(is(4)))
				.andExpect(jsonPath("$.[3].name").value(is("Last Week")))
				.andExpect(jsonPath("$.[3].alerts.length()").value(is(0)))
				.andExpect(jsonPath("$.[3].count").value(is(0)))
				.andExpect(jsonPath("$.[4].id").value(is(5)))
				.andExpect(jsonPath("$.[4].name").value(is("Older")))
				.andExpect(jsonPath("$.[4].alerts.length()").value(is(0)))
				.andExpect(jsonPath("$.[4].count").value(is(0)));
	}
}