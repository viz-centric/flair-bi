package com.flair.bi.web.rest;

import javax.annotation.PostConstruct;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.ApplicationProperties;
import com.flair.bi.service.dto.ConfigurationDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AppPropertiesResource {

	private final ApplicationProperties applicationProperties;

	private String maxImageSize;

	private String maxDataFileSize;

	@PostConstruct
	public void init() {
		this.maxDataFileSize = applicationProperties.getImageUpload().getMaxSizeMb();
		this.maxDataFileSize = applicationProperties.getStorageUpload().getMaxSizeMb();
	}

	@GetMapping("/properties")
	public ResponseEntity<ConfigurationDTO> getProperties() {
		log.debug("REST request to get properties");
		return ResponseEntity.ok().body(new ConfigurationDTO(maxImageSize, maxDataFileSize));
	}

}
