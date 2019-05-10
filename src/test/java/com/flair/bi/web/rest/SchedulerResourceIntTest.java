

package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.domain.User;
import com.flair.bi.service.DatasourceConstraintService;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.scheduler.AssignReport;
import com.flair.bi.service.dto.scheduler.ReportDTO;
import com.flair.bi.service.dto.scheduler.ReportLineItem;
import com.flair.bi.service.dto.scheduler.Schedule;
import com.flair.bi.service.dto.scheduler.SchedulerDTO;
import com.flair.bi.service.dto.scheduler.emailsDTO;
import com.flair.bi.view.VisualMetadataService;
import com.project.bi.query.dto.QueryDTO;

import org.assertj.core.util.Arrays;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import javax.inject.Inject;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;

@Ignore
public class SchedulerResourceIntTest extends AbstractIntegrationTest{

    private MockMvc restSchedulerResourceMockMvc;
    
    private SchedulerDTO schedulerDTO;
    
    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;
    
    @Inject
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;
    
    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;   
    
    @Inject
    private UserService userService;
    
    @Inject
	private  DatasourceConstraintService datasourceConstraintService;
    
    @Inject
	private  VisualMetadataService visualMetadataService;
    
    @Inject
	private  DatasourceService datasourceService;
	
    
    public SchedulerDTO createScheduledObject() {
    	SchedulerDTO schedulerDTO = new SchedulerDTO();
    	schedulerDTO.setCron_exp("14 */16 * * *");
    	schedulerDTO.setUserid("flairadmin");
    	schedulerDTO.setVisualizationid("90497569e61f113349fb082eb9000341--45d994f6-acad-4103-a87b-b7bf9fbc6c2a4");
    	ReportDTO reportDTO= new ReportDTO();
    	reportDTO.setConnection_name("Transactions");
    	reportDTO.setSource_id("Transactions");
    	reportDTO.setMail_body("this is a test email");
    	reportDTO.setReport_name("Clustered-Vertical-Bar-Chart-90497569e61f113349fb082eb9000341--45d994f6-acad-4103-a87b-b7bf9fbc6c2a4");
    	reportDTO.setSubject("Clustered Vertical Bar Chart Report");
    	reportDTO.setTitle_name("Clustered Vertical Bar Chart");
    	schedulerDTO.setReport(reportDTO);
    	
    	ReportLineItem reportLineItem= new ReportLineItem();
    	List<String> fields= new ArrayList<String>();//("State"), "COUNT(Price) as Price"};
    	fields.add("State");
    	fields.add("COUNT(Price) as Price");
    	String dimentions[]= {"State"};
    	String measures[]= {"Price"};
    	List<String> groupBy= new ArrayList<String>();
    	groupBy.add("State");
    	QueryDTO queryDTO= new QueryDTO();
    	queryDTO.setFields(fields);
    	queryDTO.setGroupBy(groupBy);
    	queryDTO.setLimit(20L);
    	schedulerDTO.setQueryDTO(queryDTO);
    	reportLineItem.setVisualization("pie");
    	reportLineItem.setDimension(dimentions);
    	reportLineItem.setMeasure(measures);
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
    	schedule.setEnd_date("2021-04-15");
    	schedule.setStart_date("2021-04-09 00:00");
    	schedule.setTimezone("Asia/Kolkata");
    	schedulerDTO.setSchedule(schedule);
    	
    	
    	return schedulerDTO;
    	
    }
    
    public static User createUser(UserService userService) {
        return userService.createUser("dash-admin", "dash-admin", "pera", "pera", "admi1@localhost", "en", "test");
    }

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        SchedulerResource schedulerResource = new SchedulerResource(userService, datasourceConstraintService, visualMetadataService, datasourceService);
        ReflectionTestUtils.setField(schedulerResource, "userService", userService); 
        this.restSchedulerResourceMockMvc = MockMvcBuilders.standaloneSetup(schedulerResource)
                .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
                .setMessageConverters(jacksonMessageConverter).build();
    }
    
    @Before
    public void initTest() {
    	schedulerDTO = createScheduledObject();
        createUser(userService);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("dash-admin", "dash-admin"));
    }

    @Test
    public void schduleReport() throws Exception {
    	restSchedulerResourceMockMvc.perform(post("/api/schedule")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(schedulerDTO)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(status().isCreated());
    	
    }
   
}
