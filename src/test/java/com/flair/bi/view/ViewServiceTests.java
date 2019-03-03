package com.flair.bi.view;

import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.View;
import com.flair.bi.service.DashboardService;
import org.junit.*;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import javax.inject.Inject;
import javax.validation.ConstraintViolationException;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = FlairbiApp.class)
public class ViewServiceTests {


    @Inject
    private ViewService viewService;

    @Inject
    private DashboardService dashboardService;

    private Long id;

    @Before
    public void setup() {
        Dashboard dashboard = new Dashboard();
        dashboard.setCategory("test");
        dashboard.setDashboardName("name");
        dashboard.setDescription("desc");
        dashboard.setPublished(false);
        Datasource datasource = new Datasource();
        datasource.setId(501L);
        dashboard.setDashboardDatasource(datasource);

        id = dashboardService.save(dashboard).getId();
    }

    /**
     * Attempt to save valid view
     * <p>
     * expected result: View stored in persistence
     */
    @Test
    public void saveValidTest() {

        View view = new View();

        view.setViewName("View");
        view.setViewDashboard(dashboardService.findOne(id));

        View v = viewService.save(view);

        Assert.assertEquals(v, viewService.findOne(v.getId()));
    }

    /**
     * Attempt to save View without view name
     * <p>
     * expected result : {@link ConstraintViolationException}
     */
    @Test(expected = ConstraintViolationException.class)
    public void saveInvalidTest() {
        View view = new View();
        view.setViewDashboard(dashboardService.findOne(id));
        viewService.save(view);
    }


}
