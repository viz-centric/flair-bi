package com.flair.bi.view;

import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewState;
import org.ektorp.util.Documents;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = FlairbiApp.class)
public class ViewCouchDbTests {


    @Test
    public void viewDocumentAccessorCheck() {
        ViewState view = new ViewState();
        Documents.setId(view, "my_id");
        assertEquals("my_id", Documents.getId(view));
        assertTrue(Documents.isNew(view));
    }
}
