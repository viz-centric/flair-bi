package com.flair.bi.service.dto;

import java.io.Serializable;
import java.util.Objects;

import javax.validation.constraints.NotNull;

/**
 * A DTO for the FileUploaderStatus entity.
 */
public class FileUploaderStatusDTO implements Serializable {

	private Long id;

	@NotNull
	private String fileSystem;

	@NotNull
	private String fileName;

	private String contentType;

	@NotNull
	private Boolean isFileProcessed;

	private String fileLocation;

	public FileUploaderStatusDTO() {
	}

	public FileUploaderStatusDTO(String fileSystem, String fileName, String contentType, Boolean isFileProcessed,
			String fileLocation) {
		super();
		this.fileSystem = fileSystem;
		this.fileName = fileName;
		this.contentType = contentType;
		this.isFileProcessed = isFileProcessed;
		this.fileLocation = fileLocation;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFileSystem() {
		return fileSystem;
	}

	public void setFileSystem(String fileSystem) {
		this.fileSystem = fileSystem;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public Boolean getIsFileProcessed() {
		return isFileProcessed;
	}

	public void setIsFileProcessed(Boolean isFileProcessed) {
		this.isFileProcessed = isFileProcessed;
	}

	public String getFileLocation() {
		return fileLocation;
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

		FileUploaderStatusDTO fileUploaderStatusDTO = (FileUploaderStatusDTO) o;

		if (!Objects.equals(id, fileUploaderStatusDTO.id))
			return false;

		return true;
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(id);
	}

	@Override
	public String toString() {
		return "FileUploaderStatusDTO{" + "id=" + id + ", fileSystem='" + fileSystem + "'" + ", fileName='" + fileName
				+ "'" + ", contentType='" + contentType + "'" + ", isFileProcessed='" + isFileProcessed + "'"
				+ ", fileLocation='" + fileLocation + "'" + '}';
	}
}
