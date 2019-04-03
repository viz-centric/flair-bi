package com.flair.bi.web.rest;

import com.flair.bi.AbstractIntegrationTest;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.service.FileUploaderStatusService;
import com.flair.bi.service.dto.FileUploaderDTO;
import com.flair.bi.service.dto.FileUploaderStatusDTO;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.*;

@Ignore
public class FileUploaderResourceTest extends AbstractIntegrationTest {

	@MockBean
	FileUploaderStatusService fileUploaderStatusService;

	@Test
	public void scheduleReport() {
		FileUploaderDTO dto = new FileUploaderDTO();
		dto.setContentType("json");
		dto.setFile("this is a content".getBytes());
		dto.setFileName("file.name");
		dto.setFileSystem("file system");

		ResponseEntity<String> response = restTemplate
				.withBasicAuth("flairuser", "flairpass")
				.exchange(getUrl() + "/api/file-upload",
						HttpMethod.POST,
						new HttpEntity<>(dto),
						String.class);

		verify(fileUploaderStatusService, times(1)).save(any(FileUploaderStatusDTO.class));
	}
}