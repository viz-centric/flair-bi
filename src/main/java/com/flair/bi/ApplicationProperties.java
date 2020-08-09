package com.flair.bi;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
@Getter
@Setter
public class ApplicationProperties {

	private final LdapProperties ldap = new LdapProperties();

	private final ImageUpload imageUpload = new ImageUpload();

	private final StorageData storageUpload = new StorageData();

	@Getter
	@Setter
	public class LdapProperties {
		private boolean enabled = false;
		private String url;
		private String base;
		private String userDn;
		private String password;
	}

	@Getter
	@Setter
	public class ImageUpload {

		private String location;
		private String maxSizeMb;
	}

	@Getter
	@Setter
	public class StorageData {

		private String location;
		private String maxSizeMb;

	}

}
