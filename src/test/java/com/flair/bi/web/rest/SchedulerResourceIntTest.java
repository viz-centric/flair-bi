

package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.User;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.SchedulerService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.scheduler.AssignReport;
import com.flair.bi.service.dto.scheduler.CommunicationList;
import com.flair.bi.service.dto.scheduler.ReportDTO;
import com.flair.bi.service.dto.scheduler.ReportLineItem;
import com.flair.bi.service.dto.scheduler.Schedule;
import com.flair.bi.service.dto.scheduler.SchedulerDTO;
import com.flair.bi.service.dto.scheduler.emailsDTO;
import com.flair.bi.view.VisualMetadataService;
import com.project.bi.query.dto.FieldDTO;
import com.project.bi.query.dto.QueryDTO;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
	private  VisualMetadataService visualMetadataService;
    
    @Inject
	private  DatasourceService datasourceService;
    
    @Inject
    private GrpcQueryService grpcQueryService;
    
    @Inject
    private SchedulerService schedulerService;
    
    public SchedulerDTO createScheduledObject() {
    	SchedulerDTO schedulerDTO = new SchedulerDTO();
    	ReportDTO reportDTO= new ReportDTO();
    	reportDTO.setMail_body("this is a test email");
    	reportDTO.setReport_name("Clustered-Vertical-Bar-Chart-90497569e61f113349fb082eb9000341--45d994f6-acad-4103-a87b-b7bf9fbc6c2a4");
    	reportDTO.setSubject("Clustered Vertical Bar Chart Report");
    	reportDTO.setTitle_name("Clustered Vertical Bar Chart");
    	reportDTO.setUserid("flairadmin");
    	schedulerDTO.setReport(reportDTO);
    	
    	ReportLineItem reportLineItem= new ReportLineItem();
    	List<String> fields= new ArrayList<String>();
    	fields.add("State");
    	fields.add("COUNT(Price) as Price");
    	String dimentions[]= {"State"};
    	String measures[]= {"Price"};
    	String channel[]={"email"};
    	QueryDTO queryDTO= new QueryDTO();
    	queryDTO.setFields(new ArrayList<>());
    	queryDTO.setGroupBy(Arrays.asList(new FieldDTO("State")));
    	queryDTO.setLimit(20L);
    	queryDTO.setOffset(53L);
    	schedulerDTO.setQueryDTO(queryDTO);
    	reportLineItem.setVisualization("pie");
    	reportLineItem.setDimension(dimentions);
    	reportLineItem.setMeasure(measures);
    	reportLineItem.setVisualizationid("90497569e61f113349fb082eb9000341--45d994f6-acad-4103-a87b-b7bf9fbc6c2a4");
    	schedulerDTO.setReport_line_item(reportLineItem);
    	CommunicationList communicationList= new CommunicationList();
    	AssignReport assignReport= new AssignReport();
    	emailsDTO emailsDTO= new emailsDTO();
    	emailsDTO.setUser_email("example@localhost.com");
    	emailsDTO.setUser_name("example");
    	emailsDTO emailList[]= {emailsDTO};
    	communicationList.setEmail(emailList);
    	assignReport.setCommunication_list(communicationList);
    	assignReport.setChannel(channel);
    	schedulerDTO.setAssign_report(assignReport);
    	
    	Schedule schedule= new Schedule();
    	schedule.setEnd_date("2021-04-15");
    	schedule.setStart_date("2021-04-09 00:00");
    	schedule.setTimezone("Asia/Kolkata");
    	schedule.setCron_exp("14 */16 * * *");
    	schedulerDTO.setSchedule(schedule);
    	
    	return schedulerDTO;
    	
    }
    
    public static User createUser(UserService userService) {
        return userService.createUser("dash-admin", "dash-admin", "pera", "pera", "admi1@localhost", "en", "test");
    }

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
		SchedulerResource schedulerResource = new SchedulerResource(visualMetadataService, datasourceService,
				schedulerService);
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
