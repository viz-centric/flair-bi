package com.flair.bi.web.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import javax.inject.Inject;
import javax.persistence.EntityManager;

import com.flair.bi.AbstractIntegrationTest;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewRelease;

import com.flair.bi.release.ReleaseRequestService;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.mapper.ReleaseRequestMapper;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.dto.CreateViewReleaseRequestDTO;

import static org.hamcrest.CoreMatchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Ignore
public class ReleaseResourceIntTest extends AbstractIntegrationTest {

    @Inject
    private ReleaseRequestService releaseRequestService;

    @Inject
    private ReleaseRequestMapper releaseRequestMapper;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private EntityManager em;

    private MockMvc restReleasesMockMvc;

    @Inject
    private DashboardService dashboardService;

    @Inject
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;

    @Inject
    private UserService userService;

    @Inject
    private ViewService viewService;

    private static final String RELEASE_COMMENT = "Released";

    private View view;

    private User user;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ReleaseResource releaseResource = new ReleaseResource(releaseRequestService, releaseRequestMapper);
        ReflectionTestUtils.setField(releaseResource, "releaseRequestService", releaseRequestService);
        this.restReleasesMockMvc = MockMvcBuilders.standaloneSetup(releaseResource)
                .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
                .setMessageConverters(jacksonMessageConverter).build();
    }

    public static User createUser(UserService userService) {
        return userService.createUser("dash-admin", "dash-admin", "pera", "pera", "admi1@localhost", "en", "test");
    }

    @Before
    public void initTest(){
        view = ViewResourceIntTest.createEntity(em, dashboardService);
        user = createUser(userService);
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("dash-admin", "dash-admin"));
    }

    @Test
    @Transactional
    public void getRequests() throws Exception {
        View viewInserted = viewService.save(view);
        ViewRelease viewRelease = new ViewRelease();
        viewRelease.setComment(RELEASE_COMMENT);
        viewRelease.setViewState(viewInserted.getCurrentEditingState());
        viewRelease.setView(viewInserted);
        ReleaseRequest releaseRequest = releaseRequestService.requestRelease(viewRelease);
        restReleasesMockMvc.perform(get("/api/releases")).andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.[*].comment").value(hasItem(RELEASE_COMMENT)))
                .andExpect(jsonPath("$.[*].id").value(releaseRequest.getId().intValue()));
    }

    @Test
    @Transactional
    public void getRequest() throws Exception {
        View viewInserted = viewService.save(view);
        ViewRelease viewRelease = new ViewRelease();
        viewRelease.setComment(RELEASE_COMMENT);
        viewRelease.setViewState(viewInserted.getCurrentEditingState());
        viewRelease.setView(viewInserted);
        ReleaseRequest releaseRequest = releaseRequestService.requestRelease(viewRelease);
        restReleasesMockMvc.perform(get("/api/releases/{id}", releaseRequest.getId())).andExpect(status().isOk())
                .andExpect(jsonPath("$.comment").value(RELEASE_COMMENT))
                .andExpect(jsonPath("$.id").value(releaseRequest.getId().intValue()));
    }

    @Test
    @Transactional
    public void approveRequest() throws Exception {
        View viewInserted = viewService.save(view);
        ViewRelease viewRelease = new ViewRelease();
        viewRelease.setComment(RELEASE_COMMENT);
        viewRelease.setViewState(viewInserted.getCurrentEditingState());
        viewRelease.setView(viewInserted);
        ReleaseRequest releaseRequest = releaseRequestService.requestRelease(viewRelease);
        restReleasesMockMvc.perform(put("/api/releases/{id}/approve", releaseRequest.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @Transactional
    public void rejectRequest() throws Exception {
        View viewInserted = viewService.save(view);
        ViewRelease viewRelease = new ViewRelease();
        viewRelease.setComment(RELEASE_COMMENT);
        viewRelease.setViewState(viewInserted.getCurrentEditingState());
        viewRelease.setView(viewInserted);
        ReleaseRequest releaseRequest = releaseRequestService.requestRelease(viewRelease);
        restReleasesMockMvc.perform(put("/api/releases/{id}/reject", releaseRequest.getId()))
                .andExpect(status().isOk());
    }

}
