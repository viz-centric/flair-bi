package com.flair.bi.web.rest;


import com.flair.bi.service.dto.ConfigurationDTO;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api")
@Slf4j
public class AppPropertiesResource {

    @Value("${image-max-size-mb}")
    private String maxImageSize;
    
    @Value("${data-file-max-size-mb}")
    private String maxDataFileSize;
    
    @GetMapping("/properties")
    public ResponseEntity<ConfigurationDTO> getProperties() {
        log.debug("REST request to get properties");
        return ResponseEntity.ok().body(new ConfigurationDTO(maxImageSize, maxDataFileSize));
    }

}
