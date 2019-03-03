package com.flair.bi.web.rest;

import java.net.URISyntaxException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;

import javax.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.service.FileUploadService;
import com.flair.bi.service.FileUploaderStatusService;
import com.flair.bi.service.dto.FileUploaderDTO;
import com.flair.bi.service.dto.FileUploaderStatusDTO;
import com.flair.bi.web.rest.dto.ResponseDTO;
import com.flair.bi.web.rest.util.PaginationUtil;

import io.swagger.annotations.ApiParam;

@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class FileUploaderResource {

	private final FileUploadService imageUploadService;
	private final FileUploaderStatusService fileUploaderStatusService; 

	@PostMapping("/file-upload")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('FILE_UPLOADER', 'WRITE', 'APPLICATION')")
	public ResponseEntity<ResponseDTO> scheduleReport(@Valid @RequestBody FileUploaderDTO fileUploaderDTO)
			throws Exception {
		try {
			String location=imageUploadService.uploadedCSVFile(fileUploaderDTO.getFile(), fileUploaderDTO.getContentType(),getFileName(fileUploaderDTO.getFileName()),fileUploaderDTO.getFileName());
			fileUploaderStatusService.save(new FileUploaderStatusDTO(fileUploaderDTO.getFileSystem(),getFileName(fileUploaderDTO.getFileName()), "csv", false,location));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage()));
		}
		return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseDTO(HttpStatus.CREATED, "file is uploaded successfully"));
	}
	
	private String getFileName(String name){
		StringBuilder fileName= new StringBuilder();
		fileName.append(name);
		fileName.append("_");
		fileName.append(new SimpleDateFormat("yyyyMMddHHmmss").format(Calendar.getInstance().getTime()));
		return fileName.toString();
		
	}
	
	
}


