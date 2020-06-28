package com.flair.bi.web.rest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.service.dto.ConfigurationDTO;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@Slf4j
public class VizualizationServiceModeResource {

	@Value("${vizualization-service-mode}")
	private String vizualizationServiceMode;

	@GetMapping("/vizualizationServiceMode")
	public ResponseEntity<ConfigurationDTO> getVizualizationServiceMode() {
		log.debug("REST request to get  Vizualization Service Mode");
		ConfigurationDTO configurationDTO = new ConfigurationDTO();
		configurationDTO.setVizualizationServiceMode(vizualizationServiceMode);
		return ResponseEntity.ok().body(configurationDTO);
	}

}
