package com.flair.bi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@Configuration
public class ImageUrlConfiguration extends WebMvcConfigurerAdapter {

	@Value("${image-location}")
	private String imageLocation;
	
	@Value("${storage-data-files}")
	private String storageDataFiles;

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/"+imageLocation+"**","/"+storageDataFiles+"**").addResourceLocations("file:" + imageLocation,"file:" + storageDataFiles);
	}

}
