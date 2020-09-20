package com.flair.bi.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;

/**
 * A FileUploaderStatus.
 */
@Entity
@Table(name = "file_uploader_status")
public class FileUploaderStatus implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	@Column(name = "file_system", nullable = false)
	private String fileSystem;

	@NotNull
	@Column(name = "file_name", nullable = false)
	private String fileName;

	@Column(name = "content_type")
	private String contentType;

	@NotNull
	@Column(name = "is_file_processed", nullable = false)
	private Boolean isFileProcessed;

	@Column(name = "file_location")
	private String fileLocation;

	@ManyToOne
	private Realm realm;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFileSystem() {
		return fileSystem;
	}

	public FileUploaderStatus fileSystem(String fileSystem) {
		this.fileSystem = fileSystem;
		return this;
	}

	public void setFileSystem(String fileSystem) {
		this.fileSystem = fileSystem;
	}

	public String getFileName() {
		return fileName;
	}

	public FileUploaderStatus fileName(String fileName) {
		this.fileName = fileName;
		return this;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getContentType() {
		return contentType;
	}

	public FileUploaderStatus contentType(String contentType) {
		this.contentType = contentType;
		return this;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public Boolean isIsFileProcessed() {
		return isFileProcessed;
	}

	public FileUploaderStatus isFileProcessed(Boolean isFileProcessed) {
		this.isFileProcessed = isFileProcessed;
		return this;
	}

	public void setIsFileProcessed(Boolean isFileProcessed) {
		this.isFileProcessed = isFileProcessed;
	}

	public String getFileLocation() {
		return fileLocation;
	}

	public FileUploaderStatus fileLocation(String fileLocation) {
		this.fileLocation = fileLocation;
		return this;
	}

	public void setFileLocation(String fileLocation) {
		this.fileLocation = fileLocation;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		FileUploaderStatus fileUploaderStatus = (FileUploaderStatus) o;
		if (fileUploaderStatus.id == null || id == null) {
			return false;
		}
		return Objects.equals(id, fileUploaderStatus.id);
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(id);
	}

	@Override
	public String toString() {
		return "FileUploaderStatus{" + "id=" + id + ", fileSystem='" + fileSystem + "'" + ", fileName='" + fileName
				+ "'" + ", contentType='" + contentType + "'" + ", isFileProcessed='" + isFileProcessed + "'"
				+ ", fileLocation='" + fileLocation + "'" + '}';
	}

	public Realm getRealm() {
		return realm;
	}

	public void setRealm(Realm realm) {
		this.realm = realm;
	}
}
