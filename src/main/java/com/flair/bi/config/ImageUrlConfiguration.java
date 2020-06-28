package com.flair.bi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.flair.bi.ApplicationProperties;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class ImageUrlConfiguration implements WebMvcConfigurer {

	private final ApplicationProperties properties;

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		final String imageLocation = properties.getImageUpload().getLocation();
		final String storageDataFiles = properties.getStorageUpload().getMaxSizeMb();
		registry.addResourceHandler("/" + imageLocation + "**", "/" + storageDataFiles + "**")
				.addResourceLocations("file:" + imageLocation, "file:" + storageDataFiles);
	}

}
