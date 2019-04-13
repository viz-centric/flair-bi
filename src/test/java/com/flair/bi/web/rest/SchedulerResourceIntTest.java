

package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.FlairbiApp;
import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.config.Constants;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.User;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.MailService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.scheduler.AssignReport;
import com.flair.bi.service.dto.scheduler.ReportDTO;
import com.flair.bi.service.dto.scheduler.ReportLineItem;
import com.flair.bi.service.dto.scheduler.Schedule;
import com.flair.bi.service.dto.scheduler.SchedulerDTO;
import com.flair.bi.service.dto.scheduler.emailsDTO;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.vm.ChangePermissionVM;
import com.flair.bi.web.rest.vm.ChangePermissionVM.Action;
import com.flair.bi.web.rest.vm.ManagedUserVM;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import javax.inject.Inject;
import javax.persistence.EntityManager;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;


/**
 * Test class for the UserResource REST controller.
 *
 * @see UserResource
 */
@Ignore
public class SchedulerResourceIntTest extends AbstractIntegrationTest{

    private MockMvc restSchedulerResourceMockMvc;

    @Mock
    private AccessControlManager accessControlManager;

    
    private static final String LOGIN = "test";
    private static final String FIRST_NAME = "test";
    private static final String LAST_NAME = "test";
    private static final String PASSWORD = "test";
    private static final String LANG_KEY = "en";
    private static final String EMAIL = "test@test.com";
    private static final Boolean ACTIVATED = true;
    private static final String ROLE_NAME = "ROLE_USER";
    private static final String USER_TYPE = "test";
    
    private static final String UPDATED_LOGIN = "test1";
    private static final String UPDATED_FIRST_NAME = "test1";
    private static final String UPDATED_LAST_NAME = "test1";
    private static final String UPDATED_PASSWORD = "test1";
    private static final String UPDATED_LANG_KEY = "fr";
    private static final String UPDATED_EMAIL = "test1@test1.com";
    private static final String UPDATED_ROLE_NAME = "ROLE_ADMIN";
    private static final String UPDATED_USER_TYPE = "test1";
    
    private SchedulerDTO schedulerDTO;
    
    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;
    
    @Inject
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;
    
    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    /**
     * Create a User.
     * <p>
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which has a required relationship to the User entity.
     */
    public static User createEntity(UserService userService) {
        return userService.createUser(LOGIN,PASSWORD,FIRST_NAME,LAST_NAME,EMAIL,LANG_KEY,USER_TYPE);
    }
    
    
    public SchedulerDTO createScheduledObject() {
    	SchedulerDTO schedulerDTO = new SchedulerDTO();
    	schedulerDTO.setCron_exp("14 */16 * * *");
    	schedulerDTO.setUserid("flairadmin");
    	ReportDTO reportDTO= new ReportDTO();
    	reportDTO.setConnection_name("Transactions");
    	reportDTO.setMail_body("this is a test email");
    	reportDTO.setReport_name("Cludsdstersssed-Vertisscal-Bar-Chart-90497569e61f113349fb082eb9000341--45d994f6-acad-4103-a87b-b7bf9fbc6c2a");
    	reportDTO.setSubject("Clustered Vertical Bar Chart Report");
    	reportDTO.setTitle_name("Clustered Vertical Bar Chart");
    	schedulerDTO.setReport(reportDTO);
    	
    	ReportLineItem reportLineItem= new ReportLineItem();
    	String fields[]= {"State", "COUNT(Price) as Price"};
    	String groupBy[]= {"State"};
    	String orderBy[]= {};
    	reportLineItem.setQuery_name("");
    	reportLineItem.setFields(fields);
    	reportLineItem.setGroup_by(groupBy);
    	reportLineItem.setOrder_by(orderBy);
    	reportLineItem.setLimit(20);
    	reportLineItem.setTable("Transactions");
    	reportLineItem.setVisualization("pie");
    	reportLineItem.setWhere(null);
    	schedulerDTO.setReport_line_item(reportLineItem);
    	
    	AssignReport assignReport= new AssignReport();
    	emailsDTO emailsDTO= new emailsDTO();
    	emailsDTO.setUser_email("example@localhost.com");
    	emailsDTO.setUser_name("example");
    	emailsDTO emailList[]= {emailsDTO};
    	assignReport.setEmail_list(emailList);
    	assignReport.setChannel("email");
    	assignReport.setCondition("test");
    	schedulerDTO.setAssign_report(assignReport);
    	
    	Schedule schedule= new Schedule();
    	schedule.setEnd_date("2021-04-08");
    	schedule.setStart_date("2021-04-09 00:00");
    	schedule.setTimezone("Asia/Kolkata");
    	schedulerDTO.setSchedule(schedule);
    	
    	
    	return schedulerDTO;
    	
    }

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        SchedulerResource schedulerResource = new SchedulerResource();       
        this.restSchedulerResourceMockMvc = MockMvcBuilders.standaloneSetup(schedulerResource)
                .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
                .setMessageConverters(jacksonMessageConverter).build();
    }
    
    @Before
    public void initTest() {
    	schedulerDTO = createScheduledObject();
    }

//    @Test
//    @Transactional
//    public void createNewUser() throws Exception {
//    	restSchedulerResourceMockMvc.perform(post("/api/users")
//                .contentType(TestUtil.APPLICATION_JSON_UTF8)
//                .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
//                .andExpect(status().isCreated())
//                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
//                .andExpect(jsonPath("$.login").value(LOGIN))
//                .andExpect(jsonPath("$.email").value(EMAIL))
//                .andExpect(jsonPath("$.firstName").value(FIRST_NAME))
//                .andExpect(jsonPath("$.lastName").value(LAST_NAME))
//                .andExpect(jsonPath("$.langKey").value(LANG_KEY));
//        
//    }
   
}
