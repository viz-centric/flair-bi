package com.flair.bi.view;

import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertEquals;

import org.ektorp.util.Documents;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.ViewState;

@Ignore
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
